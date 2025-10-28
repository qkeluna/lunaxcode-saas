-- Lunaxcode SaaS Database Seed Script
-- Run with: npx wrangler d1 execute lunaxcode-dev --local --file=./scripts/seed.sql
-- Or: npx wrangler d1 execute lunaxcode-prod --remote --file=./scripts/seed.sql

-- 1. Create Admin User
INSERT OR IGNORE INTO users (id, name, email, role, email_verified, created_at, updated_at)
VALUES (
  'admin-001',
  'Admin User',
  'admin@lunaxcode.com',
  'admin',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);

-- 2. Create Sample Clients
INSERT OR IGNORE INTO users (id, name, email, role, email_verified, created_at, updated_at)
VALUES
  (
    'client-001',
    'Juan dela Cruz',
    'juan@example.com',
    'client',
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
  ),
  (
    'client-002',
    'Maria Santos',
    'maria@example.com',
    'client',
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
  );

-- 3. Seed Service Types (Pricing Plans)
INSERT OR IGNORE INTO service_types (name, description, base_price, features, is_active, created_at)
VALUES
  (
    'Landing Page',
    'Professional single-page website perfect for showcasing your business, product, or service',
    15000,
    '["Responsive design (mobile, tablet, desktop)","Up to 5 sections","Contact form integration","Basic SEO optimization","Social media links","1 round of revisions","30 days support"]',
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Business Website',
    'Multi-page website ideal for established businesses with multiple services or products',
    35000,
    '["Up to 10 pages","Responsive design","Content Management System (CMS)","Blog functionality","Advanced SEO","Google Analytics integration","Contact forms","2 rounds of revisions","60 days support"]',
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'E-Commerce Website',
    'Full-featured online store with payment integration for selling products online',
    75000,
    '["Product catalog with categories","Shopping cart functionality","Payment gateway integration (PayMongo, GCash, PayMaya)","Inventory management","Order tracking system","Customer accounts","Admin dashboard","Mobile responsive","SSL certificate","3 rounds of revisions","90 days support"]',
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Web Application',
    'Custom web application tailored to your specific business needs and workflows',
    150000,
    '["Custom functionality development","User authentication & roles","Database design & integration","API development","Admin dashboard","Real-time features","Third-party integrations","Scalable architecture","Security best practices","Unlimited revisions","180 days support"]',
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Mobile App Development',
    'Cross-platform mobile application for iOS and Android',
    200000,
    '["iOS & Android support","Native performance","Push notifications","Offline functionality","In-app purchases (optional)","Backend API integration","App store deployment","User analytics","Unlimited revisions","180 days support"]',
    1,
    strftime('%s', 'now') * 1000
  );

-- 4. Seed FAQs
INSERT OR IGNORE INTO faqs (question, answer, category, "order", is_active, created_at)
VALUES
  (
    'How long does it take to build a website?',
    'Timeline varies by project complexity. A landing page typically takes 1-2 weeks, business websites 3-4 weeks, e-commerce sites 6-8 weeks, and custom web applications 8-16 weeks. We provide a detailed timeline after discussing your requirements.',
    'Timeline',
    1,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'What payment methods do you accept?',
    'We accept payments via credit/debit cards, GCash, PayMaya, and bank transfers. A 50% deposit is required to start the project, with the remaining 50% due upon completion.',
    'Payments',
    2,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Do you provide ongoing support after launch?',
    'Yes! All projects include free support for 30-180 days (depending on package). After that, we offer maintenance packages starting at ₱2,500/month for updates, security patches, and technical support.',
    'Support',
    3,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Will my website be mobile-friendly?',
    'Absolutely! All our websites are fully responsive and optimized for mobile, tablet, and desktop devices. Mobile-first design is our standard practice.',
    'Technical',
    4,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Can I update the website content myself?',
    'Yes! For Business Website packages and above, we include a Content Management System (CMS) that allows you to easily update text, images, and other content without coding knowledge. We also provide training.',
    'Technical',
    5,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Do you help with domain and hosting?',
    'Yes, we can assist with domain registration and recommend reliable hosting providers. We also offer managed hosting services if you prefer a hands-off approach.',
    'Technical',
    6,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'What if I need changes after the website is live?',
    'Minor updates are included in your support period. For major changes or new features, we provide a quote based on the scope of work. Our rates are competitive and transparent.',
    'Support',
    7,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Do you offer SEO services?',
    'Yes! Basic SEO optimization is included in all packages. We also offer advanced SEO services including keyword research, content strategy, and ongoing optimization as an add-on.',
    'Services',
    8,
    1,
    strftime('%s', 'now') * 1000
  );

