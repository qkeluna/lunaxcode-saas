-- Migration: Fix popular flags and add Mobile App service
-- Created: 2025-10-16
-- Description: Ensure only Business Website is marked as popular and add Mobile App service

-- Step 1: Reset all popular flags to false
UPDATE service_types SET popular = 0;

-- Step 2: Set only Business Website (id=2) as popular
UPDATE service_types SET popular = 1 WHERE id = 2;

-- Step 3: Update Web Application price to 150000
UPDATE service_types SET base_price = 150000 WHERE id = 4;

-- Step 4: Update service descriptions and features to match new standards
UPDATE service_types
SET
  description = 'Professional single-page website perfect for showcasing your business, product, or service',
  features = '["Responsive design (mobile, tablet, desktop)","Up to 5 sections","Contact form integration","Basic SEO optimization","Social media links","1 round of revisions","30 days support"]'
WHERE id = 1;

UPDATE service_types
SET
  description = 'Multi-page website ideal for established businesses with multiple services or products',
  features = '["Up to 10 pages","Responsive design","Content Management System (CMS)","Blog functionality","Advanced SEO","Google Analytics integration","Contact forms","2 rounds of revisions","60 days support"]'
WHERE id = 2;

UPDATE service_types
SET
  description = 'Full-featured online store with payment integration for selling products online',
  features = '["Product catalog with categories","Shopping cart functionality","Payment gateway integration (PayMongo, GCash, PayMaya)","Inventory management","Order tracking system","Customer accounts","Admin dashboard","Mobile responsive","SSL certificate","3 rounds of revisions","90 days support"]'
WHERE id = 3;

UPDATE service_types
SET
  description = 'Custom web application tailored to your specific business needs and workflows',
  features = '["Custom functionality development","User authentication & roles","Database design & integration","API development","Admin dashboard","Real-time features","Third-party integrations","Scalable architecture","Security best practices","Unlimited revisions","180 days support"]'
WHERE id = 4;

-- Step 5: Add Mobile App service if it doesn't exist
INSERT OR IGNORE INTO service_types (
  id,
  name,
  description,
  base_price,
  features,
  timeline,
  popular,
  is_active,
  created_at
) VALUES (
  5,
  'Mobile App',
  'Native iOS and Android applications with seamless user experience',
  200000,
  '["Cross-platform development (iOS & Android)","Native performance","Push notifications","Offline functionality","In-app purchases","Analytics integration","App store submission","Custom UI/UX design","Backend API development","Unlimited revisions","1 year support"]',
  '8-16 weeks',
  0,
  1,
  CURRENT_TIMESTAMP
);
