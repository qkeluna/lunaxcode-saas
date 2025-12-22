export const metadata = {
  title: 'Lunaxcode - Web Development Agency for Filipino Businesses',
  description: 'Professional web development services with AI-powered project management. Build your landing page, business website, or custom application with our expert team.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: Root layout already provides <html> and <body> tags
  // This layout only provides metadata overrides for marketing pages
  return <>{children}</>;
}
