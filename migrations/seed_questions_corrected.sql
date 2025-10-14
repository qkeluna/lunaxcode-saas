-- SEED DATA FOR 'questions' TABLE (CORRECTED SERVICE IDs)

-- Landing Page Questions (service_id = 1)
INSERT INTO questions (service_id, question_key, label, type, is_required, placeholder) VALUES
(1, 'pageType', 'What type of landing page?', 'select', TRUE, NULL),
(1, 'designStyle', 'Preferred design style', 'select', TRUE, NULL),
(1, 'sections', 'Required sections', 'checkbox', TRUE, NULL),
(1, 'ctaGoal', 'Primary call-to-action goal', 'text', TRUE, 'e.g., Sign up for free trial, Download app, Contact sales...'),
(1, 'targetFramework', 'Preferred technology', 'select', TRUE, NULL),
(1, 'integrations', 'Required integrations', 'checkbox', FALSE, NULL);

-- Business Website Questions (service_id = 2)
INSERT INTO questions (service_id, question_key, label, type, is_required, placeholder) VALUES
(2, 'websiteType', 'Website type', 'select', TRUE, NULL),
(2, 'designStyle', 'Preferred design style', 'select', TRUE, NULL),
(2, 'pages', 'Required pages', 'checkbox', TRUE, NULL),
(2, 'features', 'Website features', 'checkbox', TRUE, NULL),
(2, 'targetFramework', 'Preferred technology', 'select', TRUE, NULL),
(2, 'integrations', 'Required integrations', 'checkbox', FALSE, NULL);

-- E-commerce Questions (service_id = 3)
INSERT INTO questions (service_id, question_key, label, type, is_required, placeholder) VALUES
(3, 'storeType', 'Store type', 'select', TRUE, NULL),
(3, 'productCount', 'Expected number of products', 'select', TRUE, NULL),
(3, 'ecommerceFeatures', 'Required features', 'checkbox', TRUE, NULL),
(3, 'paymentMethods', 'Payment methods', 'checkbox', TRUE, NULL),
(3, 'platform', 'Preferred platform', 'select', TRUE, NULL),
(3, 'shippingZones', 'Shipping zones', 'select', TRUE, NULL);

-- Web Application Questions (service_id = 4)
INSERT INTO questions (service_id, question_key, label, type, is_required, placeholder) VALUES
(4, 'appType', 'Application type', 'select', TRUE, NULL),
(4, 'userRoles', 'User roles needed', 'checkbox', TRUE, NULL),
(4, 'coreFeatures', 'Core features', 'checkbox', TRUE, NULL),
(4, 'frontend', 'Frontend technology', 'select', TRUE, NULL),
(4, 'backend', 'Backend preference', 'select', TRUE, NULL),
(4, 'database', 'Database type', 'select', TRUE, NULL);

-- Mobile App Questions (service_id = 5)
INSERT INTO questions (service_id, question_key, label, type, is_required, placeholder) VALUES
(5, 'appCategory', 'App category', 'select', TRUE, NULL),
(5, 'platforms', 'Target platforms', 'checkbox', TRUE, NULL),
(5, 'appType', 'App type', 'select', TRUE, NULL),
(5, 'coreFeatures', 'Core features', 'checkbox', TRUE, NULL),
(5, 'monetization', 'Monetization model', 'select', FALSE, NULL),
(5, 'backendNeeds', 'Backend requirements', 'checkbox', TRUE, NULL);

-- SEED DATA FOR 'question_options' TABLE

-- Options for Question 1: pageType (Landing Page)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(1, 'Product Launch', 0), (1, 'Lead Generation', 1), (1, 'Event Registration', 2), (1, 'App Download', 3), (1, 'Service Promotion', 4), (1, 'Newsletter Signup', 5);

-- Options for Question 2: designStyle (Landing Page)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(2, 'Modern/Minimalist', 0), (2, 'Bold/Colorful', 1), (2, 'Professional/Corporate', 2), (2, 'Creative/Artistic', 3), (2, 'Tech/Startup', 4);

