/**
 * Email Templates
 *
 * HTML email templates for different notification types
 */

import { wrapEmailHTML, formatPeso, formatDatePH } from './service';

export interface ProjectCreatedEmailData {
  clientName: string;
  projectName: string;
  serviceName: string;
  price: number;
  projectUrl: string;
}

export interface PRDGeneratedEmailData {
  clientName: string;
  projectName: string;
  projectUrl: string;
}

export interface PaymentStatusEmailData {
  clientName: string;
  projectName: string;
  paymentType: string;
  amount: number;
  status: 'verified' | 'rejected';
  rejectionReason?: string;
  projectUrl: string;
}

export interface ProjectStatusEmailData {
  clientName: string;
  projectName: string;
  oldStatus: string;
  newStatus: string;
  projectUrl: string;
}

export interface NewMessageEmailData {
  clientName: string;
  projectName: string;
  senderName: string;
  messagePreview: string;
  projectUrl: string;
}

/**
 * Email: Project Successfully Created
 */
export function projectCreatedEmail(data: ProjectCreatedEmailData): string {
  const content = `
    <div class="header">
      <h1>🎉 Project Created Successfully!</h1>
      <p>Welcome to Lunaxcode</p>
    </div>

    <div class="content">
      <div class="greeting">Hello ${data.clientName},</div>

      <div class="message">
        <p>Thank you for choosing Lunaxcode! Your project has been successfully created and submitted for review.</p>

        <p>Our team will review your requirements and create a comprehensive Project Requirements Document (PRD) within <strong>24-48 hours</strong>.</p>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #374151;">Project Details</h3>
        <div class="info-row">
          <span class="info-label">Project Name:</span>
          <span class="info-value">${data.projectName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Service Type:</span>
          <span class="info-value">${data.serviceName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Estimated Price:</span>
          <span class="info-value"><strong>${formatPeso(data.price)}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="badge badge-warning">Under Review</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${data.projectUrl}" class="button">View Project Dashboard</a>
      </div>

      <hr class="divider">

      <div class="message">
        <h3 style="color: #374151;">What Happens Next?</h3>
        <ol style="padding-left: 20px;">
          <li><strong>Team Review</strong> - Our experts analyze your requirements (24-48 hours)</li>
          <li><strong>PRD Creation</strong> - We create a comprehensive requirements document</li>
          <li><strong>Task Planning</strong> - We break down the project into detailed tasks</li>
          <li><strong>Your Review</strong> - You review and approve the project plan</li>
          <li><strong>Payment</strong> - 50% deposit to begin development</li>
          <li><strong>Project Kickoff</strong> - Development begins once deposit is verified</li>
        </ol>
      </div>

      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
        <p style="margin: 0; color: #1e40af;">
          <strong>💡 Pro Tip:</strong> You can track your project status, view updates, and communicate with our team through your project dashboard.
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>Lunaxcode</strong></p>
      <p>AI-Powered Project Management for Filipino Web Agencies</p>
      <p>
        <a href="${data.projectUrl}">View Project</a> |
        <a href="https://app.lunaxcode.site/dashboard">Dashboard</a> |
        <a href="https://lunaxcode.site">Visit Website</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px;">
        If you have any questions, reply to this email or contact us at support@lunaxcode.site
      </p>
    </div>
  `;

  return wrapEmailHTML(content);
}

/**
 * Email: PRD Generated and Ready
 */
export function prdGeneratedEmail(data: PRDGeneratedEmailData): string {
  const content = `
    <div class="header">
      <h1>✨ Your PRD is Ready!</h1>
      <p>Project Requirements Document Generated</p>
    </div>

    <div class="content">
      <div class="greeting">Hello ${data.clientName},</div>

      <div class="message">
        <p>Great news! Our team has completed the analysis of your project requirements and generated a comprehensive Project Requirements Document (PRD).</p>

        <p>The PRD includes:</p>
        <ul>
          <li>Detailed project objectives and scope</li>
          <li>Technical requirements and specifications</li>
          <li>Feature breakdown and user stories</li>
          <li>Timeline estimates and milestones</li>
          <li>Success metrics and deliverables</li>
        </ul>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #374151;">Project: ${data.projectName}</h3>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="badge badge-success">PRD Ready</span>
        </div>
        <div class="info-row">
          <span class="info-label">Next Step:</span>
          <span class="info-value">Review PRD & Submit 50% Deposit</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${data.projectUrl}" class="button">Review Your PRD</a>
      </div>

      <hr class="divider">

      <div class="message">
        <h3 style="color: #374151;">Ready to Get Started?</h3>
        <p>Once you've reviewed the PRD and are ready to proceed:</p>
        <ol style="padding-left: 20px;">
          <li>Review the complete PRD and task breakdown</li>
          <li>Ask any questions or request clarifications</li>
          <li>Submit the 50% deposit payment</li>
          <li>Development begins immediately after payment verification</li>
        </ol>
      </div>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
        <p style="margin: 0; color: #065f46;">
          <strong>✅ Quality Assurance:</strong> All our PRDs are reviewed by senior developers to ensure accuracy and completeness.
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>Lunaxcode</strong></p>
      <p>AI-Powered Project Management for Filipino Web Agencies</p>
      <p>
        <a href="${data.projectUrl}">View PRD</a> |
        <a href="https://app.lunaxcode.site/dashboard">Dashboard</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px;">
        Questions? Reply to this email or message us through your project dashboard.
      </p>
    </div>
  `;

  return wrapEmailHTML(content);
}

