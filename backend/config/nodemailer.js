import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

// Create transporter for Brevo
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports like 587
    auth: {
      user: process.env.EMAIL_USER, // Your Brevo login email
      pass: process.env.EMAIL_PASS, // Your Brevo SMTP key
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments || []
    };

    console.log('📧 Sending email to:', options.to);
    console.log('📧 Using SMTP host:', process.env.EMAIL_HOST || 'smtp-relay.brevo.com');

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration verification failed:', error.message);
    return false;
  }
};

export default { sendEmail, verifyEmailConfig };