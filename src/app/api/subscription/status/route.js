import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        subscription: true,
        usage: {
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPro = user.subscription?.status === 'pro';
    
    // Calculate today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const captionUsage = await prisma.usage.aggregate({
      where: {
        userId: user.id,
        feature: 'caption',
        createdAt: {
          gte: today
        }
      },
      _sum: {
        count: true
      }
    });

    const hashtagUsage = await prisma.usage.aggregate({
      where: {
        userId: user.id,
        feature: 'hashtag',
        createdAt: {
          gte: today
        }
      },
      _sum: {
        count: true
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      subscription: {
        status: user.subscription?.status || 'free',
        razorpayCustomerId: user.subscription?.razorpayCustomerId,
        razorpaySubscriptionId: user.subscription?.razorpaySubscriptionId,
        currentPeriodEnd: user.subscription?.currentPeriodEnd,
        isPro
      },
      usage: {
        caption: {
          today: captionUsage._sum.count || 0,
          limit: isPro ? 'unlimited' : 5
        },
        hashtag: {
          today: hashtagUsage._sum.count || 0,
          limit: isPro ? 'unlimited' : 5
        }
      }
    });

  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 