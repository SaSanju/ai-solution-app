# Freemium Model Setup Guide

This guide will help you set up the freemium model with Razorpay integration for your AI solution app.

## Features Implemented

### ✅ Free Tier
- User registration and authentication
- 5 caption generations per day
- 5 hashtag generations per day
- Basic AI models
- Community support

### ✅ Pro Tier (₹999/month)
- Unlimited caption generation
- Unlimited hashtag generation
- Priority support
- Advanced AI models
- Export & analytics
- 7-day free trial

## Database Schema

The following models have been added to support the freemium model:

### User Model (Updated)
- Added `subscription` relation
- Added `usage` relation

### Subscription Model
- `id`: Unique identifier
- `userId`: User reference
- `razorpayCustomerId`: Razorpay customer ID
- `razorpaySubscriptionId`: Razorpay subscription ID
- `status`: "free", "pro", "cancelled"
- `currentPeriodEnd`: Subscription end date
- `createdAt`, `updatedAt`: Timestamps

### Usage Model
- `id`: Unique identifier
- `userId`: User reference
- `feature`: "caption" or "hashtag"
- `count`: Usage count (default: 1)
- `createdAt`: Timestamp

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_PLAN_ID=plan_your_subscription_plan_id

# NextAuth Configuration (if not already set)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Razorpay Setup

### 1. Create Razorpay Account
1. Go to [razorpay.com](https://razorpay.com) and create an account
2. Switch to test mode for development

### 2. Create Plan
1. Go to Settings > Plans in your Razorpay dashboard
2. Create a new plan:
   - Name: "AI Solution Pro"
   - Amount: ₹99900 (in paise)
   - Currency: INR
   - Interval: Monthly
   - Description: "Monthly subscription for AI Solution Pro"
3. Copy the plan ID (starts with `plan_`) and add it to `RAZORPAY_PLAN_ID`

### 3. Set Up Webhooks
1. Go to Settings > Webhooks in your Razorpay dashboard
2. Add endpoint: `https://yourdomain.com/api/subscription/webhook`
3. Select these events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.halted`
   - `subscription.cancelled`
   - `payment.captured`
4. Copy the webhook secret and add it to `RAZORPAY_WEBHOOK_SECRET`

### 4. Get API Keys
1. Go to Settings > API Keys
2. Copy the key ID and key secret
3. Add them to your environment variables

## API Routes Created

### `/api/subscription/create-checkout-session`
- Creates Razorpay subscription and payment link
- Handles customer creation and subscription setup

### `/api/subscription/webhook`
- Processes Razorpay webhook events
- Updates user subscription status
- Handles subscription lifecycle events

### `/api/usage/track`
- Tracks user feature usage
- Enforces daily limits for free users
- Returns usage information

## Components Created

### `SubscriptionModal.jsx`
- Displays upgrade options when limits are reached
- Handles Razorpay payment link initiation
- Shows Pro features and pricing

### Subscription Pages
- `/subscription/success`: Success page after payment
- `/subscription/cancel`: Cancel page if payment is cancelled

## Usage Limits

### Free Users
- **Caption Generation**: 5 per day
- **Hashtag Generation**: 5 per day
- Limits reset daily at midnight

### Pro Users
- **Unlimited** access to all features
- No daily limits
- Priority processing

## Implementation Details

### Usage Tracking
- Usage is tracked per feature per day
- Limits are enforced before feature execution
- Pro users bypass all limits

### Subscription Management
- Automatic subscription status updates via webhooks
- Graceful handling of subscription cancellations
- Support for trial periods

### User Experience
- Clear usage indicators
- Seamless upgrade flow
- Helpful error messages when limits are reached

## Testing

### Test the Free Tier
1. Sign up with a new account
2. Try generating captions/hashtags
3. Verify usage tracking
4. Test limit enforcement

### Test the Pro Tier
1. Use Razorpay test cards:
   - Success: `4111 1111 1111 1111`
   - Failure: `4000 0000 0000 0002`
2. Complete subscription process
3. Verify unlimited access
4. Test webhook processing

### Test Webhooks (Local Development)
1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 3000`
3. Use the ngrok URL as your webhook endpoint
4. Update webhook URL in Razorpay dashboard

## Security Considerations

- All API routes are protected with authentication
- Razorpay webhook signatures are verified using HMAC SHA256
- User data is properly isolated
- Sensitive keys are stored in environment variables

## Monitoring

### Key Metrics to Track
- Free to Pro conversion rate
- Daily active users
- Feature usage patterns
- Subscription churn rate

### Logs to Monitor
- Razorpay webhook events
- Usage tracking errors
- Authentication failures
- API rate limiting

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Verify webhook endpoint URL
   - Check webhook secret
   - Ensure HTTPS in production

2. **Usage limits not working**
   - Check database connection
   - Verify user authentication
   - Review usage tracking logic

3. **Razorpay payment not working**
   - Verify API keys
   - Check plan ID
   - Ensure proper redirect URLs

### Debug Mode
Enable debug logging by adding to your environment:
```env
DEBUG=razorpay:*
```

## Next Steps

1. **Analytics Integration**: Add usage analytics and conversion tracking
2. **Email Notifications**: Send welcome emails and usage alerts
3. **Account Management**: Add subscription management dashboard
4. **Payment Methods**: Support multiple payment methods
5. **Tier Upgrades**: Add different Pro tiers with varying features

## Support

For issues or questions:
1. Check Razorpay documentation
2. Review NextAuth.js documentation
3. Check Prisma documentation
4. Review the code comments for implementation details 