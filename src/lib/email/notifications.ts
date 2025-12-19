/**
 * Email Notification Helper
 *
 * Checks user preferences before sending emails and logs all email activity.
 * This module wraps the core email functions with preference checking.
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import {
  notificationPreferences,
  emailLogs,
  users,
  projects,
  tasks,
  type NotificationPreference,
} from '@/lib/db/schema';
import {
  sendProjectStatusEmail,
  sendPaymentEmail,
  sendMessageNotificationEmail,
  sendTaskUpdateEmail,
  sendPaymentReminderEmail,
  sendAdminAlertEmail,
  type ProjectStatusEmailData,
  type PaymentEmailData,
  type MessageNotificationData,
  type TaskUpdateEmailData,
  type PaymentReminderData,
  type AdminAlertData,
  type EmailResult,
} from './index';

// Email types for logging and preference checking
export type EmailType =
  | 'project_status'
  | 'payment'
  | 'payment_reminder'
  | 'message'
  | 'task'
  | 'admin_alert'
  | 'contact';

// Preference keys mapped to email types
const EMAIL_TYPE_TO_PREFERENCE: Record<EmailType, keyof NotificationPreference | null> = {
  project_status: 'projectUpdates',
  payment: 'paymentReminders',
  payment_reminder: 'paymentReminders',
  message: 'messageNotifications',
  task: 'taskUpdates',
  admin_alert: null, // Admin alerts always sent
  contact: null, // Contact form always processed
};

/**
 * Check if user has enabled a specific notification type
 */
export async function shouldSendNotification(
  db: ReturnType<typeof drizzle>,
  userId: string,
  emailType: EmailType
): Promise<boolean> {
  // Admin alerts and contact emails are always sent
  const preferenceKey = EMAIL_TYPE_TO_PREFERENCE[emailType];
  if (!preferenceKey) {
    return true;
  }

  try {
    const prefs = await db.select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .get();

    // Default to true if no preferences set
    if (!prefs) {
      return true;
    }

    // Check master toggle first
    if (!prefs.emailNotifications) {
      return false;
    }

    // Check specific preference
    return prefs[preferenceKey] as boolean ?? true;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    // Default to sending if we can't check preferences
    return true;
  }
}

/**
 * Log an email send attempt
 */
export async function logEmailSend(
  db: ReturnType<typeof drizzle>,
  data: {
    userId?: string;
    emailType: EmailType;
    recipientEmail: string;
    subject: string;
    resendEmailId?: string;
    status: 'sent' | 'failed' | 'skipped';
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await db.insert(emailLogs).values({
      userId: data.userId || null,
      emailType: data.emailType,
      recipientEmail: data.recipientEmail,
      subject: data.subject,
      resendEmailId: data.resendEmailId || null,
      status: data.status,
      errorMessage: data.errorMessage || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });
  } catch (error) {
    console.error('Error logging email:', error);
  }
}

/**
 * Get user's notification preferences
 */
