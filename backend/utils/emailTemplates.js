import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

// Welcome Email Template
export const welcomeEmailTemplate = (userName, societyName) => {
  return {
    subject: `Welcome to ${societyName} - Society Ease`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Society Ease</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏢 Welcome to Society Ease</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Welcome to <strong>${societyName}</strong> community on Society Ease!</p>
          <p>We're excited to have you as part of our digital community management platform. Here's what you can do:</p>
          <ul>
            <li>📝 Submit and track maintenance requests</li>
            <li>💰 View and pay society bills</li>
            <li>📢 Stay updated with community announcements</li>
            <li>🗳️ Participate in community voting</li>
            <li>📅 Book common area facilities</li>
          </ul>
          <p>Get started by logging into your account and exploring all the features we have to offer.</p>
          <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
        </div>
        <div class="footer">
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>© 2025 Society Ease. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to ${societyName} - Society Ease\n\nHello ${userName}!\n\nWelcome to ${societyName} community on Society Ease!\n\nWe're excited to have you as part of our digital community management platform.`
  };
};

// Password Reset Email Template
export const passwordResetTemplate = (userName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  return {
    subject: 'Password Reset Request - Society Ease',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #e74c3c;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>We received a request to reset your password for your Society Ease account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in 1 hour for security reasons</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>If you have any questions, contact our support team.</p>
          <p>© 2025 Society Ease. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Password Reset Request - Society Ease\n\nHello ${userName}!\n\nWe received a request to reset your password.\n\nReset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`
  };
};

// Maintenance Request Notification Template
export const maintenanceRequestTemplate = (userName, requestId, requestType, description) => {
  return {
    subject: `Maintenance Request Submitted - #${requestId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maintenance Request Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #27ae60;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .request-details {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #27ae60;
          }
          .button {
            display: inline-block;
            background: #27ae60;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔧 Maintenance Request Submitted</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Your maintenance request has been successfully submitted and is being processed.</p>
          
          <div class="request-details">
            <h3>Request Details:</h3>
            <p><strong>Request ID:</strong> #${requestId}</p>
            <p><strong>Type:</strong> ${requestType}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Status:</strong> <span style="color: #f39c12;">Pending</span></p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>We'll notify you once your request is assigned to a maintenance team member.</p>
          
          <a href="${process.env.FRONTEND_URL}/maintenance/track" class="button">Track Your Request</a>
        </div>
        <div class="footer">
          <p>For urgent issues, please contact the society office directly.</p>
          <p>© 2025 Society Ease. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Maintenance Request Submitted - #${requestId}\n\nHello ${userName}!\n\nYour maintenance request has been submitted.\n\nRequest ID: #${requestId}\nType: ${requestType}\nDescription: ${description}`
  };
};

// Payment Confirmation Template
export const paymentConfirmationTemplate = (userName, amount, billType, transactionId) => {
  return {
    subject: `Payment Confirmation - ₹${amount}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #2ecc71;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .payment-details {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #2ecc71;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #2ecc71;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Payment Successful</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Your payment has been successfully processed. Thank you for your prompt payment!</p>
          
          <div class="amount">₹${amount}</div>
          
          <div class="payment-details">
            <h3>Payment Details:</h3>
            <p><strong>Amount:</strong> ₹${amount}</p>
            <p><strong>Bill Type:</strong> ${billType}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: #2ecc71;">Completed</span></p>
          </div>
          
          <p>A receipt has been generated for your records. You can view and download it from your account dashboard.</p>
        </div>
        <div class="footer">
          <p>Keep this email for your records.</p>
          <p>© 2025 Society Ease. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Payment Confirmation - ₹${amount}\n\nHello ${userName}!\n\nYour payment of ₹${amount} for ${billType} has been successfully processed.\n\nTransaction ID: ${transactionId}`
  };
};

// Community Announcement Template
export const announcementTemplate = (title, content, priority = 'normal') => {
  const priorityColors = {
    low: '#3498db',
    normal: '#2ecc71',
    high: '#f39c12',
    urgent: '#e74c3c'
  };
  
  const priorityIcons = {
    low: 'ℹ️',
    normal: '📢',
    high: '⚠️',
    urgent: '🚨'
  };
  
  return {
    subject: `${priorityIcons[priority]} Community Announcement: ${title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Community Announcement</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: ${priorityColors[priority]};
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .priority {
            display: inline-block;
            background: ${priorityColors[priority]};
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 20px;
          }
          .announcement-content {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid ${priorityColors[priority]};
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${priorityIcons[priority]} Community Announcement</h1>
        </div>
        <div class="content">
          <span class="priority">${priority} Priority</span>
          <h2>${title}</h2>
          
          <div class="announcement-content">
            ${content}
          </div>
          
          <p><strong>Posted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div class="footer">
          <p>This is an automated message from your society management.</p>
          <p>© 2025 Society Ease. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Community Announcement: ${title}\n\n${content.replace(/<[^>]*>/g, '')}\n\nPosted: ${new Date().toLocaleString()}`
  };
};

