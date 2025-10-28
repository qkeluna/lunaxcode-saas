/**
 * Cloudflare Turnstile Verification
 *
 * Server-side verification for Cloudflare Turnstile tokens.
 * Used to prevent bot abuse on login and other sensitive operations.
 */

interface TurnstileVerificationResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verifies a Cloudflare Turnstile token on the server side
 *
 * @param token - The Turnstile token from the client
 * @param remoteIp - Optional: The user's IP address for additional verification
 * @returns Promise<boolean> - True if verification succeeds, false otherwise
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    // In development, you might want to skip verification
    if (process.env.NODE_ENV === 'development') {
      console.warn('Skipping Turnstile verification in development mode');
      return true;
    }
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const data: TurnstileVerificationResponse = await response.json();

    if (!data.success) {
      console.error('Turnstile verification failed:', data['error-codes']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
}

/**
 * Gets the Turnstile site key for client-side use
 * Returns a test key in development if not configured
 */
export function getTurnstileSiteKey(): string {
  return (
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    '1x00000000000000000000AA' // Cloudflare's test site key (always passes)
  );
}

/**
 * Checks if Turnstile is properly configured
 */
export function isTurnstileConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    process.env.TURNSTILE_SECRET_KEY
  );
}
