-- SEED DATA FOR 'questions' TABLE

-- Landing Page Questions (service_id = 1)
INSERT INTO questions (service_id, question_key, label, type, is_required, placeholder) VALUES
(1, 'pageType', 'What type of landing page?', 'select', TRUE, NULL),
(1, 'designStyle', 'Preferred design style', 'select', TRUE, NULL),
(1, 'sections', 'Required sections', 'checkbox', TRUE, NULL),
(1, 'ctaGoal', 'Primary call-to-action goal', 'text', TRUE, 'e.g., Sign up for free trial, Download app, Contact sales...'),
(1, 'targetFramework', 'Preferred technology', 'select', TRUE, NULL),
(1, 'integrations', 'Required integrations', 'checkbox', FALSE, NULL);

-- Web Application Questions (service_id = 2)
INSERT INTO questions (service_id, question_key, label, type, is_required, placeholder) VALUES
(2, 'appType', 'Application type', 'select', TRUE, NULL),
(2, 'userRoles', 'User roles needed', 'checkbox', TRUE, NULL),
(2, 'coreFeatures', 'Core features', 'checkbox', TRUE, NULL),
(2, 'frontend', 'Frontend technology', 'select', TRUE, NULL),
(2, 'backend', 'Backend preference', 'select', TRUE, NULL),
(2, 'database', 'Database type', 'select', TRUE, NULL);

-- E-commerce Questions (service_id = 3)
INSERT INTO questions (service_id, question_key, label, type, is_required, placeholder) VALUES
(3, 'storeType', 'Store type', 'select', TRUE, NULL),
(3, 'productCount', 'Expected number of products', 'select', TRUE, NULL),
(3, 'ecommerceFeatures', 'Required features', 'checkbox', TRUE, NULL),
(3, 'paymentMethods', 'Payment methods', 'checkbox', TRUE, NULL),
(3, 'platform', 'Preferred platform', 'select', TRUE, NULL),
(3, 'shippingZones', 'Shipping zones', 'select', TRUE, NULL);

-- Mobile App Questions (service_id = 4)
INSERT INTO questions (service_id, question_key, label, type, is_required, placeholder) VALUES
(4, 'appCategory', 'App category', 'select', TRUE, NULL),
(4, 'platforms', 'Target platforms', 'checkbox', TRUE, NULL),
(4, 'appType', 'App type', 'select', TRUE, NULL),
(4, 'coreFeatures', 'Core features', 'checkbox', TRUE, NULL),
(4, 'monetization', 'Monetization model', 'select', FALSE, NULL),
(4, 'backendNeeds', 'Backend requirements', 'checkbox', TRUE, NULL);

-- SEED DATA FOR 'question_options' TABLE
-- This assumes the question IDs are auto-incremented sequentially starting from 1.

-- Options for Question 1: pageType
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(1, 'Product Launch', 0), (1, 'Lead Generation', 1), (1, 'Event Registration', 2), (1, 'App Download', 3), (1, 'Service Promotion', 4), (1, 'Newsletter Signup', 5);

-- Options for Question 2: designStyle
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(2, 'Modern/Minimalist', 0), (2, 'Bold/Colorful', 1), (2, 'Professional/Corporate', 2), (2, 'Creative/Artistic', 3), (2, 'Tech/Startup', 4);

-- Options for Question 3: sections
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(3, 'Hero Section', 0), (3, 'Features/Benefits', 1), (3, 'Testimonials', 2), (3, 'Pricing', 3), (3, 'FAQ', 4), (3, 'Contact Form', 5), (3, 'About Us', 6), (3, 'Gallery/Portfolio', 7);

-- Options for Question 5: targetFramework
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(5, 'HTML/CSS/JavaScript', 0), (5, 'React', 1), (5, 'Vue.js', 2), (5, 'Next.js', 3), (5, 'Tailwind CSS', 4), (5, 'Bootstrap', 5);

-- Options for Question 6: integrations
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(6, 'Google Analytics', 0), (6, 'Email Marketing (Mailchimp)', 1), (6, 'CRM (HubSpot)', 2), (6, 'Social Media', 3), (6, 'Payment Gateway', 4), (6, 'Live Chat', 5);

-- Options for Question 7: appType (Web App)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(7, 'SaaS Platform', 0), (7, 'Dashboard/Admin Panel', 1), (7, 'Social Platform', 2), (7, 'Marketplace', 3), (7, 'Booking System', 4), (7, 'CRM/ERP', 5), (7, 'Portfolio/CMS', 6);

