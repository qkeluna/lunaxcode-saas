'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Utility function to track events
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, eventParams);
  }
}

// Pre-defined conversion events
export const conversionEvents = {
  contactFormSubmit: () =>
    trackEvent('generate_lead', {
      event_category: 'Contact Form',
      event_label: 'Quote Request',
      value: 1,
    }),

  whatsappClick: () =>
    trackEvent('click', {
      event_category: 'Contact',
      event_label: 'WhatsApp Button',
      value: 1,
    }),

  phoneClick: () =>
    trackEvent('click', {
      event_category: 'Contact',
      event_label: 'Phone Call',
      value: 1,
    }),

  emailClick: () =>
    trackEvent('click', {
      event_category: 'Contact',
      event_label: 'Email Link',
      value: 1,
    }),

  ctaClick: (label: string) =>
    trackEvent('click', {
      event_category: 'CTA',
      event_label: label,
      value: 1,
    }),

  serviceView: (serviceName: string) =>
    trackEvent('view_item', {
      event_category: 'Service',
      event_label: serviceName,
    }),
};
