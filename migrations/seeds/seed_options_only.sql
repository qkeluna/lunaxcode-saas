-- SEED DATA FOR 'question_options' TABLE WITH CORRECT QUESTION IDs

-- Landing Page Options --

-- Question 25: pageType
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(25, 'Product Launch', 0), (25, 'Lead Generation', 1), (25, 'Event Registration', 2),
(25, 'App Download', 3), (25, 'Service Promotion', 4), (25, 'Newsletter Signup', 5);

-- Question 26: designStyle
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(26, 'Modern/Minimalist', 0), (26, 'Bold/Colorful', 1), (26, 'Professional/Corporate', 2),
(26, 'Creative/Artistic', 3), (26, 'Tech/Startup', 4);

-- Question 27: sections
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(27, 'Hero Section', 0), (27, 'Features/Benefits', 1), (27, 'Testimonials', 2),
(27, 'Pricing', 3), (27, 'FAQ', 4), (27, 'Contact Form', 5),
(27, 'About Us', 6), (27, 'Gallery/Portfolio', 7);

-- Question 28: ctaGoal - TEXT TYPE, NO OPTIONS

-- Question 29: targetFramework
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(29, 'HTML/CSS/JavaScript', 0), (29, 'React', 1), (29, 'Vue.js', 2),
(29, 'Next.js', 3), (29, 'Tailwind CSS', 4), (29, 'Bootstrap', 5);

-- Question 30: integrations
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(30, 'Google Analytics', 0), (30, 'Email Marketing (Mailchimp)', 1), (30, 'CRM (HubSpot)', 2),
(30, 'Social Media', 3), (30, 'Payment Gateway', 4), (30, 'Live Chat', 5);

-- Business Website Options --

-- Question 31: websiteType
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(31, 'Corporate Website', 0), (31, 'Portfolio', 1), (31, 'Blog/News', 2),
(31, 'Service Business', 3), (31, 'Restaurant', 4), (31, 'Real Estate', 5);

-- Question 32: designStyle
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(32, 'Modern/Minimalist', 0), (32, 'Bold/Colorful', 1), (32, 'Professional/Corporate', 2),
(32, 'Creative/Artistic', 3), (32, 'Tech/Startup', 4);

-- Question 33: pages
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(33, 'Home', 0), (33, 'About Us', 1), (33, 'Services', 2), (33, 'Portfolio', 3),
(33, 'Blog', 4), (33, 'Contact', 5), (33, 'Team', 6), (33, 'Testimonials', 7);

-- Question 34: features
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(34, 'Contact Form', 0), (34, 'Blog System', 1), (34, 'Image Gallery', 2),
(34, 'Video Integration', 3), (34, 'Google Maps', 4), (34, 'Newsletter Signup', 5),
(34, 'Social Media Integration', 6), (34, 'Live Chat', 7);

-- Question 35: targetFramework
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(35, 'HTML/CSS/JavaScript', 0), (35, 'React', 1), (35, 'Vue.js', 2),
(35, 'Next.js', 3), (35, 'WordPress', 4), (35, 'Tailwind CSS', 5);

-- Question 36: integrations
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(36, 'Google Analytics', 0), (36, 'Email Marketing', 1), (36, 'CRM', 2),
(36, 'Social Media', 3), (36, 'Booking System', 4), (36, 'Live Chat', 5);

-- E-commerce Options --

-- Question 37: storeType
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(37, 'Single Vendor', 0), (37, 'Multi-vendor Marketplace', 1), (37, 'Subscription Commerce', 2),
(37, 'Digital Products', 3), (37, 'Physical Products', 4), (37, 'Mixed Products', 5);

-- Question 38: productCount
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(38, 'Under 100', 0), (38, '100-1,000', 1), (38, '1,000-10,000', 2), (38, '10,000+', 3);

-- Question 39: ecommerceFeatures
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(39, 'Shopping Cart', 0), (39, 'Wishlist', 1), (39, 'Product Reviews', 2),
(39, 'Inventory Management', 3), (39, 'Order Tracking', 4), (39, 'Coupons/Discounts', 5),
(39, 'Multi-currency', 6), (39, 'SEO Tools', 7);