-- Options for Question 8: userRoles
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(8, 'Admin', 0), (8, 'Regular User', 1), (8, 'Manager', 2), (8, 'Customer', 3), (8, 'Vendor/Seller', 4), (8, 'Guest', 5);

-- Options for Question 9: coreFeatures (Web App)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(9, 'User Authentication', 0), (9, 'Real-time Updates', 1), (9, 'File Upload', 2), (9, 'Search & Filter', 3), (9, 'Notifications', 4), (9, 'API Integration', 5), (9, 'Reporting/Analytics', 6), (9, 'Multi-tenant', 7);

-- Options for Question 10: frontend
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(10, 'React', 0), (10, 'Vue.js', 1), (10, 'Angular', 2), (10, 'Next.js', 3), (10, 'Svelte', 4), (10, 'Plain JavaScript', 5);

-- Options for Question 11: backend
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(11, 'Node.js/Express', 0), (11, 'Python/Django', 1), (11, 'Python/FastAPI', 2), (11, 'PHP/Laravel', 3), (11, 'Ruby on Rails', 4), (11, 'Java/Spring', 5);

-- Options for Question 12: database
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(12, 'PostgreSQL', 0), (12, 'MySQL', 1), (12, 'MongoDB', 2), (12, 'SQLite', 3), (12, 'Firebase', 4), (12, 'Supabase', 5);

-- Options for Question 13: storeType
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(13, 'Single Vendor', 0), (13, 'Multi-vendor Marketplace', 1), (13, 'Subscription Commerce', 2), (13, 'Digital Products', 3), (13, 'Physical Products', 4), (13, 'Mixed Products', 5);

-- Options for Question 14: productCount
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(14, 'Under 100', 0), (14, '100-1,000', 1), (14, '1,000-10,000', 2), (14, '10,000+', 3);

-- Options for Question 15: ecommerceFeatures
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(15, 'Shopping Cart', 0), (15, 'Wishlist', 1), (15, 'Product Reviews', 2), (15, 'Inventory Management', 3), (15, 'Order Tracking', 4), (15, 'Coupons/Discounts', 5), (15, 'Multi-currency', 6), (15, 'SEO Tools', 7);

-- Options for Question 16: paymentMethods
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(16, 'Credit/Debit Cards', 0), (16, 'PayPal', 1), (16, 'Stripe', 2), (16, 'Apple Pay', 3), (16, 'Google Pay', 4), (16, 'Bank Transfer', 5), (16, 'Cryptocurrency', 6);

-- Options for Question 17: platform
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(17, 'Custom Development', 0), (17, 'WooCommerce', 1), (17, 'Shopify', 2), (17, 'Magento', 3), (17, 'Next.js Commerce', 4), (17, 'Medusa.js', 5);

-- Options for Question 18: shippingZones
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(18, 'Local Only', 0), (18, 'National', 1), (18, 'International', 2), (18, 'Digital (No Shipping)', 3);

-- Options for Question 19: appCategory
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(19, 'Business/Productivity', 0), (19, 'Social Networking', 1), (19, 'E-commerce/Shopping', 2), (19, 'Health/Fitness', 3), (19, 'Education', 4), (19, 'Entertainment', 5), (19, 'Finance', 6), (19, 'Food & Drink', 7);

-- Options for Question 20: platforms
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(20, 'iOS', 0), (20, 'Android', 1), (20, 'Both', 2);

-- Options for Question 21: appType (Mobile App)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(21, 'Native App', 0), (21, 'Cross-platform (React Native)', 1), (21, 'Cross-platform (Flutter)', 2), (21, 'PWA (Progressive Web App)', 3);

-- Options for Question 22: coreFeatures (Mobile App)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(22, 'User Registration/Login', 0), (22, 'Push Notifications', 1), (22, 'Offline Mode', 2), (22, 'Camera/Photos', 3), (22, 'GPS/Location', 4), (22, 'Social Sharing', 5), (22, 'In-app Purchases', 6), (22, 'Real-time Chat', 7);

-- Options for Question 23: monetization
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(23, 'Free', 0), (23, 'Paid App', 1), (23, 'Freemium', 2), (23, 'Subscription', 3), (23, 'In-app Purchases', 4), (23, 'Ad-supported', 5);

-- Options for Question 24: backendNeeds
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(24, 'User Management', 0), (24, 'Data Storage', 1), (24, 'Push Notifications', 2), (24, 'Analytics', 3), (24, 'Payment Processing', 4), (24, 'File Storage', 5), (24, 'Real-time Features', 6);