-- 5. Seed Portfolio
INSERT OR IGNORE INTO portfolio (title, description, client, category, live_url, technologies, results, testimonial, "order", is_active, created_at)
VALUES
  (
    'FoodHub - Restaurant Delivery Platform',
    'A comprehensive food delivery platform connecting customers with local restaurants. Features real-time order tracking, multiple payment options, and restaurant management dashboard.',
    'FoodHub PH',
    'web-app',
    'https://foodhub-demo.com',
    '["Next.js","Node.js","PostgreSQL","PayMongo","Google Maps API"]',
    '["2000+ daily orders","50+ partner restaurants","95% customer satisfaction"]',
    'Lunaxcode transformed our idea into reality. The platform is fast, reliable, and our customers love it!',
    1,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'SchoolConnect - School Management System',
    'Complete school management system with student enrollment, grade management, attendance tracking, and parent portal. Streamlines administrative tasks for educational institutions.',
    'St. Mary''s Academy',
    'saas',
    NULL,
    '["React","Express","MongoDB","Socket.io"]',
    '["500+ students managed","80% reduction in admin time","100% paperless enrollment"]',
    'This system has revolutionized how we manage our school. Highly recommended!',
    2,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'StyleShop - Fashion E-Commerce',
    'Modern e-commerce platform for fashion retail with advanced filtering, wishlist functionality, and seamless checkout experience integrated with Philippine payment gateways.',
    'StyleShop Manila',
    'e-commerce',
    'https://styleshop-demo.com',
    '["Next.js","Shopify","Tailwind CSS","PayMongo"]',
    '["300% increase in online sales","1000+ products","5000+ monthly visitors"]',
    'Our online sales skyrocketed after launching with Lunaxcode. Worth every peso!',
    3,
    1,
    strftime('%s', 'now') * 1000
  );

-- 6. Seed Process Steps
INSERT OR IGNORE INTO process_steps (title, description, icon, "order", is_active, created_at)
VALUES
  (
    'Discovery & Planning',
    'We start by understanding your business goals, target audience, and project requirements. We create a detailed project plan with timeline and milestones.',
    '🔍',
    1,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Design & Prototype',
    'Our designers create wireframes and high-fidelity mockups based on your brand. You review and provide feedback before we move to development.',
    '🎨',
    2,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Development',
    'Our developers build your website using modern technologies and best practices. We provide regular updates and demos throughout the process.',
    '💻',
    3,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Testing & QA',
    'Rigorous testing across devices and browsers to ensure everything works perfectly. We fix any bugs and optimize for performance.',
    '🧪',
    4,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Launch & Support',
    'We deploy your website and provide training on how to use it. Ongoing support ensures your site continues to perform well.',
    '🚀',
    5,
    1,
    strftime('%s', 'now') * 1000
  );

-- 7. Seed Features
INSERT OR IGNORE INTO features (title, description, icon, category, "order", is_active, created_at)
VALUES
  (
    'Launch in Weeks, Not Months',
    'AI-powered planning means your website goes from idea to launch in just 2-4 weeks. No lengthy delays or endless meetings.',
    'Clock',
    'core',
    1,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Crystal-Clear Project Timeline',
    'See exactly what we''re building, when it''ll be done, and how much it costs. No surprises, no hidden fees—just complete transparency.',
    'FileText',
    'core',
    2,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Flexible Payment Options',
    'Pay with GCash, Maya, or credit card. Choose milestone payments or installments that fit your budget.',
    'CreditCard',
    'business',
    3,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    '24/7 Project Dashboard',
    'Watch your website come to life in real-time. Check progress, view updates, and message your team anytime, anywhere.',
    'BarChart3',
    'core',
    4,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Blazing-Fast Websites',
    'Your website loads in under 2 seconds on any device. Fast sites mean happy customers and better Google rankings.',
    'Zap',
    'technical',
    5,
    1,
    strftime('%s', 'now') * 1000
  ),
  (
    'Bank-Level Security',
    'Your data and your customers'' information are protected with enterprise-grade security. Sleep easy knowing everything is safe.',
    'Shield',
    'technical',
    6,
    1,
    strftime('%s', 'now') * 1000
  );