// Email Verification Template
export const emailVerificationTemplate = (userName, verificationUrl) => {
  return {
    subject: 'Verify Your Email - Society Ease',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📧 Verify Your Email</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for registering with Society Ease. Please verify your email address to complete your registration.</p>
          <p>Click the button below to verify your email:</p>
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          <p>Or copy and paste this link in your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>If you didn't request this verification, please ignore this email.</p>
          <p>© 2025 Society Ease. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${userName}!\n\nThank you for registering with Society Ease. Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this verification, please ignore this email.`
  };
};

// Account Approval Template
export const accountApprovalTemplate = (userName, societyName, message) => {
  return {
    subject: `Account Approved - Welcome to ${societyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #28a745;
            color: white !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Account Approved!</h1>
        </div>
        <div class="content">
          <h2>Congratulations ${userName}!</h2>
          <p>Your account has been approved by the admin and you can now access all features of Society Ease for <strong>${societyName}</strong>.</p>
          ${message ? `<p><strong>Message from Admin:</strong> ${message}</p>` : ''}
          <p>You can now:</p>
          <ul>
            <li>📝 Submit maintenance requests</li>
            <li>💰 View and pay bills</li>
            <li>📢 Stay updated with announcements</li>
            <li>🗳️ Participate in community voting</li>
            <li>📅 Book common area facilities</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
        </div>
        <div class="footer">
          <p>Welcome to the community!</p>
          <p>© 2025 Society Ease. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Congratulations ${userName}!\n\nYour account has been approved and you can now access Society Ease for ${societyName}.\n\n${message ? `Message from Admin: ${message}\n\n` : ''}Login at: ${process.env.FRONTEND_URL}/login`
  };
};

// Account Rejection Template
export const accountRejectionTemplate = (userName, reason) => {
  return {
    subject: 'Account Registration Update - Society Ease',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Registration Update</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Registration Update</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>We regret to inform you that your registration request has not been approved at this time.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>If you believe this is an error or if you have additional information to provide, please contact the society administrator or try registering again with the correct information.</p>
          <a href="${process.env.FRONTEND_URL}/register" class="button">Register Again</a>
        </div>
        <div class="footer">
          <p>If you have any questions, please contact our support team.</p>
          <p>© 2025 Society Ease. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${userName},\n\nYour registration request has not been approved.\n\nReason: ${reason}\n\nYou can try registering again at: ${process.env.FRONTEND_URL}/register`
  };
};

// Alert Email Template
export const alertEmailTemplate = (alert, type = 'new') => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#3498db';
      case 'low': return '#27ae60';
      default: return '#3498db';
    }
  };

  const getTypeIcon = (alertType) => {
    switch (alertType) {
      case 'water': return '💧';
      case 'electricity': return '⚡';
      case 'gas': return '🔥';
      case 'internet': return '🌐';
      case 'elevator': return '🛗';
      case 'security': return '🔒';
      case 'maintenance': return '🔧';
      default: return '📢';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const titleText = type === 'escalated' ? `Alert Escalated: ${alert.title}` : 
                   type === 'new' ? `New Alert: ${alert.title}` : alert.title;

  return {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${titleText}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: ${getPriorityColor(alert.priority)};
            color: white;
            padding: 30px;
            text-align: center;
          }
          .priority-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px;
          }
          .alert-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .label {
            font-weight: bold;
            color: #666;
          }
          .button {
            display: inline-block;
            background: ${getPriorityColor(alert.priority)};
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            padding: 20px;
            background: #f8f9fa;
          }
          .affected-areas {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="priority-badge">${alert.priority} Priority</div>
            <h1>${getTypeIcon(alert.type)} ${titleText}</h1>
          </div>
          
          <div class="content">
            <div class="alert-details">
              <div class="detail-row">
                <span class="label">Alert ID:</span>
                <span>${alert.alertId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Type:</span>
                <span>${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span>${alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Created:</span>
                <span>${formatDate(alert.createdDate)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Expected Resolution:</span>
                <span>${formatDate(alert.estimatedResolutionTime)}</span>
              </div>
            </div>

            <h3>Description:</h3>
            <p>${alert.description}</p>

            ${alert.visibility.scope !== 'all' ? `
            <div class="affected-areas">
              <h4>Affected Areas:</h4>
              ${alert.visibility.affectedAreas.buildings?.length ? 
                `<p><strong>Buildings:</strong> ${alert.visibility.affectedAreas.buildings.join(', ')}</p>` : ''}
              ${alert.visibility.affectedAreas.flats?.length ? 
                `<p><strong>Flats:</strong> ${alert.visibility.affectedAreas.flats.map(f => `${f.flatNumber} (${f.building})`).join(', ')}</p>` : ''}
              ${alert.visibility.affectedAreas.areas?.length ? 
                `<p><strong>Areas:</strong> ${alert.visibility.affectedAreas.areas.join(', ')}</p>` : ''}
            </div>
            ` : ''}

            <p><strong>Created by:</strong> ${alert.createdBy.userName} (${alert.createdBy.userRole})</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/alerts/${alert.alertId}" class="button">
                View Alert Details
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Stay updated with the latest information about this alert.</p>
            <p>© 2025 Society Ease. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${titleText}

Alert ID: ${alert.alertId}
Type: ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
Priority: ${alert.priority.toUpperCase()}
Status: ${alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}

Description: ${alert.description}

Created: ${formatDate(alert.createdDate)}
Expected Resolution: ${formatDate(alert.estimatedResolutionTime)}
Created by: ${alert.createdBy.userName} (${alert.createdBy.userRole})

View full details at: ${process.env.FRONTEND_URL}/alerts/${alert.alertId}
    `
  };
};

// Alert Update Email Template
export const alertUpdateTemplate = (alert) => {
  const latestUpdate = alert.updates[alert.updates.length - 1];
  
  return {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alert Update: ${alert.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: #3498db;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .update-box {
            background: #e8f4fd;
            border-left: 4px solid #3498db;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .button {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            padding: 20px;
            background: #f8f9fa;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔄 Alert Update</h1>
            <h2>${alert.title}</h2>
          </div>
          
          <div class="content">
            <p><strong>Alert ID:</strong> ${alert.alertId}</p>
            
            <div class="update-box">
              <h3>Latest Update:</h3>
              <p>${latestUpdate.message}</p>
              <p><small>
                Updated by: ${latestUpdate.updatedBy.userName} 
                on ${new Date(latestUpdate.timestamp).toLocaleString()}
              </small></p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/alerts/${alert.alertId}" class="button">
                View Full Alert
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2025 Society Ease. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Alert Update: ${alert.title}

Alert ID: ${alert.alertId}

Latest Update: ${latestUpdate.message}
Updated by: ${latestUpdate.updatedBy.userName} on ${new Date(latestUpdate.timestamp).toLocaleString()}

View full alert at: ${process.env.FRONTEND_URL}/alerts/${alert.alertId}
    `
  };
};

// Alert Resolution Email Template
export const alertResolutionTemplate = (alert) => {
  return {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alert Resolved: ${alert.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: #27ae60;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .resolution-box {
            background: #d5f4e6;
            border-left: 4px solid #27ae60;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .stat-item {
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #27ae60;
          }
          .button {
            display: inline-block;
            background: #27ae60;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            padding: 20px;
            background: #f8f9fa;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Alert Resolved</h1>
            <h2>${alert.title}</h2>
          </div>
          
          <div class="content">
            <p><strong>Alert ID:</strong> ${alert.alertId}</p>
            
            <div class="resolution-box">
              <h3>Resolution Details:</h3>
              <p>${alert.resolution.resolutionNotes}</p>
              <p><small>
                Resolved by: ${alert.resolution.resolvedBy.userName} 
                on ${new Date(alert.actualResolutionTime).toLocaleString()}
              </small></p>
            </div>

            <div class="stats">
              <div class="stat-item">
                <div class="stat-number">${Math.floor((alert.actualResolutionTime - alert.startTime) / (1000 * 60 * 60))}</div>
                <div>Hours to Resolution</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${alert.updates.length}</div>
                <div>Total Updates</div>
              </div>
            </div>

            <p>Thank you for your patience during this maintenance period. The issue has been successfully resolved.</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/alerts/${alert.alertId}" class="button">
                View Resolution Details
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2025 Society Ease. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Alert Resolved: ${alert.title}

Alert ID: ${alert.alertId}

Resolution Details: ${alert.resolution.resolutionNotes}
Resolved by: ${alert.resolution.resolvedBy.userName} on ${new Date(alert.actualResolutionTime).toLocaleString()}

Time to Resolution: ${Math.floor((alert.actualResolutionTime - alert.startTime) / (1000 * 60 * 60))} hours
Total Updates: ${alert.updates.length}

View resolution details at: ${process.env.FRONTEND_URL}/alerts/${alert.alertId}
    `
  };
};
