/**
 * Email Service
 *
 * Centralized email sending with templated emails for:
 * - Contact form submissions
 * - Project status updates
 * - Payment confirmations
 * - New message notifications
 * - Admin alerts
 */

import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
  // Default sender (use verified domain in production)
  from: process.env.EMAIL_FROM || 'Lunaxcode <onboarding@resend.dev>',
  // Admin email for alerts
  adminEmail: process.env.ADMIN_EMAIL || 'lunaxcode2030@gmail.com',
  // Contact form recipient
  contactEmail: process.env.CONTACT_EMAIL || 'lunaxcode2030@gmail.com',
  // App URL for links in emails
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://lunaxcode-saas.pages.dev',
} as const;

// Email result type
export interface EmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

// Common email styles
const styles = {
  container: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  `,
  header: `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px 20px;
    border-radius: 8px 8px 0 0;
    text-align: center;
  `,
  content: `
    background: #f9fafb;
    padding: 30px;
    border: 1px solid #e5e7eb;
    border-top: none;
    border-radius: 0 0 8px 8px;
  `,
  button: `
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    margin: 20px 0;
  `,
  field: `margin-bottom: 20px;`,
  fieldLabel: `font-weight: 600; color: #374151; margin-bottom: 4px;`,
  fieldValue: `color: #1f2937; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;`,
  footer: `
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    color: #6b7280;
    text-align: center;
  `,
  statusBadge: (color: string) => `
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    background: ${color}20;
    color: ${color};
  `,
};

// Status colors for badges
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  active: '#3b82f6',
  in_progress: '#8b5cf6',
  review: '#ec4899',
  completed: '#10b981',
  cancelled: '#ef4444',
  verified: '#10b981',
  rejected: '#ef4444',
};

// Get Philippine time
function getPhilippineTime(): string {
  return new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
}

// Base email template wrapper
function emailWrapper(title: string, content: string, showFooter = true): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="margin: 0; font-size: 24px;">${title}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Lunaxcode - Project Management Platform</p>
        </div>
        <div style="${styles.content}">
          ${content}
          ${showFooter ? `
            <div style="${styles.footer}">
              <p>This is an automated message from Lunaxcode.</p>
              <p>Sent at: ${getPhilippineTime()} PHT</p>
              <p><a href="${EMAIL_CONFIG.appUrl}" style="color: #667eea;">Visit Lunaxcode</a></p>
            </div>
          ` : ''}
        </div>
      </body>
    </html>
  `;
}

// ============================================
// Contact Form Email
// ============================================

export interface ContactEmailData {
  fullName: string;
  companyName: string;
  email: string;
  contactNumber?: string;
  message: string;
}

export async function sendContactEmail(data: ContactEmailData): Promise<EmailResult> {
  const content = `
    <div style="${styles.field}">
      <div style="${styles.fieldLabel}">Full Name</div>
      <div style="${styles.fieldValue}">${data.fullName}</div>
    </div>
    <div style="${styles.field}">
      <div style="${styles.fieldLabel}">Company Name</div>
      <div style="${styles.fieldValue}">${data.companyName}</div>
    </div>
    <div style="${styles.field}">
      <div style="${styles.fieldLabel}">Email Address</div>
      <div style="${styles.fieldValue}">
        <a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">${data.email}</a>
      </div>
    </div>
    ${data.contactNumber ? `
      <div style="${styles.field}">
        <div style="${styles.fieldLabel}">Contact Number</div>
        <div style="${styles.fieldValue}">
          <a href="tel:${data.contactNumber}" style="color: #667eea; text-decoration: none;">${data.contactNumber}</a>
        </div>
      </div>
    ` : ''}
    <div style="${styles.field}">
      <div style="${styles.fieldLabel}">Message</div>
      <div style="${styles.fieldValue}; white-space: pre-wrap;">${data.message}</div>
    </div>
  `;

  const plainText = `
New Quote Request - Lunaxcode

Full Name: ${data.fullName}
Company Name: ${data.companyName}
Email: ${data.email}
${data.contactNumber ? `Contact Number: ${data.contactNumber}` : ''}

Message:
${data.message}

