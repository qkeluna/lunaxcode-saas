/**
 * Email Module
 *
 * Centralized email service for all notifications
 */

// Core email service
export { sendEmail, formatPeso, formatDatePH, EMAIL_CONFIG } from './service';
export type { EmailOptions, SendEmailResult } from './service';

// Email templates
export {
  projectCreatedEmail,
  prdGeneratedEmail,
  paymentStatusEmail,
  projectStatusEmail,
  newMessageEmail,
} from './templates';

export type {
  ProjectCreatedEmailData,
  PRDGeneratedEmailData,
  PaymentStatusEmailData,
  ProjectStatusEmailData,
  NewMessageEmailData,
} from './templates';

// Notification triggers
export {
  notifyProjectCreated,
  notifyPRDGenerated,
  notifyPaymentStatus,
  notifyProjectStatus,
  notifyNewMessage,
  notifyAdmin,
} from './notifications';
