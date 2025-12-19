import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { contactFormSchema } from '@/lib/validations/schemas';
import { sendContactEmail } from '@/lib/email';

// Edge Runtime required for Cloudflare Pages
export const runtime = 'edge';

// Turnstile verification endpoint
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verify Turnstile token with Cloudflare
 */
async function verifyTurnstileToken(token: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not configured, skipping verification');
    return { success: true }; // Allow in development without Turnstile
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json() as {
      success: boolean;
      'error-codes'?: string[];
    };

    if (!data.success) {
      console.error('Turnstile verification failed:', data['error-codes']);
      return {
        success: false,
        error: 'Bot verification failed. Please try again.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return {
      success: false,
      error: 'Verification service unavailable',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Contact API called');

    // Parse and validate request body
    const body = await request.json();
    console.log('Request body received:', {
      hasFullName: !!body.fullName,
      hasCompanyName: !!body.companyName,
      hasEmail: !!body.email,
      hasMessage: !!body.message,
      hasTurnstileToken: !!body.turnstileToken,
    });

    // Validate Turnstile token if provided (or if TURNSTILE_SECRET_KEY is set)
    if (body.turnstileToken || process.env.TURNSTILE_SECRET_KEY) {
      if (!body.turnstileToken) {
        return NextResponse.json(
          {
            success: false,
            message: 'Please complete the verification challenge',
          },
          { status: 400 }
        );
      }

      const turnstileResult = await verifyTurnstileToken(body.turnstileToken);
      if (!turnstileResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: turnstileResult.error || 'Verification failed',
          },
          { status: 400 }
        );
      }
      console.log('Turnstile verification passed');
    }

    // Validate form data
    const validatedData = contactFormSchema.parse(body);
    console.log('Data validated successfully');

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { success: false, message: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Send email using centralized email service
    const result = await sendContactEmail({
      fullName: validatedData.fullName,
      companyName: validatedData.companyName,
      email: validatedData.email,
      contactNumber: validatedData.contactNumber,
      message: validatedData.message,
    });

    if (!result.success) {
      console.error('Email send failed:', result.error);
      return NextResponse.json(
        { success: false, message: 'Failed to send email', error: result.error },
        { status: 500 }
      );
    }

    console.log('Email sent successfully, ID:', result.emailId);

    return NextResponse.json(
      {
        success: true,
        message: 'Quote request sent successfully',
        emailId: result.emailId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact request:', error);
    console.error('Error type:', error instanceof z.ZodError ? 'ZodError' : error instanceof Error ? 'Error' : typeof error);

    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: error.errors,
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error message:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