---
Received at: ${getPhilippineTime()} PHT
  `.trim();

  try {
    const { data: result, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [EMAIL_CONFIG.contactEmail],
      replyTo: data.email,
      subject: `New Quote Request from ${data.fullName} - ${data.companyName}`,
      html: emailWrapper('New Quote Request', content),
      text: plainText,
    });

    if (error) {
      console.error('Contact email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error('Contact email exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Project Status Update Email
// ============================================

export interface ProjectStatusEmailData {
  recipientEmail: string;
  recipientName: string;
  projectTitle: string;
  projectId: string;
  oldStatus: string;
  newStatus: string;
  message?: string;
}

export async function sendProjectStatusEmail(data: ProjectStatusEmailData): Promise<EmailResult> {
  const statusColor = STATUS_COLORS[data.newStatus] || '#6b7280';
  const projectUrl = `${EMAIL_CONFIG.appUrl}/projects/${data.projectId}`;

  const content = `
    <p>Hi ${data.recipientName},</p>
    <p>Your project status has been updated:</p>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937;">${data.projectTitle}</h2>
      <p style="margin: 0 0 10px 0;">
        <strong>Previous Status:</strong>
        <span style="${styles.statusBadge(STATUS_COLORS[data.oldStatus] || '#6b7280')}">${formatStatus(data.oldStatus)}</span>
      </p>
      <p style="margin: 0;">
        <strong>New Status:</strong>
        <span style="${styles.statusBadge(statusColor)}">${formatStatus(data.newStatus)}</span>
      </p>
    </div>

    ${data.message ? `
      <div style="${styles.field}">
        <div style="${styles.fieldLabel}">Message from Admin</div>
        <div style="${styles.fieldValue}; white-space: pre-wrap;">${data.message}</div>
      </div>
    ` : ''}

    <p style="text-align: center;">
      <a href="${projectUrl}" style="${styles.button}">View Project</a>
    </p>
  `;

  const plainText = `
Hi ${data.recipientName},

Your project status has been updated:

Project: ${data.projectTitle}
Previous Status: ${formatStatus(data.oldStatus)}
New Status: ${formatStatus(data.newStatus)}

${data.message ? `Message from Admin:\n${data.message}\n` : ''}

View your project: ${projectUrl}

---
Sent at: ${getPhilippineTime()} PHT
  `.trim();

  try {
    const { data: result, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [data.recipientEmail],
      subject: `Project Update: ${data.projectTitle} - Status Changed to ${formatStatus(data.newStatus)}`,
      html: emailWrapper('Project Status Update', content),
      text: plainText,
    });

    if (error) {
      console.error('Project status email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error('Project status email exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Payment Confirmation Email
// ============================================

export interface PaymentEmailData {
  recipientEmail: string;
  recipientName: string;
  projectTitle: string;
  projectId: string;
  paymentType: 'deposit' | 'completion';
  amount: number;
  status: 'submitted' | 'verified' | 'rejected';
  referenceNumber?: string;
  adminNotes?: string;
}

export async function sendPaymentEmail(data: PaymentEmailData): Promise<EmailResult> {
  const statusColor = STATUS_COLORS[data.status] || '#6b7280';
  const projectUrl = `${EMAIL_CONFIG.appUrl}/projects/${data.projectId}/payment`;
  const formattedAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(data.amount);

  const statusMessages: Record<string, { title: string; message: string }> = {
    submitted: {
      title: 'Payment Submitted',
      message: 'We have received your payment submission and it is now pending verification. You will be notified once it has been reviewed.',
    },
    verified: {
      title: 'Payment Verified',
      message: 'Your payment has been verified successfully. Thank you for your payment!',
    },
    rejected: {
      title: 'Payment Rejected',
      message: 'Unfortunately, your payment could not be verified. Please check the details below and contact us if you have questions.',
    },
  };

  const { title, message } = statusMessages[data.status] || statusMessages.submitted;

  const content = `
    <p>Hi ${data.recipientName},</p>
    <p>${message}</p>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937;">${data.projectTitle}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Payment Type:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.paymentType === 'deposit' ? 'Deposit (50%)' : 'Completion (50%)'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 18px; font-weight: 600; color: #667eea;">${formattedAmount}</td>
        </tr>
        ${data.referenceNumber ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Reference:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.referenceNumber}</td>
          </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0;"><strong>Status:</strong></td>
          <td style="padding: 8px 0; text-align: right;">
            <span style="${styles.statusBadge(statusColor)}">${formatStatus(data.status)}</span>
          </td>
        </tr>
      </table>
    </div>

    ${data.adminNotes ? `
      <div style="${styles.field}">
        <div style="${styles.fieldLabel}">Notes from Admin</div>
        <div style="${styles.fieldValue}; white-space: pre-wrap;">${data.adminNotes}</div>
      </div>
    ` : ''}

    <p style="text-align: center;">
      <a href="${projectUrl}" style="${styles.button}">View Payment Details</a>
    </p>
  `;

  const plainText = `
