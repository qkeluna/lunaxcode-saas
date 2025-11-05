/**
 * Email Notification Triggers
 *
 * High-level functions to send specific notification emails
 */

import { sendEmail } from './service';
import {
  projectCreatedEmail,
  prdGeneratedEmail,
  paymentStatusEmail,
  projectStatusEmail,
  newMessageEmail,
  type ProjectCreatedEmailData,
  type PRDGeneratedEmailData,
  type PaymentStatusEmailData,
  type ProjectStatusEmailData,
  type NewMessageEmailData,
} from './templates';

/**
 * Send project created notification
 */
export async function notifyProjectCreated(
  recipientEmail: string,
  data: ProjectCreatedEmailData
) {
  const html = projectCreatedEmail(data);

  return sendEmail({
    to: recipientEmail,
    subject: `🎉 Your Project "${data.projectName}" Has Been Created`,
    html,
  });
}

/**
 * Send PRD generated notification
 */
export async function notifyPRDGenerated(
  recipientEmail: string,
  data: PRDGeneratedEmailData
) {
  const html = prdGeneratedEmail(data);

  return sendEmail({
    to: recipientEmail,
    subject: `✨ Your PRD is Ready - ${data.projectName}`,
    html,
  });
}

/**
 * Send payment status notification
 */
export async function notifyPaymentStatus(
  recipientEmail: string,
  data: PaymentStatusEmailData
) {
  const html = paymentStatusEmail(data);

  const subject = data.status === 'verified'
    ? `✅ Payment Verified - ${data.projectName}`
    : `⚠️ Payment Update Required - ${data.projectName}`;

  return sendEmail({
    to: recipientEmail,
    subject,
    html,
  });
}

/**
 * Send project status change notification
 */
export async function notifyProjectStatus(
  recipientEmail: string,
  data: ProjectStatusEmailData
) {
  const html = projectStatusEmail(data);

  const statusEmojis: Record<string, string> = {
    'in-progress': '🚀',
    'completed': '🎉',
    'on-hold': '⏸️',
    'pending': '📋',
  };

  const emoji = statusEmojis[data.newStatus] || '📋';

  return sendEmail({
    to: recipientEmail,
    subject: `${emoji} Project Status Update - ${data.projectName}`,
    html,
  });
}

/**
 * Send new message notification
 */
export async function notifyNewMessage(
  recipientEmail: string,
  data: NewMessageEmailData
) {
  const html = newMessageEmail(data);

  return sendEmail({
    to: recipientEmail,
    subject: `💬 New Message from ${data.senderName} - ${data.projectName}`,
    html,
  });
}

/**
 * Send admin notification (for internal alerts)
 */
export async function notifyAdmin(
  subject: string,
  message: string,
  details?: Record<string, any>
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'lunaxcode2030@gmail.com';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .details {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            margin-top: 20px;
          }
          .details-row {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .details-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #374151;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">🔔 Admin Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Lunaxcode System Notification</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
          <p style="color: #4b5563; font-size: 16px;">${message}</p>
          ${details ? `
            <div class="details">
              <h3 style="margin-top: 0; color: #374151;">Details</h3>
              ${Object.entries(details).map(([key, value]) => `
                <div class="details-row">
                  <span class="label">${key}:</span>
                  <span>${value}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
            Time: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[ADMIN] ${subject}`,
    html,
  });
}

// Export all notification functions
export {
  type ProjectCreatedEmailData,
  type PRDGeneratedEmailData,
  type PaymentStatusEmailData,
  type ProjectStatusEmailData,
  type NewMessageEmailData,
};
