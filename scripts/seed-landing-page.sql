-- ================================================================
-- Landing Page Service - Questionnaire & Add-ons Seed Data
-- Date: 2025-10-29
-- Description: Seed Landing Page questions and add-ons system
-- ================================================================

-- ================================================================
-- 1. UPDATE LANDING PAGE SERVICE
-- ================================================================

UPDATE service_types
SET
  description = 'Professional single-page website optimized for conversions. Perfect for product launches, lead generation, events, and service promotion.',
  features = '["Responsive design (mobile, tablet, desktop)","Up to 8 customizable sections","Contact form with email notifications","SEO optimization (meta tags, sitemap)","Social media links integration","Fast loading speed (<2 seconds)","SSL certificate included","2 rounds of revisions","30 days technical support","Free Google Analytics setup"]',
  timeline = '1-2 weeks',
  popular = 1
WHERE name = 'Landing Page';

-- ================================================================
-- 2. CREATE LANDING PAGE QUESTIONNAIRE
-- ================================================================

-- Question 1: Landing Page Type (Select)
INSERT INTO questions (service_id, question_key, question_text, question_type, required, placeholder, sort_order, created_at)
SELECT id, 'landing_page_type', 'What type of landing page do you need?', 'select', 1, 'Select landing page type', 1, strftime('%s', 'now')
FROM service_types WHERE name = 'Landing Page';

-- Get the question ID for options (using last_insert_rowid())
INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'landing_page_type' ORDER BY id DESC LIMIT 1),
  'Product Launch',
  0,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'landing_page_type' ORDER BY id DESC LIMIT 1),
  'Lead Generation',
  1,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'landing_page_type' ORDER BY id DESC LIMIT 1),
  'Event Registration',
  2,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'landing_page_type' ORDER BY id DESC LIMIT 1),
  'App Download',
  3,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'landing_page_type' ORDER BY id DESC LIMIT 1),
  'Service Promotion',
  4,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'landing_page_type' ORDER BY id DESC LIMIT 1),
  'Newsletter Signup',
  5,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'landing_page_type' ORDER BY id DESC LIMIT 1),
  'Webinar Registration',
  6,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'landing_page_type' ORDER BY id DESC LIMIT 1),
  'E-book/Resource Download',
  7,
  strftime('%s', 'now');

-- Question 2: Design Style (Radio)
INSERT INTO questions (service_id, question_key, question_text, question_type, required, sort_order, created_at)
SELECT id, 'design_style', 'What design style do you prefer?', 'radio', 1, 2, strftime('%s', 'now')
FROM service_types WHERE name = 'Landing Page';

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'design_style' ORDER BY id DESC LIMIT 1),
  'Modern/Minimalist',
  0,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'design_style' ORDER BY id DESC LIMIT 1),
  'Bold/Colorful',
  1,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'design_style' ORDER BY id DESC LIMIT 1),
  'Professional/Corporate',
  2,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'design_style' ORDER BY id DESC LIMIT 1),
  'Creative/Artistic',
  3,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'design_style' ORDER BY id DESC LIMIT 1),
  'Tech/Startup',
  4,
  strftime('%s', 'now');

-- Question 3: Required Sections (Checkbox)
INSERT INTO questions (service_id, question_key, question_text, question_type, required, sort_order, created_at)
SELECT id, 'required_sections', 'Which sections would you like to include?', 'checkbox', 1, 3, strftime('%s', 'now')
FROM service_types WHERE name = 'Landing Page';

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'required_sections' ORDER BY id DESC LIMIT 1),
  'Hero Section',
  0,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'required_sections' ORDER BY id DESC LIMIT 1),
  'Features/Benefits',
  1,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'required_sections' ORDER BY id DESC LIMIT 1),
  'Testimonials',
  2,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'required_sections' ORDER BY id DESC LIMIT 1),
  'FAQ',
  3,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'required_sections' ORDER BY id DESC LIMIT 1),
  'About Us',
  4,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'required_sections' ORDER BY id DESC LIMIT 1),
  'Pricing/Plans',
  5,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'required_sections' ORDER BY id DESC LIMIT 1),
  'Contact Form',
  6,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'required_sections' ORDER BY id DESC LIMIT 1),
  'Gallery/Portfolio',
  7,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'required_sections' ORDER BY id DESC LIMIT 1),
  'Trust Indicators (logos, badges)',
  8,
  strftime('%s', 'now');

INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  (SELECT id FROM questions WHERE question_key = 'required_sections' ORDER BY id DESC LIMIT 1),
  'Video/Demo Section',
  9,
  strftime('%s', 'now');

-- Question 4: Brand Colors (Text, Optional)
INSERT INTO questions (service_id, question_key, question_text, question_type, required, placeholder, sort_order, created_at)
SELECT id, 'brand_colors', 'Do you have preferred brand colors? (Optional)', 'text', 0, 'e.g., #FF5733, Blue, Purple', 4, strftime('%s', 'now')
FROM service_types WHERE name = 'Landing Page';