-- Options for Question 3: sections (Landing Page)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(3, 'Hero Section', 0), (3, 'Features/Benefits', 1), (3, 'Testimonials', 2), (3, 'Pricing', 3), (3, 'FAQ', 4), (3, 'Contact Form', 5), (3, 'About Us', 6), (3, 'Gallery/Portfolio', 7);

-- Options for Question 5: targetFramework (Landing Page)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(5, 'HTML/CSS/JavaScript', 0), (5, 'React', 1), (5, 'Vue.js', 2), (5, 'Next.js', 3), (5, 'Tailwind CSS', 4), (5, 'Bootstrap', 5);

-- Options for Question 6: integrations (Landing Page)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(6, 'Google Analytics', 0), (6, 'Email Marketing (Mailchimp)', 1), (6, 'CRM (HubSpot)', 2), (6, 'Social Media', 3), (6, 'Payment Gateway', 4), (6, 'Live Chat', 5);

-- Options for Question 7: websiteType (Business Website)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(7, 'Corporate Website', 0), (7, 'Portfolio', 1), (7, 'Blog/News', 2), (7, 'Service Business', 3), (7, 'Restaurant', 4), (7, 'Real Estate', 5);

-- Options for Question 8: designStyle (Business Website)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(8, 'Modern/Minimalist', 0), (8, 'Bold/Colorful', 1), (8, 'Professional/Corporate', 2), (8, 'Creative/Artistic', 3), (8, 'Tech/Startup', 4);

-- Options for Question 9: pages (Business Website)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(9, 'Home', 0), (9, 'About Us', 1), (9, 'Services', 2), (9, 'Portfolio', 3), (9, 'Blog', 4), (9, 'Contact', 5), (9, 'Team', 6), (9, 'Testimonials', 7);

-- Options for Question 10: features (Business Website)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(10, 'Contact Form', 0), (10, 'Blog System', 1), (10, 'Image Gallery', 2), (10, 'Video Integration', 3), (10, 'Google Maps', 4), (10, 'Newsletter Signup', 5), (10, 'Social Media Integration', 6), (10, 'Live Chat', 7);

-- Options for Question 11: targetFramework (Business Website)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(11, 'HTML/CSS/JavaScript', 0), (11, 'React', 1), (11, 'Vue.js', 2), (11, 'Next.js', 3), (11, 'WordPress', 4), (11, 'Tailwind CSS', 5);

-- Options for Question 12: integrations (Business Website)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(12, 'Google Analytics', 0), (12, 'Email Marketing', 1), (12, 'CRM', 2), (12, 'Social Media', 3), (12, 'Booking System', 4), (12, 'Live Chat', 5);

-- Options for Question 13: storeType (E-commerce)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(13, 'Single Vendor', 0), (13, 'Multi-vendor Marketplace', 1), (13, 'Subscription Commerce', 2), (13, 'Digital Products', 3), (13, 'Physical Products', 4), (13, 'Mixed Products', 5);

-- Options for Question 14: productCount (E-commerce)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(14, 'Under 100', 0), (14, '100-1,000', 1), (14, '1,000-10,000', 2), (14, '10,000+', 3);

-- Options for Question 15: ecommerceFeatures (E-commerce)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(15, 'Shopping Cart', 0), (15, 'Wishlist', 1), (15, 'Product Reviews', 2), (15, 'Inventory Management', 3), (15, 'Order Tracking', 4), (15, 'Coupons/Discounts', 5), (15, 'Multi-currency', 6), (15, 'SEO Tools', 7);

-- Options for Question 16: paymentMethods (E-commerce)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(16, 'Credit/Debit Cards', 0), (16, 'PayPal', 1), (16, 'Stripe', 2), (16, 'Apple Pay', 3), (16, 'Google Pay', 4), (16, 'Bank Transfer', 5), (16, 'Cryptocurrency', 6);

