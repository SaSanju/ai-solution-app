import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
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
    
    if (isPro) {
      return NextResponse.json({ 
        isPro: true,
        currentUsage: '∞',
        limit: 'unlimited'
      });
    }

    // Check free usage limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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

    return NextResponse.json({ 
      isPro: false,
      currentUsage,
      limit
    });

  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 