export async function getUserPreferences(
  db: ReturnType<typeof drizzle>,
  userId: string
): Promise<NotificationPreference | null> {
  try {
    const prefs = await db.select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .get();
    return prefs || null;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

/**
 * Wrapper for project status email with preference checking
 */
export async function notifyProjectStatusChange(
  db: ReturnType<typeof drizzle>,
  data: ProjectStatusEmailData & { userId: string }
): Promise<EmailResult & { skipped?: boolean }> {
  const shouldSend = await shouldSendNotification(db, data.userId, 'project_status');

  if (!shouldSend) {
    await logEmailSend(db, {
      userId: data.userId,
      emailType: 'project_status',
      recipientEmail: data.recipientEmail,
      subject: `Project Update: ${data.projectTitle}`,
      status: 'skipped',
      metadata: { reason: 'User disabled project update notifications' },
    });
    return { success: true, skipped: true };
  }

  const result = await sendProjectStatusEmail(data);

  await logEmailSend(db, {
    userId: data.userId,
    emailType: 'project_status',
    recipientEmail: data.recipientEmail,
    subject: `Project Update: ${data.projectTitle}`,
    resendEmailId: result.emailId,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
    metadata: { oldStatus: data.oldStatus, newStatus: data.newStatus },
  });

  return result;
}

/**
 * Wrapper for payment email with preference checking
 */
export async function notifyPaymentUpdate(
  db: ReturnType<typeof drizzle>,
  data: PaymentEmailData & { userId: string }
): Promise<EmailResult & { skipped?: boolean }> {
  const shouldSend = await shouldSendNotification(db, data.userId, 'payment');

  if (!shouldSend) {
    await logEmailSend(db, {
      userId: data.userId,
      emailType: 'payment',
      recipientEmail: data.recipientEmail,
      subject: `Payment Update: ${data.projectTitle}`,
      status: 'skipped',
      metadata: { reason: 'User disabled payment notifications' },
    });
    return { success: true, skipped: true };
  }

  const result = await sendPaymentEmail(data);

  await logEmailSend(db, {
    userId: data.userId,
    emailType: 'payment',
    recipientEmail: data.recipientEmail,
    subject: `Payment Update: ${data.projectTitle}`,
    resendEmailId: result.emailId,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
    metadata: { paymentType: data.paymentType, status: data.status, amount: data.amount },
  });

  return result;
}

/**
 * Wrapper for payment reminder email with preference checking
 */
export async function notifyPaymentReminder(
  db: ReturnType<typeof drizzle>,
  data: PaymentReminderData & { userId: string }
): Promise<EmailResult & { skipped?: boolean }> {
  const shouldSend = await shouldSendNotification(db, data.userId, 'payment_reminder');

  if (!shouldSend) {
    await logEmailSend(db, {
      userId: data.userId,
      emailType: 'payment_reminder',
      recipientEmail: data.recipientEmail,
      subject: `Payment Reminder: ${data.projectTitle}`,
      status: 'skipped',
      metadata: { reason: 'User disabled payment reminders' },
    });
    return { success: true, skipped: true };
  }

  const result = await sendPaymentReminderEmail(data);

  await logEmailSend(db, {
    userId: data.userId,
    emailType: 'payment_reminder',
    recipientEmail: data.recipientEmail,
    subject: `Payment Reminder: ${data.projectTitle}`,
    resendEmailId: result.emailId,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
    metadata: { paymentType: data.paymentType, amount: data.amount, daysOverdue: data.daysOverdue },
  });

  return result;
}

/**
 * Wrapper for message notification email with preference checking
 */
export async function notifyNewMessage(
  db: ReturnType<typeof drizzle>,
  data: MessageNotificationData & { userId: string }
): Promise<EmailResult & { skipped?: boolean }> {
  const shouldSend = await shouldSendNotification(db, data.userId, 'message');

  if (!shouldSend) {
    await logEmailSend(db, {
      userId: data.userId,
      emailType: 'message',
      recipientEmail: data.recipientEmail,
      subject: `New Message: ${data.projectTitle}`,
      status: 'skipped',
      metadata: { reason: 'User disabled message notifications' },
    });
    return { success: true, skipped: true };
  }

  const result = await sendMessageNotificationEmail(data);

  await logEmailSend(db, {
    userId: data.userId,
    emailType: 'message',
    recipientEmail: data.recipientEmail,
    subject: `New Message: ${data.projectTitle}`,
    resendEmailId: result.emailId,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
    metadata: { senderName: data.senderName, unreadCount: data.unreadCount },
  });

  return result;
}

/**
 * Wrapper for task update email with preference checking
 */
export async function notifyTaskUpdate(
  db: ReturnType<typeof drizzle>,
  data: TaskUpdateEmailData & { userId: string }
): Promise<EmailResult & { skipped?: boolean }> {
  const shouldSend = await shouldSendNotification(db, data.userId, 'task');

  if (!shouldSend) {
    await logEmailSend(db, {
      userId: data.userId,
      emailType: 'task',
      recipientEmail: data.recipientEmail,
      subject: `Task Update: ${data.taskTitle}`,
      status: 'skipped',
      metadata: { reason: 'User disabled task update notifications' },
    });
    return { success: true, skipped: true };
  }

  const result = await sendTaskUpdateEmail(data);

  await logEmailSend(db, {
    userId: data.userId,
    emailType: 'task',
    recipientEmail: data.recipientEmail,
    subject: `Task Update: ${data.taskTitle}`,
    resendEmailId: result.emailId,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
    metadata: { taskTitle: data.taskTitle, oldStatus: data.oldStatus, newStatus: data.newStatus },
  });

  return result;
}

/**
 * Wrapper for admin alert email (always sent)
 */
export async function notifyAdmin(
  db: ReturnType<typeof drizzle>,
  data: AdminAlertData
): Promise<EmailResult> {
  const result = await sendAdminAlertEmail(data);

  await logEmailSend(db, {
    emailType: 'admin_alert',
    recipientEmail: process.env.ADMIN_EMAIL || 'lunaxcode2030@gmail.com',
    subject: `Admin Alert: ${data.type}`,
    resendEmailId: result.emailId,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
    metadata: { type: data.type, clientName: data.clientName, projectTitle: data.projectTitle },
  });

  return result;
}

/**
 * Get project details for email notifications
 */
export async function getProjectForNotification(
  db: ReturnType<typeof drizzle>,
  projectId: number
): Promise<{
  project: {
    id: number;
    name: string;
    userId: string;
    clientName: string;
    clientEmail: string;
    status: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
} | null> {
  try {
    const project = await db.select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) return null;

    const user = await db.select()
      .from(users)
      .where(eq(users.id, project.userId))
      .get();

    if (!user) return null;

    return {
      project: {
        id: project.id,
        name: project.name,
        userId: project.userId,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        status: project.status,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('Error fetching project for notification:', error);
    return null;
  }
}

/**
 * Get task counts for a project
 */
export async function getProjectTaskCounts(
  db: ReturnType<typeof drizzle>,
  projectId: number
): Promise<{ completed: number; total: number }> {
  try {
    const allTasks = await db.select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    const completed = allTasks.filter(t => t.status === 'done').length;
    const total = allTasks.length;

    return { completed, total };
  } catch (error) {
    console.error('Error fetching task counts:', error);
    return { completed: 0, total: 0 };
  }
}