Hi ${data.recipientName},

${message}

Project: ${data.projectTitle}
Payment Type: ${data.paymentType === 'deposit' ? 'Deposit (50%)' : 'Completion (50%)'}
Amount: ${formattedAmount}
${data.referenceNumber ? `Reference: ${data.referenceNumber}` : ''}
Status: ${formatStatus(data.status)}

${data.adminNotes ? `Notes from Admin:\n${data.adminNotes}\n` : ''}

View payment details: ${projectUrl}

---
Sent at: ${getPhilippineTime()} PHT
  `.trim();

  try {
    const { data: result, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [data.recipientEmail],
      subject: `${title}: ${data.projectTitle} - ${formattedAmount}`,
      html: emailWrapper(title, content),
      text: plainText,
    });

    if (error) {
      console.error('Payment email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error('Payment email exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// New Message Notification Email
// ============================================

export interface MessageNotificationData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  projectTitle: string;
  projectId: string;
  messagePreview: string;
  unreadCount: number;
}

export async function sendMessageNotificationEmail(data: MessageNotificationData): Promise<EmailResult> {
  const messagesUrl = `${EMAIL_CONFIG.appUrl}/projects/${data.projectId}/messages`;

  const content = `
    <p>Hi ${data.recipientName},</p>
    <p>You have a new message from <strong>${data.senderName}</strong> regarding your project:</p>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937;">${data.projectTitle}</h3>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea;">
        <p style="margin: 0; font-style: italic; color: #4b5563;">"${truncateText(data.messagePreview, 200)}"</p>
      </div>
      ${data.unreadCount > 1 ? `
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">
          You have <strong>${data.unreadCount} unread messages</strong> in this conversation.
        </p>
      ` : ''}
    </div>

    <p style="text-align: center;">
      <a href="${messagesUrl}" style="${styles.button}">View Messages</a>
    </p>
  `;

  const plainText = `
Hi ${data.recipientName},

You have a new message from ${data.senderName} regarding your project:

Project: ${data.projectTitle}

Message Preview:
"${truncateText(data.messagePreview, 200)}"

${data.unreadCount > 1 ? `You have ${data.unreadCount} unread messages in this conversation.` : ''}

View messages: ${messagesUrl}