/**
 * Email: Payment Status Update
 */
export function paymentStatusEmail(data: PaymentStatusEmailData): string {
  const isVerified = data.status === 'verified';

  const content = `
    <div class="header">
      <h1>${isVerified ? '✅ Payment Verified!' : '❌ Payment Update'}</h1>
      <p>${isVerified ? 'Your payment has been confirmed' : 'Action required on your payment'}</p>
    </div>

    <div class="content">
      <div class="greeting">Hello ${data.clientName},</div>

      <div class="message">
        ${isVerified
          ? `<p>Excellent news! We've verified your ${data.paymentType} payment for <strong>${data.projectName}</strong>.</p>`
          : `<p>We've reviewed your ${data.paymentType} payment submission for <strong>${data.projectName}</strong>, but we need to address an issue.</p>`
        }
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #374151;">Payment Details</h3>
        <div class="info-row">
          <span class="info-label">Project:</span>
          <span class="info-value">${data.projectName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment Type:</span>
          <span class="info-value">${data.paymentType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount:</span>
          <span class="info-value"><strong>${formatPeso(data.amount)}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="badge ${isVerified ? 'badge-success' : 'badge-warning'}">
            ${isVerified ? 'Verified' : 'Rejected'}
          </span>
        </div>
        ${!isVerified && data.rejectionReason ? `
          <div style="margin-top: 15px; padding: 15px; background: #fef2f2; border-radius: 6px; border-left: 3px solid #dc2626;">
            <p style="margin: 0; color: #991b1b; font-weight: 600;">Reason for rejection:</p>
            <p style="margin: 5px 0 0 0; color: #991b1b;">${data.rejectionReason}</p>
          </div>
        ` : ''}
      </div>

      ${isVerified ? `
        <div class="message">
          <h3 style="color: #374151;">What's Next?</h3>
          ${data.paymentType === 'deposit'
            ? '<p>Your project is now moving forward! Our development team will begin work on your project immediately.</p>'
            : '<p>Thank you for completing the payment! Your project is now finalized and ready for delivery.</p>'
          }
          <p>You can track the progress of your project through your dashboard.</p>
        </div>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <p style="margin: 0; color: #065f46;">
            <strong>🎉 Payment Confirmed:</strong> Your ${data.paymentType} payment of ${formatPeso(data.amount)} has been successfully verified and recorded.
          </p>
        </div>
      ` : `
        <div class="message">
          <h3 style="color: #374151;">Action Required</h3>
          <p>To proceed with your project, please:</p>
          <ol style="padding-left: 20px;">
            <li>Review the rejection reason above</li>
            <li>Prepare a new payment proof</li>
            <li>Submit the payment again through your dashboard</li>
          </ol>
          <p>If you have questions about the rejection, please contact our support team.</p>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;">
            <strong>⚠️ Payment Issue:</strong> Please resubmit your payment with the correct information to continue with your project.
          </p>
        </div>
      `}

      <div style="text-align: center;">
        <a href="${data.projectUrl}" class="button">${isVerified ? 'View Project Progress' : 'Resubmit Payment'}</a>
      </div>
    </div>

    <div class="footer">
      <p><strong>Lunaxcode</strong></p>
      <p>AI-Powered Project Management for Filipino Web Agencies</p>
      <p>
        <a href="${data.projectUrl}">View Project</a> |
        <a href="https://app.lunaxcode.site/dashboard">Dashboard</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px;">
        Need help? Contact us at support@lunaxcode.site or message us through your dashboard.
      </p>
    </div>
  `;

  return wrapEmailHTML(content);
}

/**
 * Email: Project Status Changed
 */
export function projectStatusEmail(data: ProjectStatusEmailData): string {
  const statusMessages: Record<string, { icon: string; message: string; color: string }> = {
    'in-progress': {
      icon: '🚀',
      message: 'Your project development has started!',
      color: '#3b82f6',
    },
    'completed': {
      icon: '🎉',
      message: 'Your project is completed and ready!',
      color: '#10b981',
    },
    'on-hold': {
      icon: '⏸️',
      message: 'Your project has been temporarily paused.',
      color: '#f59e0b',
    },
  };

  const statusInfo = statusMessages[data.newStatus] || {
    icon: '📋',
    message: 'Your project status has been updated.',
    color: '#6b7280',
  };

  const content = `
    <div class="header">
      <h1>${statusInfo.icon} Project Status Update</h1>
      <p>${statusInfo.message}</p>
    </div>

    <div class="content">
      <div class="greeting">Hello ${data.clientName},</div>

      <div class="message">
        <p>We wanted to let you know that the status of your project <strong>${data.projectName}</strong> has been updated.</p>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #374151;">Status Change</h3>
        <div class="info-row">
          <span class="info-label">Project:</span>
          <span class="info-value">${data.projectName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Previous Status:</span>
          <span class="info-value" style="text-transform: capitalize;">${data.oldStatus.replace('-', ' ')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">New Status:</span>
          <span class="info-value" style="text-transform: capitalize; font-weight: 600; color: ${statusInfo.color};">
            ${data.newStatus.replace('-', ' ')}
          </span>
        </div>
      </div>

      ${data.newStatus === 'in-progress' ? `
        <div class="message">
          <h3 style="color: #374151;">Development in Progress</h3>
          <p>Our development team is now actively working on your project. You can:</p>
          <ul>
            <li>Track task progress in real-time</li>
            <li>View completed milestones</li>
            <li>Communicate with the team</li>
            <li>Review work-in-progress updates</li>
          </ul>
        </div>
      ` : ''}

      ${data.newStatus === 'completed' ? `
        <div class="message">
          <h3 style="color: #374151;">🎊 Project Completed!</h3>
          <p>Congratulations! Your project has been completed and is ready for delivery.</p>
          <p>Please review the final deliverables and let us know if you need any adjustments.</p>
        </div>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <p style="margin: 0; color: #065f46;">
            <strong>✅ Quality Checked:</strong> All deliverables have been thoroughly tested and reviewed by our quality assurance team.
          </p>
        </div>
      ` : ''}

      ${data.newStatus === 'on-hold' ? `
        <div class="message">
          <h3 style="color: #374151;">Project On Hold</h3>
          <p>Your project has been temporarily paused. This may be due to:</p>
          <ul>
            <li>Pending payment completion</li>
            <li>Awaiting client feedback or approval</li>
            <li>Additional requirements clarification needed</li>
          </ul>
          <p>Please check your project dashboard or contact us for more information.</p>
        </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="${data.projectUrl}" class="button">View Project Dashboard</a>
      </div>
    </div>

    <div class="footer">
      <p><strong>Lunaxcode</strong></p>
      <p>AI-Powered Project Management for Filipino Web Agencies</p>
      <p>
        <a href="${data.projectUrl}">View Project</a> |
        <a href="https://app.lunaxcode.site/dashboard">Dashboard</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px;">
        Questions? Reply to this email or contact us at support@lunaxcode.site
      </p>
    </div>
  `;

  return wrapEmailHTML(content);
}

/**
 * Email: New Message Received
 */
export function newMessageEmail(data: NewMessageEmailData): string {
  const content = `
    <div class="header">
      <h1>💬 New Message</h1>
      <p>You have a new message in your project</p>
    </div>

    <div class="content">
      <div class="greeting">Hello ${data.clientName},</div>

      <div class="message">
        <p><strong>${data.senderName}</strong> sent you a message regarding <strong>${data.projectName}</strong>.</p>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #374151;">Message Preview</h3>
        <div style="padding: 15px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #1f2937; font-style: italic;">
            "${data.messagePreview}${data.messagePreview.length > 150 ? '...' : ''}"
          </p>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
          Click below to read the full message and reply.
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${data.projectUrl}/messages" class="button">Read & Reply</a>
      </div>

      <hr class="divider">

      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
        <p style="margin: 0; color: #1e40af;">
          <strong>💡 Quick Response:</strong> Fast communication helps keep your project on track. Reply as soon as possible to avoid delays.
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>Lunaxcode</strong></p>
      <p>AI-Powered Project Management for Filipino Web Agencies</p>
      <p>
        <a href="${data.projectUrl}/messages">View Messages</a> |
        <a href="https://app.lunaxcode.site/dashboard">Dashboard</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px;">
        To stop receiving message notifications, update your preferences in settings.
      </p>
    </div>
  `;

  return wrapEmailHTML(content);
}
