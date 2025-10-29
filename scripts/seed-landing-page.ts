import { drizzle } from 'drizzle-orm/d1';
import {
  serviceTypes,
  questions,
  questionOptions,
  addOns,
} from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

interface Env {
  DB: D1Database;
}

/**
 * Seed script for Landing Page service type
 * - Updates Landing Page service details
 * - Creates questionnaire for Landing Page (corrected structure)
 * - Creates add-ons with proper categorization
 */
export async function seedLandingPage(env: Env) {
  const db = drizzle(env.DB);

  console.log('🚀 Seeding Landing Page service, questions, and add-ons...\n');

  try {
    // ============================================================
    // 1. UPDATE LANDING PAGE SERVICE WITH ENHANCED DETAILS
    // ============================================================
    console.log('📝 Updating Landing Page service details...');

    const enhancedLandingPageFeatures = [
      'Responsive design (mobile, tablet, desktop)',
      'Up to 8 customizable sections',
      'Contact form with email notifications',
      'SEO optimization (meta tags, sitemap)',
      'Social media links integration',
      'Fast loading speed (<2 seconds)',
      'SSL certificate included',
      '2 rounds of revisions',
      '30 days technical support',
      'Free Google Analytics setup',
    ];

    await db
      .update(serviceTypes)
      .set({
        description:
          'Professional single-page website optimized for conversions. Perfect for product launches, lead generation, events, and service promotion.',
        features: JSON.stringify(enhancedLandingPageFeatures),
        timeline: '1-2 weeks',
        popular: true,
        updatedAt: new Date(),
      })
      .where(eq(serviceTypes.name, 'Landing Page'));

    console.log('✅ Landing Page service updated\n');

    // ============================================================
    // 2. CREATE LANDING PAGE QUESTIONNAIRE (CORRECTED STRUCTURE)
    // ============================================================
    console.log('❓ Creating Landing Page questionnaire...');

    // Get Landing Page service ID
    const [landingPageService] = await db
      .select()
      .from(serviceTypes)
      .where(eq(serviceTypes.name, 'Landing Page'))
      .limit(1);

    if (!landingPageService) {
      console.error('❌ Landing Page service not found!');
      return { success: false };
    }

    const serviceId = landingPageService.id;

    // Question 1: Landing Page Type
    const [q1] = await db
      .insert(questions)
      .values({
        serviceId,
        questionKey: 'landing_page_type',
        questionText: 'What type of landing page do you need?',
        questionType: 'select',
        required: true,
        placeholder: 'Select landing page type',
        sortOrder: 1,
      })
      .returning()
      .onConflictDoNothing();

    if (q1) {
      const landingPageTypes = [
        'Product Launch',
        'Lead Generation',
        'Event Registration',
        'App Download',
        'Service Promotion',
        'Newsletter Signup',
        'Webinar Registration',
        'E-book/Resource Download',
      ];

      for (let i = 0; i < landingPageTypes.length; i++) {
        await db.insert(questionOptions).values({
          questionId: q1.id,
          optionValue: landingPageTypes[i],
          sortOrder: i,
        });
      }
    }

    // Question 2: Design Style
    const [q2] = await db
      .insert(questions)
      .values({
        serviceId,
        questionKey: 'design_style',
        questionText: 'What design style do you prefer?',
        questionType: 'radio',
        required: true,
        sortOrder: 2,
      })
      .returning()
      .onConflictDoNothing();

    if (q2) {
      const designStyles = [
        'Modern/Minimalist',
        'Bold/Colorful',
        'Professional/Corporate',
        'Creative/Artistic',
        'Tech/Startup',
      ];

      for (let i = 0; i < designStyles.length; i++) {
        await db.insert(questionOptions).values({
          questionId: q2.id,
          optionValue: designStyles[i],
          sortOrder: i,
        });
      }
    }

    // Question 3: Required Sections (contextual based on type)
    const [q3] = await db
      .insert(questions)
      .values({
        serviceId,
        questionKey: 'required_sections',
        questionText: 'Which sections would you like to include?',
        questionType: 'checkbox',
        required: true,
        sortOrder: 3,
      })
      .returning()
      .onConflictDoNothing();

    if (q3) {
      const sections = [
        'Hero Section',
        'Features/Benefits',
        'Testimonials',
        'FAQ',
        'About Us',
        'Pricing/Plans',
        'Contact Form',
        'Gallery/Portfolio',
        'Trust Indicators (logos, badges)',
        'Video/Demo Section',
      ];

      for (let i = 0; i < sections.length; i++) {
        await db.insert(questionOptions).values({
          questionId: q3.id,
          optionValue: sections[i],
          sortOrder: i,
        });
      }
    }

    // Question 4: Brand Colors (optional)
    await db
      .insert(questions)
      .values({
        serviceId,
        questionKey: 'brand_colors',
        questionText: 'Do you have preferred brand colors? (Optional)',
        questionType: 'text',
        required: false,
        placeholder: 'e.g., #FF5733, Blue, Purple',
        sortOrder: 4,
      })
      .onConflictDoNothing();

    // Question 5: Target Audience
    await db
      .insert(questions)
      .values({
        serviceId,
        questionKey: 'target_audience',
        questionText: 'Who is your target audience?',
        questionType: 'textarea',
        required: true,
        placeholder:
          'e.g., Small business owners aged 25-45, Tech-savvy millennials',
        sortOrder: 5,
      })
      .onConflictDoNothing();

    // Question 6: Call-to-Action Goal
    await db
      .insert(questions)
      .values({
        serviceId,
        questionKey: 'cta_goal',
        questionText: 'What is your main call-to-action goal?',
        questionType: 'text',
        required: true,
        placeholder:
          'e.g., Get Free Quote, Download App, Register for Event',
        sortOrder: 6,
      })
      .onConflictDoNothing();

    // Question 7: Competitor/Inspiration URLs (optional)
    await db
      .insert(questions)
      .values({
        serviceId,
        questionKey: 'inspiration_urls',
        questionText:
          'Any competitor or inspiration websites? (Optional, comma-separated)',
        questionType: 'textarea',
        required: false,
        placeholder: 'https://example.com, https://competitor.com',
        sortOrder: 7,
      })
      .onConflictDoNothing();

    console.log('✅ Landing Page questionnaire created\n');

    // ============================================================
    // 3. CREATE ADD-ONS WITH PROPER CATEGORIZATION
    // ============================================================
    console.log('✨ Creating add-ons...');

    const addOnsData = [
      // ===== ANALYTICS & TRACKING (FREE) =====
      {
        serviceTypeId: null, // Applies to all services
        name: 'Google Analytics',
        description:
          'Track website traffic, user behavior, and conversion rates',
        category: 'analytics',
        price: 0,
        isFree: true,
        sortOrder: 1,
      },
      {
        serviceTypeId: null,
        name: 'Meta Pixel (Facebook Ads)',
        description:
          'Track conversions from Facebook/Instagram ads and create retargeting audiences',
        category: 'analytics',
        price: 0,
        isFree: true,
        sortOrder: 2,
      },
      {
        serviceTypeId: null,
        name: 'Google Tag Manager',
        description: 'Manage all tracking codes and marketing tags in one place',
        category: 'analytics',
        price: 0,
        isFree: true,
        sortOrder: 3,
      },
      {
        serviceTypeId: null,
        name: 'Hotjar (Heatmaps & Recordings)',
        description:
          'See how users interact with your site through heatmaps and session recordings',
        category: 'analytics',
        price: 3000,
        isFree: false,
        sortOrder: 4,
      },

      // ===== MARKETING & LEAD CAPTURE (PAID) =====
      {
        serviceTypeId: null,
        name: 'Mailchimp Integration',
        description:
          'Automatically sync email signups to Mailchimp for email marketing campaigns',
        category: 'marketing',
        price: 3000,
        isFree: false,
        sortOrder: 10,
      },
      {
        serviceTypeId: null,
        name: 'ConvertKit Integration',
        description:
          'Sync subscribers to ConvertKit for creator-focused email marketing',
        category: 'marketing',
        price: 3000,
        isFree: false,
        sortOrder: 11,
      },
      {
        serviceTypeId: null,
        name: 'Brevo (formerly Sendinblue) Integration',
        description:
          'Email marketing and SMS campaigns with advanced automation',
        category: 'marketing',
        price: 3000,
        isFree: false,
        sortOrder: 12,
      },
      {
        serviceTypeId: null,
        name: 'HubSpot CRM Integration',
        description:
          'Sync leads directly to HubSpot for sales and marketing automation',
        category: 'marketing',
        price: 5000,
        isFree: false,
        sortOrder: 13,
      },
      {
        serviceTypeId: null,
        name: 'ActiveCampaign Integration',
        description:
          'Advanced marketing automation with CRM and email marketing combined',
        category: 'marketing',
        price: 5000,
        isFree: false,
        sortOrder: 14,
      },

      // ===== COMMUNICATION (PAID) =====
      {
        serviceTypeId: null,
        name: 'Intercom Live Chat',
        description:
          'Professional live chat widget for real-time customer support',
        category: 'communication',
        price: 4000,
        isFree: false,
        sortOrder: 20,
      },
      {
        serviceTypeId: null,
        name: 'Tawk.to Live Chat',
        description: 'Free live chat with premium features integration',
        category: 'communication',
        price: 2000,
        isFree: false,
        sortOrder: 21,
      },
      {
        serviceTypeId: null,
        name: 'Crisp Chat',
        description:
          'Modern live chat with chatbot and shared inbox capabilities',
        category: 'communication',
        price: 3500,
        isFree: false,
        sortOrder: 22,
      },
      {
        serviceTypeId: null,
        name: 'Calendly Integration',
        description:
          'Automated appointment booking directly from your landing page',
        category: 'communication',
        price: 3000,
        isFree: false,
        sortOrder: 23,
      },
      {
        serviceTypeId: null,
        name: 'WhatsApp Business API',
        description:
          'Direct WhatsApp messaging button with business features',
        category: 'communication',
        price: 4000,
        isFree: false,
        sortOrder: 24,
      },

      // ===== SOCIAL & COMMUNITY (FREE/PAID) =====
      {
        serviceTypeId: null,
        name: 'Social Media Feeds',
        description:
          'Display Instagram, Facebook, or Twitter feeds on your landing page',
        category: 'social',
        price: 2500,
        isFree: false,
        sortOrder: 30,
      },
      {
        serviceTypeId: null,
        name: 'Social Sharing Buttons',
        description: 'Share your content on social media platforms',
        category: 'social',
        price: 0,
        isFree: true,
        sortOrder: 31,
      },
      {
        serviceTypeId: null,
        name: 'Google Reviews Widget',
        description: 'Display Google Business reviews to build trust',
        category: 'social',
        price: 2000,
        isFree: false,
        sortOrder: 32,
      },
      {
        serviceTypeId: null,
        name: 'Trustpilot Reviews Widget',
        description: 'Showcase Trustpilot ratings and reviews',
        category: 'social',
        price: 2000,
        isFree: false,
        sortOrder: 33,
      },

      // ===== PAYMENT & E-COMMERCE (PAID) =====
      {
        serviceTypeId: null,
        name: 'PayMongo Payment Gateway',
        description:
          'Accept credit cards, GCash, PayMaya, and bank transfers (Philippine payment gateway)',
        category: 'payment',
        price: 5000,
        isFree: false,
        sortOrder: 40,
      },
      {
        serviceTypeId: null,
        name: 'Stripe Payment Gateway',
        description: 'International payment processing for cards and wallets',
        category: 'payment',
        price: 5000,
        isFree: false,
        sortOrder: 41,
      },
      {
        serviceTypeId: null,
        name: 'PayPal Integration',
        description: 'Accept PayPal payments worldwide',
        category: 'payment',
        price: 4000,
        isFree: false,
        sortOrder: 42,
      },

      // ===== OTHER SERVICES (PAID) =====
      {
        serviceTypeId: null,
        name: 'SMS Notifications (Semaphore)',
        description: 'Send SMS notifications for form submissions or updates',
        category: 'other',
        price: 3500,
        isFree: false,
        sortOrder: 50,
      },
      {
        serviceTypeId: null,
        name: 'Zoom Webinar Integration',
        description: 'Automatic webinar registration sync with Zoom',
        category: 'other',
        price: 4000,
        isFree: false,
        sortOrder: 51,
      },
      {
        serviceTypeId: null,
        name: 'Typeform Integration',
        description:
          'Beautiful interactive forms with advanced logic and integrations',
        category: 'other',
        price: 3000,
        isFree: false,
        sortOrder: 52,
      },
      {
        serviceTypeId: null,
        name: 'Custom API Integration',
        description:
          'Integrate with any third-party service via custom API development',
        category: 'other',
        price: 10000,
        isFree: false,
        sortOrder: 53,
      },
    ];

    for (const addOn of addOnsData) {
      await db.insert(addOns).values(addOn).onConflictDoNothing();
    }

    console.log(`✅ Created ${addOnsData.length} add-ons\n`);

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 Landing Page Seeding Completed Successfully!');
    console.log('═══════════════════════════════════════════════\n');
    console.log('📝 Summary:');
    console.log('   ✅ Landing Page service updated with enhanced details');
    console.log('   ✅ 7 questionnaire questions created');
    console.log(`   ✅ ${addOnsData.length} add-ons created across 5 categories:`);
    console.log('      - Analytics & Tracking (4 items, 3 FREE)');
    console.log('      - Marketing & Lead Capture (5 items)');
    console.log('      - Communication (5 items)');
    console.log('      - Social & Community (4 items, 1 FREE)');
    console.log('      - Payment & E-commerce (3 items)');
    console.log('      - Other Services (4 items)\n');
    console.log('💰 Pricing Structure:');
    console.log('   Base Price: ₱15,000');
    console.log('   FREE Add-ons: 4 items (Google Analytics, Meta Pixel, GTM, Social Sharing)');
    console.log('   Paid Add-ons: ₱2,000 - ₱10,000 each');
    console.log('');

    return { success: true };
  } catch (error) {
    console.error('❌ Landing Page seed failed:', error);
    throw error;
  }
}

// For local development
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('This script should be run via wrangler');
  console.log('Usage: npx wrangler d1 execute lunaxcode-dev --local --command="$(cat scripts/seed-landing-page.sql)"');
  console.log('Or add to main seed.ts and use: npm run db:seed');
}
