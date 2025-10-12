import { drizzle } from 'drizzle-orm/d1';
import {
  users,
  serviceTypes,
  faqs,
  portfolio,
  processSteps,
  features,
  projects,
  tasks,
} from '../src/lib/db/schema';

interface Env {
  DB: D1Database;
}

export async function seed(env: Env) {
  const db = drizzle(env.DB);

  console.log('🌱 Starting database seed...');

  try {
    // 1. Create Admin User
    console.log('👤 Creating admin user...');
    const [adminUser] = await db
      .insert(users)
      .values({
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@lunaxcode.com',
        role: 'admin',
        emailVerified: new Date(),
        image: null,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .onConflictDoNothing();

    console.log('✅ Admin user created:', adminUser?.email);

    // 2. Create Sample Clients
    console.log('👥 Creating sample clients...');
    const [client1] = await db
      .insert(users)
      .values({
        id: 'client-001',
        name: 'Juan dela Cruz',
        email: 'juan@example.com',
        role: 'client',
        emailVerified: new Date(),
        image: null,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .onConflictDoNothing();

    const [client2] = await db
      .insert(users)
      .values({
        id: 'client-002',
        name: 'Maria Santos',
        email: 'maria@example.com',
        role: 'client',
        emailVerified: new Date(),
        image: null,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .onConflictDoNothing();

    console.log('✅ Sample clients created');

    // 3. Seed Service Types (Pricing Plans)
    console.log('💰 Seeding service types...');
    const serviceTypesData = [
      {
        name: 'Landing Page',
        description: 'Professional single-page website perfect for showcasing your business, product, or service',
        basePrice: 15000,
        features: JSON.stringify([
          'Responsive design (mobile, tablet, desktop)',
          'Up to 5 sections',
          'Contact form integration',
          'Basic SEO optimization',
          'Social media links',
          '1 round of revisions',
          '30 days support',
        ]),
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: 'Business Website',
        description: 'Multi-page website ideal for established businesses with multiple services or products',
        basePrice: 35000,
        features: JSON.stringify([
          'Up to 10 pages',
          'Responsive design',
          'Content Management System (CMS)',
          'Blog functionality',
          'Advanced SEO',
          'Google Analytics integration',
          'Contact forms',
          '2 rounds of revisions',
          '60 days support',
        ]),
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: 'E-Commerce Website',
        description: 'Full-featured online store with payment integration for selling products online',
        basePrice: 75000,
        features: JSON.stringify([
          'Product catalog with categories',
          'Shopping cart functionality',
          'Payment gateway integration (PayMongo, GCash, PayMaya)',
          'Inventory management',
          'Order tracking system',
          'Customer accounts',
          'Admin dashboard',
          'Mobile responsive',
          'SSL certificate',
          '3 rounds of revisions',
          '90 days support',
        ]),
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: 'Web Application',
        description: 'Custom web application tailored to your specific business needs and workflows',
        basePrice: 150000,
        features: JSON.stringify([
          'Custom functionality development',
          'User authentication & roles',
          'Database design & integration',
          'API development',
          'Admin dashboard',
          'Real-time features',
          'Third-party integrations',
          'Scalable architecture',
          'Security best practices',
          'Unlimited revisions',
          '180 days support',
        ]),
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: 'Mobile App Development',
        description: 'Cross-platform mobile application for iOS and Android',
        basePrice: 200000,
        features: JSON.stringify([
          'iOS & Android support',
          'Native performance',
          'Push notifications',
          'Offline functionality',
          'In-app purchases (optional)',
          'Backend API integration',
          'App store deployment',
          'User analytics',
          'Unlimited revisions',
          '180 days support',
        ]),
        isActive: true,
        createdAt: new Date(),
      },
    ];

    for (const service of serviceTypesData) {
      await db.insert(serviceTypes).values(service).onConflictDoNothing();
    }

    console.log('✅ Service types seeded');

    // 4. Seed FAQs
    console.log('❓ Seeding FAQs...');
    const faqsData = [
      {
        question: 'How long does it take to build a website?',
        answer: 'Timeline varies by project complexity. A landing page typically takes 1-2 weeks, business websites 3-4 weeks, e-commerce sites 6-8 weeks, and custom web applications 8-16 weeks. We provide a detailed timeline after discussing your requirements.',
        category: 'Timeline',
        order: 1,
        isActive: true,
        createdAt: new Date(),
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept payments via credit/debit cards, GCash, PayMaya, and bank transfers. A 50% deposit is required to start the project, with the remaining 50% due upon completion.',
        category: 'Payments',
        order: 2,
        isActive: true,
        createdAt: new Date(),
      },
      {
        question: 'Do you provide ongoing support after launch?',
        answer: 'Yes! All projects include free support for 30-180 days (depending on package). After that, we offer maintenance packages starting at ₱2,500/month for updates, security patches, and technical support.',
        category: 'Support',
        order: 3,
        isActive: true,
        createdAt: new Date(),
      },
      {
        question: 'Will my website be mobile-friendly?',
        answer: 'Absolutely! All our websites are fully responsive and optimized for mobile, tablet, and desktop devices. Mobile-first design is our standard practice.',
        category: 'Technical',
        order: 4,
        isActive: true,
        createdAt: new Date(),
      },
      {
        question: 'Can I update the website content myself?',
        answer: 'Yes! For Business Website packages and above, we include a Content Management System (CMS) that allows you to easily update text, images, and other content without coding knowledge. We also provide training.',
        category: 'Technical',
        order: 5,
        isActive: true,
        createdAt: new Date(),
      },
      {
        question: 'Do you help with domain and hosting?',
        answer: 'Yes, we can assist with domain registration and recommend reliable hosting providers. We also offer managed hosting services if you prefer a hands-off approach.',
        category: 'Technical',
        order: 6,
        isActive: true,
        createdAt: new Date(),
      },
      {
        question: 'What if I need changes after the website is live?',
        answer: 'Minor updates are included in your support period. For major changes or new features, we provide a quote based on the scope of work. Our rates are competitive and transparent.',
        category: 'Support',
        order: 7,
        isActive: true,
        createdAt: new Date(),
      },
      {
        question: 'Do you offer SEO services?',
        answer: 'Yes! Basic SEO optimization is included in all packages. We also offer advanced SEO services including keyword research, content strategy, and ongoing optimization as an add-on.',
        category: 'Services',
        order: 8,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    for (const faq of faqsData) {
      await db.insert(faqs).values(faq).onConflictDoNothing();
    }

    console.log('✅ FAQs seeded');

    // 5. Seed Portfolio
    console.log('💼 Seeding portfolio...');
    const portfolioData = [
      {
        title: 'FoodHub - Restaurant Delivery Platform',
        description: 'A comprehensive food delivery platform connecting customers with local restaurants. Features real-time order tracking, multiple payment options, and restaurant management dashboard.',
        client: 'FoodHub PH',
        category: 'web-app',
        imageUrl: null,
        liveUrl: 'https://foodhub-demo.com',
        technologies: JSON.stringify(['Next.js', 'Node.js', 'PostgreSQL', 'PayMongo', 'Google Maps API']),
        results: JSON.stringify(['2000+ daily orders', '50+ partner restaurants', '95% customer satisfaction']),
        testimonial: 'Lunaxcode transformed our idea into reality. The platform is fast, reliable, and our customers love it!',
        order: 1,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'SchoolConnect - School Management System',
        description: 'Complete school management system with student enrollment, grade management, attendance tracking, and parent portal. Streamlines administrative tasks for educational institutions.',
        client: 'St. Mary\'s Academy',
        category: 'saas',
        imageUrl: null,
        liveUrl: null,
        technologies: JSON.stringify(['React', 'Express', 'MongoDB', 'Socket.io']),
        results: JSON.stringify(['500+ students managed', '80% reduction in admin time', '100% paperless enrollment']),
        testimonial: 'This system has revolutionized how we manage our school. Highly recommended!',
        order: 2,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'StyleShop - Fashion E-Commerce',
        description: 'Modern e-commerce platform for fashion retail with advanced filtering, wishlist functionality, and seamless checkout experience integrated with Philippine payment gateways.',
        client: 'StyleShop Manila',
        category: 'e-commerce',
        imageUrl: null,
        liveUrl: 'https://styleshop-demo.com',
        technologies: JSON.stringify(['Next.js', 'Shopify', 'Tailwind CSS', 'PayMongo']),
        results: JSON.stringify(['300% increase in online sales', '1000+ products', '5000+ monthly visitors']),
        testimonial: 'Our online sales skyrocketed after launching with Lunaxcode. Worth every peso!',
        order: 3,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    for (const item of portfolioData) {
      await db.insert(portfolio).values(item).onConflictDoNothing();
    }

    console.log('✅ Portfolio seeded');

    // 6. Seed Process Steps
    console.log('🔄 Seeding process steps...');
    const processStepsData = [
      {
        title: 'Discovery & Planning',
        description: 'We start by understanding your business goals, target audience, and project requirements. We create a detailed project plan with timeline and milestones.',
        icon: '🔍',
        order: 1,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'Design & Prototype',
        description: 'Our designers create wireframes and high-fidelity mockups based on your brand. You review and provide feedback before we move to development.',
        icon: '🎨',
        order: 2,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'Development',
        description: 'Our developers build your website using modern technologies and best practices. We provide regular updates and demos throughout the process.',
        icon: '💻',
        order: 3,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'Testing & QA',
        description: 'Rigorous testing across devices and browsers to ensure everything works perfectly. We fix any bugs and optimize for performance.',
        icon: '🧪',
        order: 4,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'Launch & Support',
        description: 'We deploy your website and provide training on how to use it. Ongoing support ensures your site continues to perform well.',
        icon: '🚀',
        order: 5,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    for (const step of processStepsData) {
      await db.insert(processSteps).values(step).onConflictDoNothing();
    }

    console.log('✅ Process steps seeded');

    // 7. Seed Features
    console.log('✨ Seeding features...');
    const featuresData = [
      {
        title: 'AI-Powered PRD Generation',
        description: 'Automatically generate comprehensive Project Requirements Documents using Google Gemini AI based on your project description.',
        icon: '🤖',
        category: 'core',
        order: 1,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'Automated Task Breakdown',
        description: 'AI analyzes your PRD and creates a detailed task list with estimates, dependencies, and priorities.',
        icon: '📋',
        category: 'core',
        order: 2,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'Philippine Payment Integration',
        description: 'Accept payments via GCash, PayMaya, and credit cards through PayMongo - the leading Philippine payment gateway.',
        icon: '💳',
        category: 'business',
        order: 3,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'Real-time Project Dashboard',
        description: 'Track project progress, view tasks, communicate with the team, and monitor payments all in one place.',
        icon: '📊',
        category: 'core',
        order: 4,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'Modern Tech Stack',
        description: 'Built with Next.js 15, TypeScript, and deployed on Cloudflare Edge for blazing-fast performance worldwide.',
        icon: '⚡',
        category: 'technical',
        order: 5,
        isActive: true,
        createdAt: new Date(),
      },
      {
        title: 'Secure Authentication',
        description: 'Google OAuth integration with NextAuth.js ensures secure and convenient login for all users.',
        icon: '🔒',
        category: 'technical',
        order: 6,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    for (const feature of featuresData) {
      await db.insert(features).values(feature).onConflictDoNothing();
    }

    console.log('✅ Features seeded');

    // 8. Seed Sample Projects (if clients exist)
    if (client1 && client2) {
      console.log('📁 Seeding sample projects...');

      const [service1] = await db.select().from(serviceTypes).limit(1);

      if (service1) {
        const [project1] = await db
          .insert(projects)
          .values({
            userId: client1.id,
            serviceTypeId: service1.id,
            name: 'Company Landing Page',
            service: 'Landing Page',
            description: 'Modern landing page for our consulting business',
            prd: 'Sample PRD content - A professional landing page showcasing our consulting services...',
            clientName: client1.name,
            clientEmail: client1.email,
            clientPhone: '+63 912 345 6789',
            timeline: 14,
            budget: 20000,
            price: 18000,
            paymentStatus: 'partially-paid',
            depositAmount: 9000,
            status: 'in-progress',
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
          .onConflictDoNothing();

        if (project1) {
          // Add sample tasks for project1
          const tasksData = [
            {
              projectId: project1.id,
              title: 'Design homepage layout',
              description: 'Create wireframes and mockups for the homepage',
              section: 'Design',
              priority: 'high',
              status: 'completed',
              estimatedHours: 8,
              dependencies: null,
              order: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              projectId: project1.id,
              title: 'Develop hero section',
              description: 'Implement hero section with animations',
              section: 'Development',
              priority: 'high',
              status: 'in-progress',
              estimatedHours: 6,
              dependencies: null,
              order: 2,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              projectId: project1.id,
              title: 'Setup contact form',
              description: 'Integrate contact form with email notifications',
              section: 'Development',
              priority: 'medium',
              status: 'pending',
              estimatedHours: 4,
              dependencies: null,
              order: 3,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];

          for (const task of tasksData) {
            await db.insert(tasks).values(task).onConflictDoNothing();
          }
        }

        await db
          .insert(projects)
          .values({
            userId: client2.id,
            serviceTypeId: null,
            name: 'E-Commerce Store',
            service: 'E-Commerce Website',
            description: 'Full-featured online store for selling clothing',
            prd: 'Sample PRD content - Complete e-commerce platform with payment integration...',
            clientName: client2.name,
            clientEmail: client2.email,
            clientPhone: '+63 917 654 3210',
            timeline: 45,
            budget: 80000,
            price: 75000,
            paymentStatus: 'pending',
            depositAmount: 0,
            status: 'pending',
            startDate: null,
            endDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoNothing();

        console.log('✅ Sample projects seeded');
      }
    }

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📝 Summary:');
    console.log('   - Admin user: admin@lunaxcode.com');
    console.log('   - 5 service types (pricing plans)');
    console.log('   - 8 FAQs');
    console.log('   - 3 portfolio items');
    console.log('   - 5 process steps');
    console.log('   - 6 features');
    console.log('   - 2 sample clients');
    console.log('   - 2 sample projects with tasks');
    console.log('');
    console.log('🔐 Login with Google OAuth and update your email to admin@lunaxcode.com');
    console.log('   or manually update role to "admin" in the users table');
    console.log('');

    return { success: true };
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// For local development
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('This script should be run via wrangler');
  console.log('Usage: npx wrangler d1 execute lunaxcode-dev --local --file=./scripts/seed.sql');
  console.log('Or use the npm script: npm run db:seed');
}