-- Options for Question 17: platform (E-commerce)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(17, 'Custom Development', 0), (17, 'WooCommerce', 1), (17, 'Shopify', 2), (17, 'Magento', 3), (17, 'Next.js Commerce', 4), (17, 'Medusa.js', 5);

-- Options for Question 18: shippingZones (E-commerce)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(18, 'Local Only', 0), (18, 'National', 1), (18, 'International', 2), (18, 'Digital (No Shipping)', 3);

-- Options for Question 19: appType (Web Application)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(19, 'SaaS Platform', 0), (19, 'Dashboard/Admin Panel', 1), (19, 'Social Platform', 2), (19, 'Marketplace', 3), (19, 'Booking System', 4), (19, 'CRM/ERP', 5), (19, 'Portfolio/CMS', 6);

-- Options for Question 20: userRoles (Web Application)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(20, 'Admin', 0), (20, 'Regular User', 1), (20, 'Manager', 2), (20, 'Customer', 3), (20, 'Vendor/Seller', 4), (20, 'Guest', 5);

-- Options for Question 21: coreFeatures (Web Application)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(21, 'User Authentication', 0), (21, 'Real-time Updates', 1), (21, 'File Upload', 2), (21, 'Search & Filter', 3), (21, 'Notifications', 4), (21, 'API Integration', 5), (21, 'Reporting/Analytics', 6), (21, 'Multi-tenant', 7);

-- Options for Question 22: frontend (Web Application)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(22, 'React', 0), (22, 'Vue.js', 1), (22, 'Angular', 2), (22, 'Next.js', 3), (22, 'Svelte', 4), (22, 'Plain JavaScript', 5);

-- Options for Question 23: backend (Web Application)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(23, 'Node.js/Express', 0), (23, 'Python/Django', 1), (23, 'Python/FastAPI', 2), (23, 'PHP/Laravel', 3), (23, 'Ruby on Rails', 4), (23, 'Java/Spring', 5);

-- Options for Question 24: database (Web Application)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(24, 'PostgreSQL', 0), (24, 'MySQL', 1), (24, 'MongoDB', 2), (24, 'SQLite', 3), (24, 'Firebase', 4), (24, 'Supabase', 5);

-- Options for Question 25: appCategory (Mobile App)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(25, 'Business/Productivity', 0), (25, 'Social Networking', 1), (25, 'E-commerce/Shopping', 2), (25, 'Health/Fitness', 3), (25, 'Education', 4), (25, 'Entertainment', 5), (25, 'Finance', 6), (25, 'Food & Drink', 7);

-- Options for Question 26: platforms (Mobile App)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(26, 'iOS', 0), (26, 'Android', 1), (26, 'Both', 2);

-- Options for Question 27: appType (Mobile App)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(27, 'Native App', 0), (27, 'Cross-platform (React Native)', 1), (27, 'Cross-platform (Flutter)', 2), (27, 'PWA (Progressive Web App)', 3);

-- Options for Question 28: coreFeatures (Mobile App)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(28, 'User Registration/Login', 0), (28, 'Push Notifications', 1), (28, 'Offline Mode', 2), (28, 'Camera/Photos', 3), (28, 'GPS/Location', 4), (28, 'Social Sharing', 5), (28, 'In-app Purchases', 6), (28, 'Real-time Chat', 7);

-- Options for Question 29: monetization (Mobile App)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(29, 'Free', 0), (29, 'Paid App', 1), (29, 'Freemium', 2), (29, 'Subscription', 3), (29, 'In-app Purchases', 4), (29, 'Ad-supported', 5);

-- Options for Question 30: backendNeeds (Mobile App)
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(30, 'User Management', 0), (30, 'Data Storage', 1), (30, 'Push Notifications', 2), (30, 'Analytics', 3), (30, 'Payment Processing', 4), (30, 'File Storage', 5), (30, 'Real-time Features', 6);
