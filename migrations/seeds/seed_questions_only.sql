-- SEED DATA FOR 'questions' TABLE ONLY

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
