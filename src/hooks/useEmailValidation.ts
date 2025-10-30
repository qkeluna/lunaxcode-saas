'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  validateEmail,
  sanitizeEmail,
  type EmailValidationOptions,
  type EmailValidationResult,
} from '@/lib/validations/email';

export interface UseEmailValidationOptions extends EmailValidationOptions {
  /** Validate on blur (default: true) */
  validateOnBlur?: boolean;
  /** Validate on change (default: false) */
  validateOnChange?: boolean;
  /** Debounce delay in ms for onChange validation (default: 300) */
  debounceDelay?: number;
  /** Initial value */
  initialValue?: string;
}

export interface UseEmailValidationReturn {
  /** Current email value */
  value: string;
  /** Validation result */
  validation: EmailValidationResult;
  /** Is currently validating (useful for async validation) */
  isValidating: boolean;
  /** Has the field been touched */
  isTouched: boolean;
  /** Should show error (touched AND invalid) */
  shouldShowError: boolean;
  /** Change handler for input */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Blur handler for input */
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Manual validation trigger */
  validate: () => EmailValidationResult;
  /** Reset the field */
  reset: () => void;
  /** Set value programmatically */
  setValue: (value: string) => void;
  /** Get error message (if any) */
  errorMessage: string | undefined;
  /** Get warning messages (if any) */
  warningMessages: string[] | undefined;
}

/**
 * React hook for email validation with form integration
 *
 * @example
 * ```tsx
 * const email = useEmailValidation({
 *   validateOnBlur: true,
 *   checkDisposable: true
 * });
 *
 * return (
 *   <div>
 *     <input
 *       type="email"
 *       value={email.value}
 *       onChange={email.onChange}
 *       onBlur={email.onBlur}
 *     />
 *     {email.shouldShowError && <p>{email.errorMessage}</p>}
 *   </div>
 * );
 * ```
 */
export function useEmailValidation(
  options: UseEmailValidationOptions = {}
): UseEmailValidationReturn {
  const {
    validateOnBlur = true,
    validateOnChange = false,
    debounceDelay = 300,
    initialValue = '',
    ...validationOptions
  } = options;

  const [value, setValue] = useState(initialValue);
  const [validation, setValidation] = useState<EmailValidationResult>({ isValid: true });
  const [isTouched, setIsTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Debounce timer ref
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const validate = useCallback(
    (emailToValidate: string = value): EmailValidationResult => {
      const result = validateEmail(emailToValidate, validationOptions);
      setValidation(result);
      return result;
    },
    [value, validationOptions]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (validateOnChange) {
        // Clear existing timer
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        setIsValidating(true);

        // Set new debounced validation
        const timer = setTimeout(() => {
          validate(newValue);
          setIsValidating(false);
        }, debounceDelay);

        setDebounceTimer(timer);
      } else {
        // Clear validation errors when typing (UX improvement)
        if (isTouched && !validation.isValid) {
          setValidation({ isValid: true });
        }
      }
    },
    [validateOnChange, debounceDelay, debounceTimer, validate, isTouched, validation.isValid]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsTouched(true);

      if (validateOnBlur) {
        validate(e.target.value);
      }
    },
    [validateOnBlur, validate]
  );

  const reset = useCallback(() => {
    setValue(initialValue);
    setValidation({ isValid: true });
    setIsTouched(false);
    setIsValidating(false);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [initialValue, debounceTimer]);

  const setValueManually = useCallback((newValue: string) => {
    setValue(newValue);
    if (isTouched) {
      validate(newValue);
    }
  }, [isTouched, validate]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const shouldShowError = isTouched && !validation.isValid && !isValidating;

  return {
    value,
    validation,
    isValidating,
    isTouched,
    shouldShowError,
    onChange: handleChange,
    onBlur: handleBlur,
    validate: () => validate(value),
    reset,
    setValue: setValueManually,
    errorMessage: validation.error,
    warningMessages: validation.warnings,
  };
}

/**
 * Simplified email validation hook for use with react-hook-form
 * Returns only the validation function
 *
 * @example
 * ```tsx
 * const { register, formState: { errors } } = useForm();
 * const validateEmailField = useEmailValidator();
 *
 * <input
 *   {...register('email', {
 *     validate: validateEmailField
 *   })}
 * />
 * ```
 */
export function useEmailValidator(options: EmailValidationOptions = {}) {
  return useCallback(
    (value: string): true | string => {
      const result = validateEmail(value, options);
      return result.isValid ? true : result.error || 'Invalid email address';
    },
    [options]
  );
}

/**
 * Hook for sanitizing email input in real-time
 * Useful for preventing invalid characters as user types
 *
 * @example
 * ```tsx
 * const email = useSanitizedEmail();
 *
 * <input
 *   type="email"
 *   value={email.value}
 *   onChange={email.onChange}
 * />
 * ```
 */
export function useSanitizedEmail(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeEmail(e.target.value);
    setValue(sanitized);
  }, []);

  return {
    value,
    onChange: handleChange,
    setValue,
  };
}
