/**
 * Email Validation Utility
 *
 * Comprehensive email validation following security best practices:
 * - RFC 5322 format validation
 * - Domain validation
 * - Length constraints
 * - Sanitization for security
 * - Disposable email detection (optional)
 */

// RFC 5322 compliant email regex (simplified but robust)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Common disposable email domains (extend as needed)
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'throwaway.email',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'getnada.com',
  'maildrop.cc',
  'fakeinbox.com',
]);

// Email validation constraints
export const EMAIL_CONSTRAINTS = {
  MIN_LENGTH: 3, // a@b
  MAX_LENGTH: 320, // RFC 5321 maximum (64@255)
  MAX_LOCAL_LENGTH: 64, // local part (before @)
  MAX_DOMAIN_LENGTH: 255, // domain part (after @)
} as const;

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface EmailValidationOptions {
  /** Check for disposable email domains */
  checkDisposable?: boolean;
  /** Enforce stricter rules (no special characters) */
  strict?: boolean;
  /** Custom domain allow-list (only these domains allowed) */
  allowedDomains?: string[];
  /** Custom domain block-list (these domains not allowed) */
  blockedDomains?: string[];
  /** Normalize email (lowercase, trim) */
  normalize?: boolean;
}

/**
 * Sanitize email input to prevent injection attacks
 */
export function sanitizeEmail(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/[<>]/g, ''); // Remove angle brackets (prevent header injection)
}

/**
 * Validate email format according to RFC 5322
 */
export function isValidEmailFormat(email: string): boolean {
  if (typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email);
}

/**
 * Check if email domain is disposable/temporary
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

/**
 * Validate email length constraints
 */
export function validateEmailLength(email: string): EmailValidationResult {
  if (email.length < EMAIL_CONSTRAINTS.MIN_LENGTH) {
    return {
      isValid: false,
      error: `Email must be at least ${EMAIL_CONSTRAINTS.MIN_LENGTH} characters`,
    };
  }

  if (email.length > EMAIL_CONSTRAINTS.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Email must not exceed ${EMAIL_CONSTRAINTS.MAX_LENGTH} characters`,
    };
  }

  const [localPart, domain] = email.split('@');

  if (localPart && localPart.length > EMAIL_CONSTRAINTS.MAX_LOCAL_LENGTH) {
    return {
      isValid: false,
      error: `Email local part must not exceed ${EMAIL_CONSTRAINTS.MAX_LOCAL_LENGTH} characters`,
    };
  }

  if (domain && domain.length > EMAIL_CONSTRAINTS.MAX_DOMAIN_LENGTH) {
    return {
      isValid: false,
      error: `Email domain must not exceed ${EMAIL_CONSTRAINTS.MAX_DOMAIN_LENGTH} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Validate email domain (basic checks)
 */
export function validateEmailDomain(email: string): EmailValidationResult {
  const domain = email.split('@')[1];

  if (!domain) {
    return { isValid: false, error: 'Email must contain a domain' };
  }

  // Check for at least one dot in domain
  if (!domain.includes('.')) {
    return { isValid: false, error: 'Invalid email domain format' };
  }

  // Check domain doesn't start or end with dot or hyphen
  if (domain.startsWith('.') || domain.endsWith('.') || domain.startsWith('-') || domain.endsWith('-')) {
    return { isValid: false, error: 'Invalid email domain format' };
  }

  // Check for consecutive dots
  if (domain.includes('..')) {
    return { isValid: false, error: 'Invalid email domain format' };
  }

  // Validate TLD (top-level domain) - at least 2 characters
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Invalid top-level domain' };
  }

  return { isValid: true };
}

/**
 * Comprehensive email validation with multiple checks
 */
export function validateEmail(
  email: string,
  options: EmailValidationOptions = {}
): EmailValidationResult {
  const {
    checkDisposable = false,
    strict = false,
    allowedDomains = [],
    blockedDomains = [],
    normalize = true,
  } = options;

  // Normalize email
  const normalizedEmail = normalize ? sanitizeEmail(email) : email.trim();

  // Basic null/empty check
  if (!normalizedEmail) {
    return { isValid: false, error: 'Email is required' };
  }

  // Length validation
  const lengthResult = validateEmailLength(normalizedEmail);
  if (!lengthResult.isValid) {
    return lengthResult;
  }

  // Format validation
  if (!isValidEmailFormat(normalizedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Domain validation
  const domainResult = validateEmailDomain(normalizedEmail);
  if (!domainResult.isValid) {
    return domainResult;
  }

  const domain = normalizedEmail.split('@')[1]!.toLowerCase();
  const warnings: string[] = [];

  // Allow-list check (if provided)
  if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
    return {
      isValid: false,
      error: `Email domain must be one of: ${allowedDomains.join(', ')}`,
    };
  }

  // Block-list check
  if (blockedDomains.length > 0 && blockedDomains.includes(domain)) {
    return {
      isValid: false,
      error: 'This email domain is not allowed',
    };
  }

  // Disposable email check
  if (checkDisposable && isDisposableEmail(normalizedEmail)) {
    return {
      isValid: false,
      error: 'Temporary or disposable email addresses are not allowed',
    };
  }

  // Strict mode: no special characters except dot and hyphen
  if (strict) {
    const localPart = normalizedEmail.split('@')[0];
    if (localPart && !/^[a-z0-9.-]+$/.test(localPart)) {
      warnings.push('Email contains special characters that may cause delivery issues');
    }
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Batch validate multiple emails
 */
export function validateEmails(
  emails: string[],
  options: EmailValidationOptions = {}
): Map<string, EmailValidationResult> {
  const results = new Map<string, EmailValidationResult>();

  for (const email of emails) {
    results.set(email, validateEmail(email, options));
  }

  return results;
}

/**
 * Extract valid emails from a string (useful for parsing)
 */
export function extractEmails(text: string): string[] {
  const emailMatches = text.match(/[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/g);

  if (!emailMatches) return [];

  return emailMatches.filter(email => validateEmail(email).isValid);
}

/**
 * Check if two emails are equivalent (same after normalization)
 */
export function areEmailsEquivalent(email1: string, email2: string): boolean {
  return sanitizeEmail(email1) === sanitizeEmail(email2);
}

/**
 * Mask email for display (privacy)
 * Example: john.doe@example.com → j***@example.com
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) return email;

  const maskedLocal = localPart.length > 1
    ? `${localPart[0]}***`
    : localPart;

  return `${maskedLocal}@${domain}`;
}

/**
 * Get email validation error message for common scenarios
 */
export function getEmailErrorMessage(error: string | undefined): string {
  if (!error) return '';

  // Map common errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'Email is required': 'Please enter your email address',
    'Please enter a valid email address': 'The email address format is invalid',
    'Email must contain a domain': 'Please include a domain (e.g., @example.com)',
    'Invalid email domain format': 'The email domain format is invalid',
    'Invalid top-level domain': 'The email domain must have a valid extension (e.g., .com)',
  };

  return errorMap[error] || error;
}

// Export types
export type { EmailValidationOptions, EmailValidationResult };
