/**
 * Zod Validation Schemas
 *
 * Centralized validation schemas for server-side validation
 * Uses custom email validation for enhanced security
 */

import { z } from 'zod';
import { validateEmail, EMAIL_CONSTRAINTS } from './email';

/**
 * Custom Zod email validator with enhanced validation
 */
export const emailSchema = z
  .string()
  .min(EMAIL_CONSTRAINTS.MIN_LENGTH, `Email must be at least ${EMAIL_CONSTRAINTS.MIN_LENGTH} characters`)
  .max(EMAIL_CONSTRAINTS.MAX_LENGTH, `Email must not exceed ${EMAIL_CONSTRAINTS.MAX_LENGTH} characters`)
  .refine(
    (email) => validateEmail(email, { normalize: true }).isValid,
    {
      message: 'Please enter a valid email address',
    }
  )
  .transform((email) => email.toLowerCase().trim());

/**
 * Strict email validator (no disposable emails)
 */
export const strictEmailSchema = z
  .string()
  .min(EMAIL_CONSTRAINTS.MIN_LENGTH)
  .max(EMAIL_CONSTRAINTS.MAX_LENGTH)
  .refine(
    (email) => validateEmail(email, { checkDisposable: true, normalize: true }).isValid,
    {
      message: 'Temporary or disposable email addresses are not allowed',
    }
  )
  .transform((email) => email.toLowerCase().trim());

/**
 * Email with custom domain restrictions
 */
export const createDomainRestrictedEmailSchema = (allowedDomains: string[]) =>
  z
    .string()
    .min(EMAIL_CONSTRAINTS.MIN_LENGTH)
    .max(EMAIL_CONSTRAINTS.MAX_LENGTH)
    .refine(
      (email) => validateEmail(email, { allowedDomains, normalize: true }).isValid,
      {
        message: `Email domain must be one of: ${allowedDomains.join(', ')}`,
      }
    )
    .transform((email) => email.toLowerCase().trim());

// Contact form schema (Turnstile optional - for API route)
export const contactFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  email: emailSchema,
  contactNumber: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  turnstileToken: z.string().min(1, 'Please complete the verification').optional(),
});

// Contact modal schema (without Turnstile - for authenticated or internal forms)
export const contactModalSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  email: emailSchema,
  contactNumber: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

// User creation/update schema
export const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  role: z.enum(['admin', 'client']).optional(),
});

// Client update schema
export const clientUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
});

// Admin settings schema
export const adminSettingsSchema = z.object({
  profile: z.object({
    name: z.string().min(2).max(100).optional(),
    email: emailSchema.optional(),
    phone: z.string().max(20).optional(),
    bio: z.string().max(500).optional(),
  }).optional(),
  system: z.object({
    siteName: z.string().min(2).max(100).optional(),
    supportEmail: emailSchema.optional(),
    companyName: z.string().min(2).max(100).optional(),
  }).optional(),
});

// Onboarding form schema
export const onboardingFormSchema = z.object({
  serviceType: z.string().min(1, 'Please select a service type'),
  projectTitle: z.string().min(3, 'Project title must be at least 3 characters').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  features: z.array(z.string()).min(1, 'Please add at least one feature'),
  timeline: z.string().min(1, 'Please specify a timeline'),
  budget: z.string().optional(),
  clientEmail: emailSchema,
});

// Email-only validation schema (for simple email checks)
export const emailOnlySchema = z.object({
  email: emailSchema,
});

// Bulk email validation schema
export const bulkEmailSchema = z.object({
  emails: z.array(emailSchema).min(1).max(100),
});

// Export types
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ContactModalInput = z.infer<typeof contactModalSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>;
export type OnboardingFormInput = z.infer<typeof onboardingFormSchema>;
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>;
export type BulkEmailInput = z.infer<typeof bulkEmailSchema>;