---
Sent at: ${getPhilippineTime()} PHT
  `.trim();

  try {
    const { data: result, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [data.recipientEmail],
      subject: `New Message: ${data.projectTitle} - from ${data.senderName}`,
      html: emailWrapper('New Message', content),
      text: plainText,
    });

    if (error) {
      console.error('Message notification email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error('Message notification email exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Admin Alert Emails
// ============================================

export interface AdminAlertData {
  type: 'new_project' | 'payment_submitted' | 'new_client';
  clientName: string;
  clientEmail: string;
  projectTitle?: string;
  projectId?: string;
  paymentAmount?: number;
  paymentType?: string;
  details?: string;
}

export async function sendAdminAlertEmail(data: AdminAlertData): Promise<EmailResult> {
  const alertConfig: Record<string, { title: string; icon: string }> = {
    new_project: { title: 'New Project Submitted', icon: '📋' },
    payment_submitted: { title: 'Payment Proof Submitted', icon: '💰' },
    new_client: { title: 'New Client Registered', icon: '👤' },
  };

  const { title, icon } = alertConfig[data.type] || { title: 'Admin Alert', icon: '🔔' };
  const dashboardUrl = data.projectId
    ? `${EMAIL_CONFIG.appUrl}/admin/projects/${data.projectId}`
    : `${EMAIL_CONFIG.appUrl}/admin`;

  let detailsHtml = '';
  let detailsText = '';

  switch (data.type) {
    case 'new_project':
      detailsHtml = `
        <div style="${styles.field}">
          <div style="${styles.fieldLabel}">Project Title</div>
          <div style="${styles.fieldValue}">${data.projectTitle}</div>
        </div>
      `;
      detailsText = `Project Title: ${data.projectTitle}`;
      break;
    case 'payment_submitted':
      const formattedAmount = data.paymentAmount
        ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(data.paymentAmount)
        : 'N/A';
      detailsHtml = `
        <div style="${styles.field}">
          <div style="${styles.fieldLabel}">Project</div>
          <div style="${styles.fieldValue}">${data.projectTitle}</div>
        </div>
        <div style="${styles.field}">
          <div style="${styles.fieldLabel}">Payment Type</div>
          <div style="${styles.fieldValue}">${data.paymentType}</div>
        </div>
        <div style="${styles.field}">
          <div style="${styles.fieldLabel}">Amount</div>
          <div style="${styles.fieldValue}; font-size: 18px; font-weight: 600; color: #667eea;">${formattedAmount}</div>
        </div>
      `;
      detailsText = `Project: ${data.projectTitle}\nPayment Type: ${data.paymentType}\nAmount: ${formattedAmount}`;
      break;
    case 'new_client':
      detailsHtml = `
        <p>A new client has registered on the platform.</p>
      `;
      detailsText = 'A new client has registered on the platform.';
      break;
  }

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 48px;">${icon}</span>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
      <div style="${styles.field}">
        <div style="${styles.fieldLabel}">Client Name</div>
        <div style="${styles.fieldValue}">${data.clientName}</div>
      </div>
      <div style="${styles.field}">
        <div style="${styles.fieldLabel}">Client Email</div>
        <div style="${styles.fieldValue}">
          <a href="mailto:${data.clientEmail}" style="color: #667eea;">${data.clientEmail}</a>
        </div>
      </div>
      ${detailsHtml}
      ${data.details ? `
        <div style="${styles.field}">
          <div style="${styles.fieldLabel}">Additional Details</div>
          <div style="${styles.fieldValue}; white-space: pre-wrap;">${data.details}</div>
        </div>
      ` : ''}
    </div>

    <p style="text-align: center;">
      <a href="${dashboardUrl}" style="${styles.button}">View in Dashboard</a>
    </p>
  `;

  const plainText = `
${icon} ${title}

Client Name: ${data.clientName}
Client Email: ${data.clientEmail}
${detailsText}
${data.details ? `\nDetails:\n${data.details}` : ''}

View in dashboard: ${dashboardUrl}

---
Sent at: ${getPhilippineTime()} PHT
  `.trim();

  try {
    const { data: result, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [EMAIL_CONFIG.adminEmail],
      subject: `[Admin Alert] ${title} - ${data.clientName}`,
      html: emailWrapper(title, content),
      text: plainText,
    });

    if (error) {
      console.error('Admin alert email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error('Admin alert email exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Task Update Email
// ============================================

export interface TaskUpdateEmailData {
  recipientEmail: string;
  recipientName: string;
  projectTitle: string;
  projectId: string;
  taskTitle: string;
  oldStatus: string;
  newStatus: string;
  completedTasks: number;
  totalTasks: number;
}

export async function sendTaskUpdateEmail(data: TaskUpdateEmailData): Promise<EmailResult> {
  const statusColor = STATUS_COLORS[data.newStatus] || '#6b7280';
  const projectUrl = `${EMAIL_CONFIG.appUrl}/projects/${data.projectId}`;
  const progressPercent = Math.round((data.completedTasks / data.totalTasks) * 100);

  const content = `
    <p>Hi ${data.recipientName},</p>
    <p>A task in your project has been updated:</p>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1f2937;">${data.projectTitle}</h3>

      <div style="margin-bottom: 20px;">
        <div style="${styles.fieldLabel}">Task</div>
        <div style="font-size: 16px; color: #1f2937;">${data.taskTitle}</div>
      </div>

      <p style="margin: 0 0 10px 0;">
        <span style="${styles.statusBadge(STATUS_COLORS[data.oldStatus] || '#6b7280')}">${formatStatus(data.oldStatus)}</span>
        <span style="margin: 0 10px; color: #9ca3af;">→</span>
        <span style="${styles.statusBadge(statusColor)}">${formatStatus(data.newStatus)}</span>
      </p>

      <div style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="font-size: 14px; color: #6b7280;">Project Progress</span>
          <span style="font-size: 14px; font-weight: 600; color: #667eea;">${progressPercent}%</span>
        </div>
        <div style="background: #e5e7eb; border-radius: 10px; height: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${progressPercent}%; border-radius: 10px;"></div>
        </div>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">${data.completedTasks} of ${data.totalTasks} tasks completed</p>
      </div>
    </div>

    <p style="text-align: center;">
      <a href="${projectUrl}" style="${styles.button}">View Project</a>
    </p>
  `;

  const plainText = `
Hi ${data.recipientName},

A task in your project has been updated:

Project: ${data.projectTitle}
Task: ${data.taskTitle}
Status: ${formatStatus(data.oldStatus)} → ${formatStatus(data.newStatus)}

Project Progress: ${progressPercent}% (${data.completedTasks} of ${data.totalTasks} tasks completed)

View project: ${projectUrl}

---
Sent at: ${getPhilippineTime()} PHT
  `.trim();

  try {
    const { data: result, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [data.recipientEmail],
      subject: `Task Update: ${data.taskTitle} - ${formatStatus(data.newStatus)}`,
      html: emailWrapper('Task Update', content),
      text: plainText,
    });

    if (error) {
      console.error('Task update email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error('Task update email exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Payment Reminder Email
// ============================================

export interface PaymentReminderData {
  recipientEmail: string;
  recipientName: string;
  projectTitle: string;
  projectId: string;
  paymentType: 'deposit' | 'completion';
  amount: number;
  daysOverdue?: number;
}

export async function sendPaymentReminderEmail(data: PaymentReminderData): Promise<EmailResult> {
  const paymentUrl = `${EMAIL_CONFIG.appUrl}/projects/${data.projectId}/payment`;
  const formattedAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(data.amount);

  const urgencyMessage = data.daysOverdue && data.daysOverdue > 0
    ? `This payment is ${data.daysOverdue} day${data.daysOverdue > 1 ? 's' : ''} overdue.`
    : 'Please complete your payment at your earliest convenience.';

  const content = `
    <p>Hi ${data.recipientName},</p>
    <p>This is a friendly reminder about your pending payment:</p>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1f2937;">${data.projectTitle}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Payment Type:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.paymentType === 'deposit' ? 'Deposit (50%)' : 'Completion (50%)'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Amount Due:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-size: 24px; font-weight: 600; color: #667eea;">${formattedAmount}</td>
        </tr>
      </table>
    </div>

    <p style="color: ${data.daysOverdue && data.daysOverdue > 0 ? '#ef4444' : '#6b7280'};">
      ${urgencyMessage}
    </p>

    <p style="text-align: center;">
      <a href="${paymentUrl}" style="${styles.button}">Make Payment</a>
    </p>

    <p style="font-size: 14px; color: #6b7280;">
      If you have already made this payment, please disregard this reminder. You can upload your payment proof through the link above.
    </p>
  `;

  const plainText = `
Hi ${data.recipientName},

This is a friendly reminder about your pending payment:

Project: ${data.projectTitle}
Payment Type: ${data.paymentType === 'deposit' ? 'Deposit (50%)' : 'Completion (50%)'}
Amount Due: ${formattedAmount}

${urgencyMessage}

Make payment: ${paymentUrl}

If you have already made this payment, please disregard this reminder.

---
Sent at: ${getPhilippineTime()} PHT
  `.trim();

  try {
    const { data: result, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [data.recipientEmail],
      subject: `Payment Reminder: ${data.projectTitle} - ${formattedAmount} Due`,
      html: emailWrapper('Payment Reminder', content),
      text: plainText,
    });

    if (error) {
      console.error('Payment reminder email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error('Payment reminder email exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Utility Functions
// ============================================

function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Export email config for reference
export { EMAIL_CONFIG };
