# Email Validation Checklist ✅

Quick reference for implementing email validation in Lunaxcode SaaS.

## 📋 Quick Start

### Client-Side (React Forms)

```typescript
import { useEmailValidation } from '@/hooks/useEmailValidation';

const email = useEmailValidation({
  validateOnBlur: true,
  checkDisposable: false // Set to true for important forms
});

<input
  type="email"
  value={email.value}
  onChange={email.onChange}
  onBlur={email.onBlur}
/>
{email.shouldShowError && <p>{email.errorMessage}</p>}
```

### Server-Side (API Routes)

```typescript
import { contactFormSchema } from '@/lib/validations/schemas';

const validatedData = contactFormSchema.parse(body);
// Email is now valid, sanitized, and normalized
```

---

## 🔒 Validation Levels

### Level 1: Format Validation (Always Active)
- ✅ RFC 5322 compliant email format
- ✅ Length constraints (3-320 chars)
- ✅ Valid domain structure
- ✅ Proper TLD (minimum 2 chars)

### Level 2: Sanitization (Always Active)
- ✅ Lowercase conversion
- ✅ Whitespace removal
- ✅ Dangerous character removal
- ✅ Injection prevention

### Level 3: Enhanced Security (Optional)
- ⚙️ Disposable email detection (`checkDisposable: true`)
- ⚙️ Domain restrictions (`allowedDomains`, `blockedDomains`)
- ⚙️ Strict mode (`strict: true`)

---

## 📍 Where Email Validation is Applied

### ✅ Implemented
- [x] Contact form (`/api/contact`)
- [x] Contact modal component
- [x] Admin clients management
- [x] Admin settings
- [x] Client settings
- [x] Database schema (unique constraint on users.email)

### ⚠️ Needs Upgrade
- [ ] Onboarding form (currently basic validation)
- [ ] User registration (when implemented)
- [ ] Password reset (when implemented)

---

## 🛠️ Implementation Checklist

When adding a new email field:

1. **Client-Side**
   - [ ] Import `useEmailValidation` hook
   - [ ] Apply to email input field
   - [ ] Show error when `shouldShowError` is true
   - [ ] Set `type="email"` on input element
   - [ ] Add appropriate validation options

2. **Server-Side**
   - [ ] Import schema from `@/lib/validations/schemas`
   - [ ] Validate with Zod `.parse()` or `.safeParse()`
   - [ ] Handle validation errors with 400 status
   - [ ] Log sanitized email (not raw input)

3. **Database**
   - [ ] Email column defined with `.notNull()`
   - [ ] Add `.unique()` if email should be unique
   - [ ] Consider indexing for performance

4. **Testing**
   - [ ] Test valid email formats
   - [ ] Test invalid formats (missing @, no domain, etc.)
   - [ ] Test edge cases (very long, special chars)
   - [ ] Test disposable emails (if enabled)
   - [ ] Test server-side validation

---

## 🚨 Security Rules

### ❌ NEVER Do This
```typescript
// Don't use basic string validation
email: z.string().email() // Too basic!

// Don't skip server-side validation
const email = req.body.email; // Trust nothing!

// Don't log raw emails in production
console.log('Email:', rawEmail); // Privacy issue!
```

### ✅ ALWAYS Do This
```typescript
// Use enhanced validation
import { emailSchema } from '@/lib/validations/schemas';
email: emailSchema // Comprehensive validation

// Always validate on server
const validated = emailSchema.parse(body.email);

// Mask emails in logs
console.log('Email:', maskEmail(email));
```

---

## 🎯 Common Use Cases

### Use Case 1: Public Contact Form
```typescript
// Enable disposable check to prevent spam
const email = useEmailValidation({
  checkDisposable: true,
  validateOnBlur: true
});
```

### Use Case 2: User Registration
```typescript
// Strict validation for important operations
const email = useEmailValidation({
  checkDisposable: true,
  strict: true,
  validateOnChange: true
});
```

### Use Case 3: Corporate Domain Only
```typescript
import { createDomainRestrictedEmailSchema } from '@/lib/validations/schemas';

const corporateEmailSchema = createDomainRestrictedEmailSchema([
  'company.com',
  'partner.com'
]);
```

### Use Case 4: Quick Validation
```typescript
import { validateEmail } from '@/lib/validations/email';

const result = validateEmail('user@example.com');
if (!result.isValid) {
  console.error(result.error);
}
```

---

## 📚 Documentation

**Full Guide**: `docs/EMAIL_VALIDATION_GUIDE.md`

**Source Files**:
- Core: `src/lib/validations/email.ts`
- Hooks: `src/hooks/useEmailValidation.ts`
- Schemas: `src/lib/validations/schemas.ts`

---

## 🔧 Troubleshooting

### Problem: Email validation too strict
**Solution**: Disable optional checks
```typescript
validateEmail(email, {
  checkDisposable: false,
  strict: false
});
```

### Problem: Valid international emails rejected
**Solution**: Email validation supports international formats, but check for edge cases
```typescript
// Test specific email
const result = validateEmail(problematicEmail);
console.log(result); // See exact error
```

### Problem: Performance issues with onChange
**Solution**: Increase debounce delay
```typescript
useEmailValidation({
  validateOnChange: true,
  debounceDelay: 500 // Slower validation
});
```

---

## 🎨 UI Examples

### Basic Input with Validation
```typescript
const email = useEmailValidation();

<input
  type="email"
  value={email.value}
  onChange={email.onChange}
  onBlur={email.onBlur}
  className={email.shouldShowError ? 'border-red-500' : 'border-gray-300'}
/>
{email.shouldShowError && (
  <p className="text-red-600 text-sm mt-1">
    {email.errorMessage}
  </p>
)}
```

### With Loading State
```typescript
<input
  type="email"
  value={email.value}
  onChange={email.onChange}
  onBlur={email.onBlur}
  disabled={email.isValidating}
/>
{email.isValidating && <Spinner />}
{email.shouldShowError && <ErrorMessage />}
```

### With Success Indicator
```typescript
<input
  type="email"
  className={
    email.shouldShowError
      ? 'border-red-500'
      : email.isTouched && email.validation.isValid
      ? 'border-green-500'
      : 'border-gray-300'
  }
/>
```

---

## 📊 Validation Flow

```
User Input → Client Validation → UI Feedback
                ↓
         Form Submit → API Request
                ↓
         Server Validation (Zod)
                ↓
    Valid? → Process    Invalid? → 400 Error
                ↓
          Database Insert
                ↓
       Success Response
```

---

## ⚡ Performance Tips

1. **Use debouncing** for onChange validation (default: 300ms)
2. **Validate on blur** instead of onChange for better UX
3. **Memoize** validation options if using in loops
4. **Batch validate** multiple emails with `validateEmails()`
5. **Cache** validation results for repeated checks

---

## 🔐 Security Best Practices

1. ✅ Always validate on both client AND server
2. ✅ Sanitize emails before database storage
3. ✅ Use parameterized queries (Drizzle ORM handles this)
4. ✅ Mask emails in logs and error messages
5. ✅ Enable disposable check for sensitive operations
6. ✅ Rate limit email validation endpoints
7. ✅ Never expose validation logic details to users

---

## 📱 Mobile Considerations

```typescript
// Mobile-friendly email input
<input
  type="email"
  inputMode="email" // Mobile keyboard optimization
  autoCapitalize="none"
  autoCorrect="off"
  spellCheck="false"
/>
```

---

**Quick Help**: See `docs/EMAIL_VALIDATION_GUIDE.md` for detailed documentation

**Last Updated**: 2025-01-30
