import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    const event = JSON.parse(body);
    
    console.log('Webhook event received:', event.event);
    console.log('Event payload:', JSON.stringify(event.payload, null, 2));
    
    switch (event.event) {
      case 'subscription.activated':
        console.log('Processing subscription.activated');
        await handleSubscriptionActivated(event.payload.subscription.entity);
        break;
      
      case 'subscription.charged':
        console.log('Processing subscription.charged');
        await handleSubscriptionCharged(event.payload.subscription.entity);
        break;
      
      case 'subscription.halted':
        console.log('Processing subscription.halted');
        await handleSubscriptionHalted(event.payload.subscription.entity);
        break;
      
      case 'subscription.cancelled':
        console.log('Processing subscription.cancelled');
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      
      case 'payment.captured':
        console.log('Processing payment.captured');
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionActivated(subscription) {
  const userId = subscription.notes?.userId;
  console.log('handleSubscriptionActivated - userId:', userId, 'subscription:', subscription.id);
  
  if (!userId) {
    console.log('No userId found in subscription notes');
    return;
  }

  try {
    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        razorpaySubscriptionId: subscription.id,
        status: 'pro',
        currentPeriodEnd: new Date(subscription.current_end * 1000)
      }
    });
    console.log('Subscription activated successfully:', updatedSubscription);
  } catch (error) {
    console.error('Error activating subscription:', error);
  }
}

async function handleSubscriptionCharged(subscription) {
  const userId = subscription.notes?.userId;
  console.log('handleSubscriptionCharged - userId:', userId, 'subscription:', subscription.id);
  
  if (!userId) {
    console.log('No userId found in subscription notes');
    return;
  }

  try {
    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'pro',
        currentPeriodEnd: new Date(subscription.current_end * 1000)
      }
    });
    console.log('Subscription charged successfully:', updatedSubscription);
  } catch (error) {
    console.error('Error charging subscription:', error);
  }
}

async function handleSubscriptionHalted(subscription) {
  const userId = subscription.notes?.userId;
  if (!userId) return;

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'free'
    }
  });
}

async function handleSubscriptionCancelled(subscription) {
  const userId = subscription.notes?.userId;
  if (!userId) return;

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'free',
      currentPeriodEnd: null
    }
  });
}

async function handlePaymentCaptured(payment) {
  console.log('Payment captured:', payment.id);
  
  // Get the subscription ID from the payment
  const subscriptionId = payment.notes?.subscription_id;
  
  if (!subscriptionId) {
    console.log('No subscription ID found in payment');
    return;
  }

  try {
    // Find the subscription to get the user ID
    const subscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: subscriptionId }
    });

    if (!subscription) {
      console.log('No subscription found for payment:', payment.id);
      return;
    }

    // Update the subscription to pro status
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'pro',
        // Set current period end based on payment amount or subscription plan
        // You might want to calculate this based on your subscription plan
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });

    console.log('Subscription updated to pro after payment capture:', updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription after payment capture:', error);
  }
} 