-- Question 40: paymentMethods
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(40, 'Credit/Debit Cards', 0), (40, 'PayPal', 1), (40, 'Stripe', 2),
(40, 'Apple Pay', 3), (40, 'Google Pay', 4), (40, 'Bank Transfer', 5), (40, 'Cryptocurrency', 6);

-- Question 41: platform
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(41, 'Custom Development', 0), (41, 'WooCommerce', 1), (41, 'Shopify', 2),
(41, 'Magento', 3), (41, 'Next.js Commerce', 4), (41, 'Medusa.js', 5);

-- Question 42: shippingZones
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(42, 'Local Only', 0), (42, 'National', 1), (42, 'International', 2), (42, 'Digital (No Shipping)', 3);

-- Web Application Options --

-- Question 43: appType
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(43, 'SaaS Platform', 0), (43, 'Dashboard/Admin Panel', 1), (43, 'Social Platform', 2),
(43, 'Marketplace', 3), (43, 'Booking System', 4), (43, 'CRM/ERP', 5), (43, 'Portfolio/CMS', 6);

-- Question 44: userRoles
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(44, 'Admin', 0), (44, 'Regular User', 1), (44, 'Manager', 2),
(44, 'Customer', 3), (44, 'Vendor/Seller', 4), (44, 'Guest', 5);

-- Question 45: coreFeatures
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(45, 'User Authentication', 0), (45, 'Real-time Updates', 1), (45, 'File Upload', 2),
(45, 'Search & Filter', 3), (45, 'Notifications', 4), (45, 'API Integration', 5),
(45, 'Reporting/Analytics', 6), (45, 'Multi-tenant', 7);

-- Question 46: frontend
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(46, 'React', 0), (46, 'Vue.js', 1), (46, 'Angular', 2),
(46, 'Next.js', 3), (46, 'Svelte', 4), (46, 'Plain JavaScript', 5);

-- Question 47: backend
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(47, 'Node.js/Express', 0), (47, 'Python/Django', 1), (47, 'Python/FastAPI', 2),
(47, 'PHP/Laravel', 3), (47, 'Ruby on Rails', 4), (47, 'Java/Spring', 5);

-- Question 48: database
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(48, 'PostgreSQL', 0), (48, 'MySQL', 1), (48, 'MongoDB', 2),
(48, 'SQLite', 3), (48, 'Firebase', 4), (48, 'Supabase', 5);

-- Mobile App Options --

-- Question 49: appCategory
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(49, 'Business/Productivity', 0), (49, 'Social Networking', 1), (49, 'E-commerce/Shopping', 2),
(49, 'Health/Fitness', 3), (49, 'Education', 4), (49, 'Entertainment', 5),
(49, 'Finance', 6), (49, 'Food & Drink', 7);

-- Question 50: platforms
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(50, 'iOS', 0), (50, 'Android', 1), (50, 'Both', 2);

-- Question 51: appType
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(51, 'Native App', 0), (51, 'Cross-platform (React Native)', 1),
(51, 'Cross-platform (Flutter)', 2), (51, 'PWA (Progressive Web App)', 3);

-- Question 52: coreFeatures
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(52, 'User Registration/Login', 0), (52, 'Push Notifications', 1), (52, 'Offline Mode', 2),
(52, 'Camera/Photos', 3), (52, 'GPS/Location', 4), (52, 'Social Sharing', 5),
(52, 'In-app Purchases', 6), (52, 'Real-time Chat', 7);

-- Question 53: monetization
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(53, 'Free', 0), (53, 'Paid App', 1), (53, 'Freemium', 2),
(53, 'Subscription', 3), (53, 'In-app Purchases', 4), (53, 'Ad-supported', 5);

-- Question 54: backendNeeds
INSERT INTO question_options (question_id, option_value, sort_order) VALUES
(54, 'User Management', 0), (54, 'Data Storage', 1), (54, 'Push Notifications', 2),
(54, 'Analytics', 3), (54, 'Payment Processing', 4), (54, 'File Storage', 5), (54, 'Real-time Features', 6);