-- 8. Seed Sample Projects
INSERT OR IGNORE INTO projects (
  user_id, service_type_id, name, service, description, prd,
  client_name, client_email, client_phone, timeline, budget, price,
  payment_status, deposit_amount, status, start_date, end_date, created_at, updated_at
)
VALUES
  (
    'client-001',
    1,
    'Company Landing Page',
    'Landing Page',
    'Modern landing page for our consulting business',
    'Sample PRD content - A professional landing page showcasing our consulting services with hero section, services overview, testimonials, and contact form. Clean, modern design with smooth animations.',
    'Juan dela Cruz',
    'juan@example.com',
    '+63 912 345 6789',
    14,
    20000,
    18000,
    'partially-paid',
    9000,
    'in-progress',
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now', '+14 days') * 1000,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
  ),
  (
    'client-002',
    3,
    'E-Commerce Store',
    'E-Commerce Website',
    'Full-featured online store for selling clothing',
    'Sample PRD content - Complete e-commerce platform with product catalog, shopping cart, checkout with PayMongo integration, customer accounts, order history, and admin dashboard for inventory management.',
    'Maria Santos',
    'maria@example.com',
    '+63 917 654 3210',
    45,
    80000,
    75000,
    'pending',
    0,
    'pending',
    NULL,
    NULL,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
  );

-- 9. Seed Sample Tasks (for the first project)
INSERT OR IGNORE INTO tasks (
  project_id, title, description, section, priority, status,
  estimated_hours, dependencies, "order", created_at, updated_at
)
SELECT
  p.id,
  'Design homepage layout',
  'Create wireframes and mockups for the homepage',
  'Design',
  'high',
  'completed',
  8,
  NULL,
  1,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
FROM projects p WHERE p.name = 'Company Landing Page';

INSERT OR IGNORE INTO tasks (
  project_id, title, description, section, priority, status,
  estimated_hours, dependencies, "order", created_at, updated_at
)
SELECT
  p.id,
  'Develop hero section',
  'Implement hero section with animations',
  'Development',
  'high',
  'in-progress',
  6,
  NULL,
  2,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
FROM projects p WHERE p.name = 'Company Landing Page';

INSERT OR IGNORE INTO tasks (
  project_id, title, description, section, priority, status,
  estimated_hours, dependencies, "order", created_at, updated_at
)
SELECT
  p.id,
  'Setup contact form',
  'Integrate contact form with email notifications',
  'Development',
  'medium',
  'pending',
  4,
  NULL,
  3,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
FROM projects p WHERE p.name = 'Company Landing Page';

INSERT OR IGNORE INTO tasks (
  project_id, title, description, section, priority, status,
  estimated_hours, dependencies, "order", created_at, updated_at
)
SELECT
  p.id,
  'Add services section',
  'Create services showcase with icons and descriptions',
  'Development',
  'medium',
  'pending',
  5,
  NULL,
  4,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
FROM projects p WHERE p.name = 'Company Landing Page';

INSERT OR IGNORE INTO tasks (
  project_id, title, description, section, priority, status,
  estimated_hours, dependencies, "order", created_at, updated_at
)
SELECT
  p.id,
  'Implement responsive design',
  'Ensure website works perfectly on mobile and tablet',
  'Development',
  'high',
  'pending',
  6,
  NULL,
  5,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
FROM projects p WHERE p.name = 'Company Landing Page';

-- Print success message
SELECT '🎉 Database seeding completed successfully!' as message;
SELECT '📝 Summary:' as message;
SELECT '   - Admin user: admin@lunaxcode.com' as message;
SELECT '   - 5 service types (pricing plans)' as message;
SELECT '   - 8 FAQs' as message;
SELECT '   - 3 portfolio items' as message;
SELECT '   - 5 process steps' as message;
SELECT '   - 6 features' as message;
SELECT '   - 2 sample clients' as message;
SELECT '   - 2 sample projects with tasks' as message;
