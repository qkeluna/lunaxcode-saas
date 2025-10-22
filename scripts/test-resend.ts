import { Resend } from 'resend';

// Load environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in environment');
  process.exit(1);
}

console.log('✅ API Key found:', RESEND_API_KEY.substring(0, 10) + '...');

const resend = new Resend(RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('\n🚀 Sending test email...\n');

    const { data, error } = await resend.emails.send({
      from: 'Lunaxcode Test <onboarding@resend.dev>',
      to: ['lunaxcode2030@gmail.com'],
      subject: 'Test Email from Resend',
      html: '<h1>Test Email</h1><p>This is a test email from the Resend API.</p>',
      text: 'Test Email - This is a test email from the Resend API.',
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', data?.id);
    console.log('\n✨ Check your inbox at lunaxcode2030@gmail.com\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

testEmail();
