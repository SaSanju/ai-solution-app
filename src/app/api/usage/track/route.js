import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

const FREE_LIMITS = {
  caption: 5,
  hashtag: 5
};

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feature } = await req.json();
    
    if (!feature || !FREE_LIMITS[feature]) {
      return NextResponse.json({ error: 'Invalid feature' }, { status: 400 });
    }

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPro = user.subscription?.status === 'pro';
    
    // Calculate today's date for usage tracking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!isPro) {
      // Check free usage limits
      const todayUsage = await prisma.usage.aggregate({
        where: {
          userId: user.id,
          feature,
          createdAt: {
            gte: today
          }
        },
        _sum: {
          count: true
        }
      });

      const currentUsage = todayUsage._sum.count || 0;
      const limit = FREE_LIMITS[feature];

      if (currentUsage >= limit) {
        return NextResponse.json({
          error: 'Usage limit reached',
          limit,
          currentUsage,
          upgradeRequired: true
        }, { status: 429 });
      }
    }

    // Track usage
    await prisma.usage.create({
      data: {
        userId: user.id,
        feature,
        count: 1
      }
    });

    // Get updated usage count
    const updatedUsage = await prisma.usage.aggregate({
      where: {
        userId: user.id,
        feature,
        createdAt: {
          gte: today
        }
      },
      _sum: {
        count: true
      }
    });

    const currentUsage = updatedUsage._sum.count || 0;

    return NextResponse.json({ 
      success: true,
      isPro,
      currentUsage,
      limit: isPro ? 'unlimited' : FREE_LIMITS[feature]
    });

  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 