-- Question 5: Target Audience (Textarea, Required)
INSERT INTO questions (service_id, question_key, question_text, question_type, required, placeholder, sort_order, created_at)
SELECT id, 'target_audience', 'Who is your target audience?', 'textarea', 1, 'e.g., Small business owners aged 25-45, Tech-savvy millennials', 5, strftime('%s', 'now')
FROM service_types WHERE name = 'Landing Page';

-- Question 6: Call-to-Action Goal (Text, Required)
INSERT INTO questions (service_id, question_key, question_text, question_type, required, placeholder, sort_order, created_at)
SELECT id, 'cta_goal', 'What is your main call-to-action goal?', 'text', 1, 'e.g., Get Free Quote, Download App, Register for Event', 6, strftime('%s', 'now')
FROM service_types WHERE name = 'Landing Page';

-- Question 7: Inspiration URLs (Textarea, Optional)
INSERT INTO questions (service_id, question_key, question_text, question_type, required, placeholder, sort_order, created_at)
SELECT id, 'inspiration_urls', 'Any competitor or inspiration websites? (Optional, comma-separated)', 'textarea', 0, 'https://example.com, https://competitor.com', 7, strftime('%s', 'now')
FROM service_types WHERE name = 'Landing Page';

-- ================================================================
-- 3. CREATE ADD-ONS (25 items across 6 categories)
-- ================================================================

-- ANALYTICS & TRACKING (4 items, 3 FREE)
INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Google Analytics', 'Track website traffic, user behavior, and conversion rates', 'analytics', 0, 1, 1, 1, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Meta Pixel (Facebook Ads)', 'Track conversions from Facebook/Instagram ads and create retargeting audiences', 'analytics', 0, 1, 1, 2, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Google Tag Manager', 'Manage all tracking codes and marketing tags in one place', 'analytics', 0, 1, 1, 3, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Hotjar (Heatmaps & Recordings)', 'See how users interact with your site through heatmaps and session recordings', 'analytics', 3000, 0, 1, 4, strftime('%s', 'now'));

-- MARKETING & LEAD CAPTURE (5 items)
INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Mailchimp Integration', 'Automatically sync email signups to Mailchimp for email marketing campaigns', 'marketing', 3000, 0, 1, 10, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'ConvertKit Integration', 'Sync subscribers to ConvertKit for creator-focused email marketing', 'marketing', 3000, 0, 1, 11, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Brevo (formerly Sendinblue) Integration', 'Email marketing and SMS campaigns with advanced automation', 'marketing', 3000, 0, 1, 12, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'HubSpot CRM Integration', 'Sync leads directly to HubSpot for sales and marketing automation', 'marketing', 5000, 0, 1, 13, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'ActiveCampaign Integration', 'Advanced marketing automation with CRM and email marketing combined', 'marketing', 5000, 0, 1, 14, strftime('%s', 'now'));

-- COMMUNICATION (5 items)
INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Tawk.to Live Chat', 'Free live chat with premium features integration', 'communication', 2000, 0, 1, 20, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Crisp Chat', 'Modern live chat with chatbot and shared inbox capabilities', 'communication', 3500, 0, 1, 21, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Calendly Integration', 'Automated appointment booking directly from your landing page', 'communication', 3000, 0, 1, 22, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'WhatsApp Business API', 'Direct WhatsApp messaging button with business features', 'communication', 4000, 0, 1, 23, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Intercom Live Chat', 'Professional live chat widget for real-time customer support', 'communication', 4000, 0, 1, 24, strftime('%s', 'now'));

-- SOCIAL & COMMUNITY (4 items, 1 FREE)
INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Social Sharing Buttons', 'Share your content on social media platforms', 'social', 0, 1, 1, 30, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Google Reviews Widget', 'Display Google Business reviews to build trust', 'social', 2000, 0, 1, 31, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Trustpilot Reviews Widget', 'Showcase Trustpilot ratings and reviews', 'social', 2000, 0, 1, 32, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Social Media Feeds', 'Display Instagram, Facebook, or Twitter feeds on your landing page', 'social', 2500, 0, 1, 33, strftime('%s', 'now'));

-- PAYMENT & E-COMMERCE (3 items)
INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'PayPal Integration', 'Accept PayPal payments worldwide', 'payment', 4000, 0, 1, 40, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'PayMongo Payment Gateway', 'Accept credit cards, GCash, PayMaya, and bank transfers (Philippine payment gateway)', 'payment', 5000, 0, 1, 41, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Stripe Payment Gateway', 'International payment processing for cards and wallets', 'payment', 5000, 0, 1, 42, strftime('%s', 'now'));

-- OTHER SERVICES (4 items)
INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Typeform Integration', 'Beautiful interactive forms with advanced logic and integrations', 'other', 3000, 0, 1, 50, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'SMS Notifications (Semaphore)', 'Send SMS notifications for form submissions or updates', 'other', 3500, 0, 1, 51, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Zoom Webinar Integration', 'Automatic webinar registration sync with Zoom', 'other', 4000, 0, 1, 52, strftime('%s', 'now'));

INSERT INTO add_ons (service_type_id, name, description, category, price, is_free, is_active, sort_order, created_at)
VALUES (NULL, 'Custom API Integration', 'Integrate with any third-party service via custom API development', 'other', 10000, 0, 1, 53, strftime('%s', 'now'));
