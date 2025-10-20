/**
 * AI Streaming Proxy API Route
 * POST /api/ai/stream
 *
 * Streaming endpoint for real-time AI responses
 * Returns Server-Sent Events (SSE) stream
 */

import { NextRequest } from 'next/server';
import { executeStreamingRequest } from '@/lib/ai/proxy-service';
import { validateProxyRequest, AIProxyException, logRequestSafely, logErrorSafely } from '@/lib/ai/error-handler';
import { performSecurityChecks } from '@/lib/ai/rate-limiter';

export const runtime = 'edge';

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
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
 * Handle POST request for streaming AI responses
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Perform security checks
    await performSecurityChecks(request);

    // 2. Parse and validate request body
    const body = await request.json();
    const validatedRequest = validateProxyRequest(body);

    // 3. Ensure streaming is enabled
    validatedRequest.stream = true;

    // 4. Log request
    logRequestSafely(validatedRequest.provider, validatedRequest.model, validatedRequest.messages.length);

    // 5. Execute streaming request
    const stream = await executeStreamingRequest(validatedRequest);

    // 6. Return streaming response
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    // Handle AIProxyException
    if (error instanceof AIProxyException) {
      logErrorSafely(error);

      return new Response(JSON.stringify(error.toJSON()), {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Handle unexpected errors
    console.error('Unexpected error in streaming proxy:', error);

    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
