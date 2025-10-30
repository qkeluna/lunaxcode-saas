/**
 * Validation Utilities Index
 *
 * Centralized exports for all validation utilities
 */

// Email validation utilities
export {
  validateEmail,
  sanitizeEmail,
  isValidEmailFormat,
  isDisposableEmail,
  validateEmailLength,
  validateEmailDomain,
  validateEmails,
  extractEmails,
  areEmailsEquivalent,
  maskEmail,
  getEmailErrorMessage,
  EMAIL_CONSTRAINTS,
  type EmailValidationOptions,
  type EmailValidationResult,
} from './email';

// Zod validation schemas
export {
  emailSchema,
  strictEmailSchema,
  createDomainRestrictedEmailSchema,
  contactFormSchema,
  contactModalSchema,
  userSchema,
  clientUpdateSchema,
  adminSettingsSchema,
  onboardingFormSchema,
  emailOnlySchema,
  bulkEmailSchema,
  type ContactFormInput,
  type ContactModalInput,
  type UserInput,
  type ClientUpdateInput,
  type AdminSettingsInput,
  type OnboardingFormInput,
  type EmailOnlyInput,
  type BulkEmailInput,
} from './schemas';
