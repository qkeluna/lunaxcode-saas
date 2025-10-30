import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { contactFormSchema } from '@/lib/validations/schemas';

// Edge Runtime required for Cloudflare Pages
export const runtime = 'edge';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('Contact API called');

    // Parse and validate request body
    const body = await request.json();
    console.log('Request body received:', {
      hasFullName: !!body.fullName,
      hasCompanyName: !!body.companyName,
      hasEmail: !!body.email,
      hasMessage: !!body.message,
      emailValue: body.email // Show actual email for debugging
    });

    const validatedData = contactFormSchema.parse(body);
    console.log('Data validated successfully');

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { success: false, message: 'Email service not configured' },
        { status: 500 }
      );
    }

    console.log('Resend API key found:', process.env.RESEND_API_KEY.substring(0, 10) + '...');

    // Prepare email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .field {
              margin-bottom: 20px;
            }
            .field-label {
              font-weight: 600;
              color: #374151;
              margin-bottom: 4px;
            }
            .field-value {
              color: #1f2937;
              padding: 10px;
              background: white;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            }
            .message-box {
              background: white;
              padding: 15px;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">New Quote Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Lunaxcode - Project Management Platform</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">Full Name</div>
              <div class="field-value">${validatedData.fullName}</div>
            </div>

            <div class="field">
              <div class="field-label">Company Name</div>
              <div class="field-value">${validatedData.companyName}</div>
            </div>

            <div class="field">
              <div class="field-label">Email Address</div>
              <div class="field-value">
                <a href="mailto:${validatedData.email}" style="color: #667eea; text-decoration: none;">
                  ${validatedData.email}
                </a>
              </div>
            </div>

            ${
              validatedData.contactNumber
                ? `
            <div class="field">
              <div class="field-label">Contact Number</div>
              <div class="field-value">
                <a href="tel:${validatedData.contactNumber}" style="color: #667eea; text-decoration: none;">
                  ${validatedData.contactNumber}
                </a>
              </div>
            </div>
            `
                : ''
            }

            <div class="field">
              <div class="field-label">Message</div>
              <div class="message-box">${validatedData.message}</div>
            </div>

            <div class="footer">
              <p>This is an automated message from Lunaxcode contact form.</p>
              <p>Received at: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version for email clients that don't support HTML
    const emailText = `
New Quote Request - Lunaxcode

Full Name: ${validatedData.fullName}
Company Name: ${validatedData.companyName}
Email: ${validatedData.email}
${validatedData.contactNumber ? `Contact Number: ${validatedData.contactNumber}` : ''}

Message:
${validatedData.message}

---
Received at: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT
    `.trim();

    // Send email using Resend
    // NOTE: In test mode, Resend can only send to your verified email address
    // For production, verify a domain at resend.com/domains
    const recipientEmail = process.env.CONTACT_EMAIL || 'lunaxcode2030@gmail.com';

    console.log('Attempting to send email via Resend...');
    console.log('Recipient:', recipientEmail);
    console.log('Reply-to:', validatedData.email);

    const { data, error } = await resend.emails.send({
      from: 'Lunaxcode Contact Form <onboarding@resend.dev>', // Default Resend sender
      to: [recipientEmail],
      replyTo: validatedData.email,
      subject: `New Quote Request from ${validatedData.fullName} - ${validatedData.companyName}`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error('Resend API error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { success: false, message: 'Failed to send email', error: error.message },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);
    console.log('Email ID:', data?.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Quote request sent successfully',
        emailId: data?.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact request:', error);
    console.error('Error type:', error instanceof z.ZodError ? 'ZodError' : error instanceof Error ? 'Error' : typeof error);

    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: error.errors,
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error message:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
