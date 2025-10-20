/**
 * AI Proxy API Route
 * POST /api/ai/proxy
 *
 * Universal proxy endpoint for all AI providers
 * Accepts provider ID, model, messages, and API key
 * Returns unified response format
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeAIRequest } from '@/lib/ai/proxy-service';
import { validateProxyRequest, AIProxyException, logRequestSafely, logErrorSafely } from '@/lib/ai/error-handler';
import { performSecurityChecks, addSecurityHeaders } from '@/lib/ai/rate-limiter';

export const runtime = 'edge';

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Handle POST request to proxy AI requests
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Perform security checks (rate limiting, validation, etc.)
    await performSecurityChecks(request);

    // 2. Parse and validate request body
    const body = await request.json();
    const validatedRequest = validateProxyRequest(body);

    // 3. Log request (safely, without API keys)
    logRequestSafely(validatedRequest.provider, validatedRequest.model, validatedRequest.messages.length);

    // 4. Execute AI request through proxy
    const response = await executeAIRequest(validatedRequest);

    // 5. Calculate duration
    const duration = Date.now() - startTime;

    // 6. Return success response
    const successResponse = NextResponse.json(
      {
        ...response,
        metadata: {
          duration,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );

    return addSecurityHeaders(successResponse);
  } catch (error: any) {
    // Handle AIProxyException
    if (error instanceof AIProxyException) {
      logErrorSafely(error);

      const errorResponse = NextResponse.json(error.toJSON(), {
        status: error.statusCode,
      });

      return addSecurityHeaders(errorResponse);
    }

    // Handle unexpected errors
    console.error('Unexpected error in AI proxy:', error);

    const genericError = NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );

    return addSecurityHeaders(genericError);
  }
}
