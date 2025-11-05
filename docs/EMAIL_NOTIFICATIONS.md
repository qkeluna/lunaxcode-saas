# Email Notification System

**Date**: November 5, 2025
**Status**: ✅ Fully Implemented
**Email Provider**: Resend (resend.com)

---

## Overview

Lunaxcode now has a comprehensive email notification system that automatically sends emails to clients for important project events. All emails are sent using the Resend API with professional HTML templates.

## Features

### ✅ Implemented Notifications

1. **Project Created** - Welcome email when client completes onboarding
2. **PRD Generated** - Notification when admin generates the Project Requirements Document
3. **Payment Verified** - Confirmation when admin verifies payment
4. **Payment Rejected** - Alert when admin rejects payment with reason
5. **New Message** - Notification when admin sends a message (client -> admin messages are silent to reduce noise)

### Email Service Features

- **Professional HTML Templates** - Beautiful, branded email designs
- **Mobile Responsive** - All emails look great on mobile devices
- **Plain Text Fallback** - Ensures compatibility with all email clients
- **Async Sending** - Emails are sent in background, don't block API responses
- **Error Handling** - Graceful failure handling, logged but doesn't break user flow
- **Philippine Context** - Dates formatted for Asia/Manila timezone, currency in ₱

---

## Architecture

### File Structure

```
src/lib/email/
├── index.ts           # Main exports
├── service.ts         # Core Resend integration
├── templates.ts       # HTML email templates
└── notifications.ts   # High-level notification functions
```

### Email Flow

```
API Event → Notification Function → Email Template → Resend API → Client Inbox
```

Example:
```
Project Created → notifyProjectCreated() → projectCreatedEmail() → sendEmail() → Resend
```

---

## Email Templates

### 1. Project Created Email

**Trigger**: When client completes onboarding form
**Recipient**: Client email
**Template**: `projectCreatedEmail()`

**Content Includes**:
- Welcome message
- Project details (name, service, price)
- What happens next (6-step process)
- Link to project dashboard
- Expected timeline

**Example**:
```
Subject: 🎉 Your Project "Landing Page for Acme Corp" Has Been Created
```

---

### 2. PRD Generated Email

**Trigger**: When admin successfully generates PRD via AI
**Recipient**: Client email
**Template**: `prdGeneratedEmail()`

**Content Includes**:
- PRD completion announcement
- What's included in the PRD
- Next steps (review and payment)
- Link to view PRD
- Quality assurance message

**Example**:
```
Subject: ✨ Your PRD is Ready - Landing Page for Acme Corp
```

---

### 3. Payment Verified Email

**Trigger**: When admin verifies payment submission
**Recipient**: Client email
**Template**: `paymentStatusEmail()` with status='verified'

**Content Includes**:
- Payment confirmation message
- Payment details (type, amount)
- What happens next (project starts)
- Link to project dashboard
- Receipt information

**Example**:
```
Subject: ✅ Payment Verified - Landing Page for Acme Corp
```

---

### 4. Payment Rejected Email

**Trigger**: When admin rejects payment submission
**Recipient**: Client email
**Template**: `paymentStatusEmail()` with status='rejected'

**Content Includes**:
- Payment rejection notice
- Reason for rejection
- Payment details
- How to resubmit
- Link to payment page
- Support contact info

**Example**:
```
Subject: ⚠️ Payment Update Required - Landing Page for Acme Corp
```

---

### 5. New Message Email

**Trigger**: When admin sends message to client
**Recipient**: Client email
**Template**: `newMessageEmail()`

**Content Includes**:
- Sender name
- Message preview (first 150 characters)
- Link to messages page
- Project name

**Note**: Client -> Admin messages do NOT trigger emails to reduce admin inbox noise.

**Example**:
```
Subject: 💬 New Message from Admin - Landing Page for Acme Corp
```

---

## Configuration

### Environment Variables

Required in `.env.local` and Cloudflare Pages:

```env
# Resend API Key (required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email addresses
REPLY_TO_EMAIL=support@lunaxcode.site    # Optional, defaults to support
ADMIN_EMAIL=admin@lunaxcode.site          # Optional, for admin alerts
CONTACT_EMAIL=contact@lunaxcode.site      # Optional, for contact form

# App URL for email links
NEXT_PUBLIC_APP_URL=https://app.lunaxcode.site
```

### Resend Setup

