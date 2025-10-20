/**
 * API Key Validation Endpoint
 * POST /api/ai/validate
 *
 * Validates API keys for AI providers
 * Makes a minimal test request to verify the key works
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeAIRequest } from '@/lib/ai/proxy-service';
import { validateApiKeyFormat, isSupportedProvider, getDefaultModel } from '@/lib/ai/provider-config';
import { AIProxyException, logErrorSafely } from '@/lib/ai/error-handler';
import { addSecurityHeaders, performSecurityChecks } from '@/lib/ai/rate-limiter';
import type { ValidateKeyRequest, ValidateKeyResponse, AIProvider } from '@/lib/ai/types';

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
 * Handle POST request to validate API key
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Perform security checks
    await performSecurityChecks(request);

    // 2. Parse request body
    const body = (await request.json()) as ValidateKeyRequest;

    // 3. Validate request
    if (!body.provider || !body.apiKey) {
      throw new AIProxyException('INVALID_REQUEST', 'Provider and apiKey are required', 400);
    }

    if (!isSupportedProvider(body.provider)) {
      throw new AIProxyException('INVALID_REQUEST', `Unsupported provider: ${body.provider}`, 400);
    }

    // 4. Check API key format
    if (!validateApiKeyFormat(body.provider as AIProvider, body.apiKey)) {
      const response: ValidateKeyResponse = {
        valid: false,
        provider: body.provider as AIProvider,
        error: 'Invalid API key format',
      };

      const errorResponse = NextResponse.json(response, { status: 200 });
      return addSecurityHeaders(errorResponse);
    }

    // 5. Make a minimal test request to verify the key works
    try {
      await executeAIRequest({
        provider: body.provider as AIProvider,
        model: getDefaultModel(body.provider as AIProvider),
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
        apiKey: body.apiKey,
        maxTokens: 10, // Minimal tokens to save costs
      });

      // If we get here, the key is valid
      const response: ValidateKeyResponse = {
        valid: true,
        provider: body.provider as AIProvider,
      };

      const successResponse = NextResponse.json(response, { status: 200 });
      return addSecurityHeaders(successResponse);
    } catch (error: any) {
      // Key is invalid or has other issues
      let errorMessage = 'API key validation failed';

      if (error instanceof AIProxyException) {
        if (error.code === 'INVALID_API_KEY') {
          errorMessage = 'Invalid API key';
        } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
          errorMessage = 'Rate limit exceeded - key appears valid but is rate limited';
        } else {
          errorMessage = error.message;
        }
        logErrorSafely(error);
      }

      const response: ValidateKeyResponse = {
        valid: false,
        provider: body.provider as AIProvider,
        error: errorMessage,
      };

      const errorResponse = NextResponse.json(response, { status: 200 });
      return addSecurityHeaders(errorResponse);
    }
  } catch (error: any) {
    // Handle validation errors
    if (error instanceof AIProxyException) {
      logErrorSafely(error);

      const errorResponse = NextResponse.json(error.toJSON(), {
        status: error.statusCode,
      });

      return addSecurityHeaders(errorResponse);
    }

    // Handle unexpected errors
    console.error('Unexpected error in validation endpoint:', error);

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
