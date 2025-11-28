// This file configures the initialization of Sentry for edge runtime (Cloudflare Workers).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Edge runtime has limitations, so we keep integrations minimal
  integrations: [],

  // Filter out known errors
  beforeSend(event, hint) {
    return event;
  },

  environment: process.env.NODE_ENV,
});
