# Email Validation System - Complete Guide

This guide covers the comprehensive email validation system implemented in Lunaxcode SaaS application. The system provides multiple layers of validation following security best practices.

## Table of Contents
1. [Overview](#overview)
2. [Validation Features](#validation-features)
3. [Usage Examples](#usage-examples)
4. [API Reference](#api-reference)
5. [Security Considerations](#security-considerations)
6. [Testing](#testing)

---

## Overview

The email validation system consists of three main components:

1. **Validation Utility** (`src/lib/validations/email.ts`) - Core validation logic
2. **React Hooks** (`src/hooks/useEmailValidation.ts`) - Client-side form integration
3. **Zod Schemas** (`src/lib/validations/schemas.ts`) - Server-side API validation

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client-Side Layer                     │
├─────────────────────────────────────────────────────────┤
│  React Forms → useEmailValidation Hook → User Feedback  │
│                         ↓                                │
│              Real-time Validation                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    API/Server Layer                      │
├─────────────────────────────────────────────────────────┤
│  API Endpoint → Zod Schema → emailSchema → Validation   │
│                         ↓                                │
│              Error Response or Process                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Database Layer                        │
├─────────────────────────────────────────────────────────┤
│  users.email (UNIQUE, NOT NULL, TEXT)                   │
│  projects.clientEmail (NOT NULL, TEXT)                  │
└─────────────────────────────────────────────────────────┘
```

---

## Validation Features

### ✅ Format Validation (RFC 5322 Compliant)
- Validates email structure according to RFC 5322 standard
- Checks for proper local part (before @) and domain part (after @)
- Ensures proper character usage and format

### ✅ Length Constraints
- **Minimum**: 3 characters (e.g., `a@b`)
- **Maximum**: 320 characters (RFC 5321 standard)
- **Local part**: Max 64 characters
- **Domain part**: Max 255 characters

### ✅ Domain Validation
- Checks for valid domain structure
- Validates TLD (top-level domain) with minimum 2 characters
- Prevents malformed domains (consecutive dots, leading/trailing dots or hyphens)

### ✅ Sanitization
- Removes whitespace
- Converts to lowercase
- Removes potentially dangerous characters (angle brackets)
- Prevents header injection attacks

### ✅ Disposable Email Detection (Optional)
Blocks temporary email services:
- tempmail.com
- throwaway.email
- 10minutemail.com
- guerrillamail.com
- mailinator.com
- And more...

### ✅ Domain Restrictions (Optional)
- **Allow-list**: Only specific domains permitted
- **Block-list**: Specific domains blocked
- Useful for corporate or educational environments

---

## Usage Examples

### 1. Basic Email Validation (Utility Function)

```typescript
import { validateEmail } from '@/lib/validations/email';

// Basic validation
const result = validateEmail('user@example.com');
console.log(result.isValid); // true

// Invalid email
const result2 = validateEmail('invalid.email');
console.log(result2.isValid); // false
console.log(result2.error); // "Please enter a valid email address"

// With options
const result3 = validateEmail('user@tempmail.com', {
  checkDisposable: true,
  normalize: true
});
console.log(result3.isValid); // false
console.log(result3.error); // "Temporary or disposable email addresses are not allowed"
```

### 2. React Hook (Client-Side Forms)

```typescript
import { useEmailValidation } from '@/hooks/useEmailValidation';

function ContactForm() {
  const email = useEmailValidation({
    validateOnBlur: true,
    validateOnChange: false,
    debounceDelay: 300,
    checkDisposable: true
  });

  return (
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email.value}
        onChange={email.onChange}
        onBlur={email.onBlur}
        className={email.shouldShowError ? 'border-red-500' : ''}
      />
      {email.shouldShowError && (
        <p className="text-red-600 text-sm">{email.errorMessage}</p>
      )}
    </div>
  );
}
```

### 3. React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema } from '@/lib/validations/schemas';
import { useEmailValidator } from '@/hooks/useEmailValidation';

function AdvancedForm() {
  const validateEmailField = useEmailValidator({ checkDisposable: true });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(contactFormSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          validate: validateEmailField // Additional validation layer
        })}
        type="email"
        placeholder="your@email.com"
      />
      {errors.email && <p>{errors.email.message}</p>}
    </form>
  );
}
```

### 4. Server-Side API Validation

```typescript
// API Route: /api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validations/schemas';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with enhanced email validation
    const validatedData = contactFormSchema.parse(body);

    // Email is now guaranteed to be valid, normalized, and sanitized
    console.log(validatedData.email); // lowercase, trimmed

    // Process the validated data
    // ...

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### 5. Custom Domain Restrictions

```typescript
// Only allow company emails
import { createDomainRestrictedEmailSchema } from '@/lib/validations/schemas';

const companyEmailSchema = createDomainRestrictedEmailSchema([
  'company.com',
  'subsidiary.com'
]);

// Usage in form or API
const result = companyEmailSchema.safeParse('user@company.com');
// result.success === true

const result2 = companyEmailSchema.safeParse('user@gmail.com');
// result2.success === false
```

### 6. Batch Email Validation

```typescript
import { validateEmails } from '@/lib/validations/email';

const emailList = [
  'user1@example.com',
  'invalid.email',
  'user2@tempmail.com'
];

const results = validateEmails(emailList, { checkDisposable: true });

results.forEach((result, email) => {
  console.log(`${email}: ${result.isValid ? 'Valid' : result.error}`);
});
```

---

## API Reference

### Core Validation Function

```typescript
function validateEmail(
  email: string,
  options?: EmailValidationOptions
): EmailValidationResult
```

**Options:**
- `checkDisposable?: boolean` - Check for disposable emails (default: false)
- `strict?: boolean` - Enforce stricter rules (default: false)
- `allowedDomains?: string[]` - Only these domains allowed
- `blockedDomains?: string[]` - These domains blocked
- `normalize?: boolean` - Normalize email (default: true)

**Returns:**
```typescript
interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}
```

### React Hook

```typescript
function useEmailValidation(
  options?: UseEmailValidationOptions
): UseEmailValidationReturn
```

**Options:**
- All validation options from `validateEmail`
- `validateOnBlur?: boolean` - Validate when field loses focus (default: true)
- `validateOnChange?: boolean` - Validate as user types (default: false)
- `debounceDelay?: number` - Debounce delay in ms (default: 300)
- `initialValue?: string` - Initial email value

**Returns:**
```typescript
interface UseEmailValidationReturn {
  value: string;
  validation: EmailValidationResult;
  isValidating: boolean;
  isTouched: boolean;
  shouldShowError: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  validate: () => EmailValidationResult;
  reset: () => void;
  setValue: (value: string) => void;
  errorMessage: string | undefined;
  warningMessages: string[] | undefined;
}
```

### Utility Functions

```typescript
// Sanitize email
sanitizeEmail(email: string): string

// Check disposable
isDisposableEmail(email: string): boolean

// Extract emails from text
extractEmails(text: string): string[]

// Compare emails
areEmailsEquivalent(email1: string, email2: string): boolean

// Mask email for privacy
maskEmail(email: string): string
// Example: john.doe@example.com → j***@example.com
```

---

## Security Considerations

### 🔐 Input Sanitization
All emails are sanitized to prevent:
- **Header Injection**: Removes `<>` characters
- **Whitespace Exploits**: Trims and removes internal spaces
- **Case Sensitivity Issues**: Normalizes to lowercase

### 🔐 SQL Injection Protection
- Always use parameterized queries (Drizzle ORM)
- Validation happens before database interaction
- Database constraints enforce uniqueness

### 🔐 XSS Prevention
- Email validation removes dangerous characters
- Output encoding handled by React
- Never trust client-side validation alone

### 🔐 DoS Protection
- Length limits prevent excessive input
- Debouncing prevents validation spam
- Server-side validation is final authority

### 🔐 Privacy Considerations
- Use `maskEmail()` for displaying emails
- Don't log full emails in production
- GDPR compliance through data minimization

---

## Testing

### Unit Tests (Example)

```typescript
// email.test.ts
import { validateEmail, sanitizeEmail } from '@/lib/validations/email';

describe('Email Validation', () => {
  it('should validate correct email formats', () => {
    expect(validateEmail('user@example.com').isValid).toBe(true);
    expect(validateEmail('user.name+tag@example.co.uk').isValid).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('invalid').isValid).toBe(false);
    expect(validateEmail('@example.com').isValid).toBe(false);
    expect(validateEmail('user@').isValid).toBe(false);
  });

  it('should detect disposable emails', () => {
    const result = validateEmail('user@tempmail.com', { checkDisposable: true });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('disposable');
  });

  it('should sanitize emails', () => {
    expect(sanitizeEmail('  USER@EXAMPLE.COM  ')).toBe('user@example.com');
    expect(sanitizeEmail('user <user@example.com>')).toBe('user user@example.com');
  });

  it('should enforce length constraints', () => {
    const longEmail = 'a'.repeat(320) + '@example.com';
    expect(validateEmail(longEmail).isValid).toBe(false);
  });

  it('should validate domain restrictions', () => {
    const result = validateEmail('user@gmail.com', {
      allowedDomains: ['company.com']
    });
    expect(result.isValid).toBe(false);
  });
});
```

### Integration Tests

```typescript
// API endpoint test
it('should validate email in contact form', async () => {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test User',
      companyName: 'Test Co',
      email: 'invalid.email',
      message: 'Test message',
      turnstileToken: 'test'
    })
  });

  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.errors).toBeDefined();
});
```

---

## Checklist for Email Fields

When adding a new email field to the application:

- [ ] Use `emailSchema` from `@/lib/validations/schemas` in Zod validation
- [ ] Apply `useEmailValidation` hook in React forms for real-time feedback
- [ ] Add `type="email"` to input element for browser validation
- [ ] Display error message when `shouldShowError` is true
- [ ] Server-side: validate with Zod schema before processing
- [ ] Database: ensure email column has appropriate constraints
- [ ] Consider whether to enable `checkDisposable` option
- [ ] Test with various email formats (valid and invalid)
- [ ] Test edge cases (very long emails, special characters)
- [ ] Security review: ensure no email disclosure in error messages

---

## Common Patterns

### Pattern 1: Contact Form
**Location**: `src/components/modals/ContactModal.tsx`
- Uses `contactFormSchema` with enhanced email validation
- Real-time validation on blur
- Server-side validation in API endpoint
- Normalized email before submission

### Pattern 2: Onboarding Form
**Location**: `src/app/onboarding/page.tsx`
- Client email validation
- Should be upgraded to use `useEmailValidation` hook
- Stores email in projects table as `clientEmail`

### Pattern 3: Admin User Management
**Location**: `src/app/(admin)/admin/clients/page.tsx`
- Email editing for existing users
- Validation prevents duplicate emails (database constraint)
- Server-side validation in API endpoint

---

## Migration Guide

If you have existing email validation code, migrate to the new system:

### Before (Basic Validation)
```typescript
const emailSchema = z.string().email();
```

### After (Enhanced Validation)
```typescript
import { emailSchema } from '@/lib/validations/schemas';
// Use in Zod schema - automatically includes all validations
```

### Before (Manual Validation)
```typescript
if (!email.includes('@') || !email.includes('.')) {
  setError('Invalid email');
}
```

### After (Hook-based Validation)
```typescript
const email = useEmailValidation({ validateOnBlur: true });
// Automatic validation, error handling, and UX optimization
```

---

## Troubleshooting

### Issue: Email validation too strict
**Solution**: Adjust validation options
```typescript
// Less strict validation
validateEmail(email, { strict: false, checkDisposable: false });
```

### Issue: Valid emails being rejected
**Solution**: Check for edge cases
```typescript
// Test the specific email
const result = validateEmail(problematicEmail);
console.log(result); // See exact error
```

### Issue: Validation performance issues
**Solution**: Increase debounce delay
```typescript
useEmailValidation({ debounceDelay: 500 }); // Slower typing
```

### Issue: Domain-specific emails not working
**Solution**: Add to allowed domains
```typescript
const schema = createDomainRestrictedEmailSchema([
  'company.com',
  'partner.com',
  'newdomain.com' // Add here
]);
```

---

## Best Practices

1. **Always validate on both client and server** - Client validation is for UX, server validation is for security
2. **Use appropriate validation options** - Don't enable `checkDisposable` for all forms
3. **Normalize emails before storage** - Use `normalize: true` option
4. **Show helpful error messages** - Use `getEmailErrorMessage()` for user-friendly messages
5. **Test edge cases** - International emails, long emails, special characters
6. **Respect privacy** - Use `maskEmail()` when displaying emails
7. **Handle validation errors gracefully** - Provide clear feedback to users
8. **Keep disposable list updated** - Add new disposable domains as discovered

---

## Support

For issues or questions about email validation:
1. Check this documentation
2. Review validation code in `src/lib/validations/email.ts`
3. Test with validation utility directly
4. Check browser console for validation errors
5. Review server logs for API validation failures

---

**Last Updated**: 2025-01-30
**Version**: 1.0.0
**Maintainer**: Lunaxcode Development Team
