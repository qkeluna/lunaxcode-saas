// This file configures the initialization of Sentry on the server side.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out known errors
  beforeSend(event, hint) {
    // Don't send server errors for 404s
    if (event.exception?.values?.[0]?.value?.includes('ENOENT')) {
      return null;
    }

    return event;
  },

  environment: process.env.NODE_ENV,

  // Uncomment below to enable Sentry performance monitoring
  // Note: This may affect performance on Cloudflare Pages
  // integrations: [
  //   Sentry.httpIntegration(),
  // ],
});
