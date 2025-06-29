import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import razorpay from '@/lib/razorpay';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    if (user.subscription?.status === 'pro') {
      return NextResponse.json({ error: 'Already subscribed to Pro' }, { status: 400 });
    }

    // Create or get Razorpay customer
    let customerId = user.subscription?.razorpayCustomerId;
    
    if (!customerId) {
      const customer = await razorpay.customers.create({
        name: user.name || 'User',
        email: user.email,
        contact: '', // Optional: Add phone number if available
        notes: {
          userId: user.id
        }
      });
      customerId = customer.id;
      
      // Create subscription record
      await prisma.subscription.create({
        data: {
          userId: user.id,
          razorpayCustomerId: customerId,
          status: 'free'
        }
      });
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID, // You'll need to create this in Razorpay dashboard
      customer_notify: 1,
      total_count: 12, // 12 months subscription
      notes: {
        userId: user.id
      }
    });

    // Create payment link for the subscription
    const paymentLink = await razorpay.paymentLink.create({
      reference_id: subscription.id,
      amount: 99900, // Amount in paise (₹999.00)
      currency: 'INR',
      description: 'AI Solution Pro - Monthly Subscription',
      customer: {
        name: user.name || 'User',
        email: user.email,
        contact: ''
      },
      notify: {
        sms: false,
        email: true
      },
      reminder_enable: true,
      notes: {
        userId: user.id,
        subscriptionId: subscription.id
      },
      callback_url: `${process.env.NEXTAUTH_URL}/subscription/success`,
      callback_method: 'get'
    });

    return NextResponse.json({ 
      subscriptionId: subscription.id, 
      paymentLinkId: paymentLink.id,
      url: paymentLink.short_url 
    });
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 