1. **Create Account**: Sign up at [resend.com](https://resend.com)
2. **Get API Key**: Go to API Keys → Create API Key
3. **Domain Verification** (Optional but recommended):
   - Add your domain in Resend dashboard
   - Add DNS records (SPF, DKIM, DMARC)
   - Verify domain
   - Update `fromEmail` in `service.ts` to use your domain

**Test Mode**: Without domain verification, Resend can only send to your verified email address. Perfect for development.

**Production Mode**: After domain verification, you can send to any email address.

---

## API Integration

### Project Creation
**File**: `src/app/api/projects/create-from-onboarding/route.ts`

```typescript
import { notifyProjectCreated } from '@/lib/email';

// After project created successfully
notifyProjectCreated(clientEmail, {
  clientName,
  projectName: project.name,
  serviceName,
  price: service.basePrice,
  projectUrl,
});
```

---

### PRD Generation
**File**: `src/app/api/admin/projects/[id]/generate-prd/route.ts`

```typescript
import { notifyPRDGenerated } from '@/lib/email';

// After PRD and tasks generated successfully
notifyPRDGenerated(project.clientEmail, {
  clientName: project.clientName,
  projectName: project.name,
  projectUrl,
});
```

---

### Payment Verification
**File**: `src/app/api/admin/payments/[id]/route.ts`

```typescript
import { notifyPaymentStatus } from '@/lib/email';

// After payment status updated
notifyPaymentStatus(project.clientEmail, {
  clientName: project.clientName,
  projectName: project.name,
  paymentType: payment.paymentType,
  amount: payment.amount,
  status: 'verified' | 'rejected',
  rejectionReason: 'Optional reason',
  projectUrl,
});
```

---

### New Message
**File**: `src/app/api/messages/route.ts`

```typescript
import { notifyNewMessage } from '@/lib/email';

// After admin sends message (only admin -> client)
if (isAdmin) {
  notifyNewMessage(project.clientEmail, {
    clientName: project.clientName,
    projectName: project.name,
    senderName: session.user.name || 'Admin',
    messagePreview: content.substring(0, 150),
    projectUrl,
  });
}
```

---

## Usage Examples

### Sending Notifications

```typescript
import { notifyProjectCreated } from '@/lib/email';

const result = await notifyProjectCreated('client@example.com', {
  clientName: 'Juan dela Cruz',
  projectName: 'E-Commerce Website for Sari-Sari Store',
  serviceName: 'E-Commerce',
  price: 75000,
  projectUrl: 'https://app.lunaxcode.site/projects/123',
});

if (result.success) {
  console.log('Email sent:', result.emailId);
} else {
  console.error('Email failed:', result.error);
}
```

### Custom Admin Notification

```typescript
import { notifyAdmin } from '@/lib/email';

await notifyAdmin(
  'New Project Submission',
  'A new client has submitted a project that requires review.',
  {
    'Client Name': 'Juan dela Cruz',
    'Project Type': 'E-Commerce',
    'Budget': '₱75,000',
    'Submitted': new Date().toLocaleString('en-PH'),
  }
);
```

---

## Email Design

### Brand Colors
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Error: `#dc2626` (Red)

### Typography
- Font: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- Heading: 28px, bold
- Body: 16px, regular
- Small: 14px, regular

### Layout
- Max width: 600px
- Mobile-first responsive design
- Padding: 30-40px
- Border radius: 8px
- Gradient header with brand colors

---

## Testing

### Development Testing

1. **Update Environment Variables**:
   ```env
   RESEND_API_KEY=re_your_test_key
   ```

2. **Test Each Notification**:
   ```bash
   # Test project creation
   curl -X POST http://localhost:3000/api/projects/create-from-onboarding \
     -H "Content-Type: application/json" \
     -d '{"serviceId": 1, "clientEmail": "your@email.com", ...}'

   # Test PRD generation (admin only)
   curl -X POST http://localhost:3000/api/admin/projects/1/generate-prd \
     -H "Content-Type: application/json"

   # Test payment verification (admin only)
   curl -X PATCH http://localhost:3000/api/admin/payments/1 \
     -H "Content-Type: application/json" \
     -d '{"status": "verified"}'

   # Test new message
   curl -X POST http://localhost:3000/api/messages \
     -H "Content-Type: application/json" \
     -d '{"projectId": 1, "content": "Test message"}'
   ```

3. **Check Logs**:
   ```bash
   # Look for email sending logs
   ✅ Project creation email sent: msg_xxxxx
   ✅ PRD notification email sent: msg_xxxxx
   ✅ Payment status email sent: msg_xxxxx
   ✅ New message email sent: msg_xxxxx
   ```

4. **Check Resend Dashboard**:
   - Go to https://resend.com/emails
   - View sent emails
   - Check delivery status
   - Preview email content

---

## Error Handling

### Graceful Failures

All email notifications use async/await with try-catch to ensure they never block API responses:

```typescript
notifyProjectCreated(email, data)
  .then((result) => {
    if (result.success) {
      console.log('✅ Email sent:', result.emailId);
    } else {
      console.error('❌ Email failed:', result.error);
    }
  })
  .catch((error) => {
    console.error('❌ Email error:', error);
  });

// API returns success immediately, email sends in background
return NextResponse.json({ success: true });
```

### Common Errors

**1. API Key Not Configured**
```
Error: RESEND_API_KEY is not configured
Solution: Add RESEND_API_KEY to environment variables
```

**2. Invalid Email Address**
```
Error: Invalid recipient email: Email must contain a domain
Solution: Check email validation, ensure proper format
```

**3. Domain Not Verified (Production)**
```
Error: Can only send to verified emails in test mode
Solution: Verify domain in Resend dashboard or use test email
```

**4. Rate Limit Exceeded**
```
Error: Rate limit exceeded
Solution: Upgrade Resend plan or reduce email frequency
```

---

## Best Practices

### Do's ✅
- Always validate email addresses before sending
- Use async sending (don't await in API routes)
- Log success and errors for debugging
- Include unsubscribe links (future enhancement)
- Test emails before production deployment
- Use environment-specific sender addresses

### Don'ts ❌
- Don't block API responses waiting for emails
- Don't send emails for every minor event
- Don't expose email sending errors to clients
- Don't send duplicate notifications
- Don't hardcode email addresses
- Don't send client -> admin message notifications

---

## Future Enhancements

### Planned Features
1. **Project Status Change Notifications** - When admin changes project status
2. **Task Assignment Notifications** - When tasks are assigned
3. **Deadline Reminders** - Automated reminders for approaching deadlines
4. **Email Preferences** - Allow clients to configure notification settings
5. **Digest Emails** - Weekly summary of project updates
6. **Admin Digest** - Daily summary of client activities
7. **Email Templates in Database** - Customizable templates via admin dashboard
8. **A/B Testing** - Test different email designs
9. **Analytics** - Track open rates, click rates
10. **Transactional Emails** - Receipts, invoices

### Enhancement Ideas
- Rich text email editor for admins
- Email template preview in admin dashboard
- Scheduled email sending
- Email queue with retry logic
- Multi-language support for international clients
- SMS notifications via Twilio integration

---

## Troubleshooting

### Email Not Received

1. **Check spam folder** - Emails might be filtered
2. **Verify API key** - Ensure RESEND_API_KEY is correct
3. **Check logs** - Look for error messages
4. **Test with different email** - Try another address
5. **Check Resend dashboard** - See delivery status
6. **Verify domain** - Ensure DNS records are correct

### Email Looks Broken

1. **Test in multiple clients** - Gmail, Outlook, Apple Mail
2. **Check HTML structure** - Ensure valid HTML
3. **Test with Email on Acid** - Professional email testing
4. **Review inline styles** - Email clients need inline CSS
5. **Check image loading** - Some clients block images

### Performance Issues

1. **Use async sending** - Don't wait for email responses
2. **Batch notifications** - Group multiple emails
3. **Queue system** - Implement email queue (future)
4. **Monitor rate limits** - Track Resend usage
5. **Optimize templates** - Reduce HTML size

---

## Support

**Resend Documentation**: https://resend.com/docs
**Resend Status**: https://status.resend.com
**Resend Support**: support@resend.com

**Email Validation Library**: `src/lib/validations/email.ts`
**Email Service**: `src/lib/email/service.ts`
**Email Templates**: `src/lib/email/templates.ts`

---

## Summary

The email notification system is now fully operational and integrated into the following events:

| Event | Trigger | Recipient | Template |
|-------|---------|-----------|----------|
| Project Created | Onboarding completion | Client | Welcome email |
| PRD Generated | Admin generates PRD | Client | PRD ready |
| Payment Verified | Admin verifies payment | Client | Confirmation |
| Payment Rejected | Admin rejects payment | Client | Rejection notice |
| New Message | Admin sends message | Client | Message alert |

All emails are sent asynchronously and do not block API responses. The system is production-ready and scalable.

---

**Implementation Date**: November 5, 2025
**Last Updated**: November 5, 2025
**Implementation Status**: ✅ Complete
