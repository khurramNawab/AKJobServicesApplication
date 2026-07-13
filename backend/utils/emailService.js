import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.js';

// ── Transporter (created once, reused) ──────────────────────────────
const createTransporter = () => {
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const isSecure = port === 465;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: isSecure, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // 🔍 SMTP CONNECTION VERIFICATION
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ [SMTP] Connection Failed:', error.message);
        } else {
            console.log('✅ [SMTP] Server is ready to deliver messages');
        }
    });

    return transporter;
};

import { emailQueue } from '../config/queue.js';

// ── Core send function using BullMQ offload ──────────────────────────
const sendEmailWithRetry = async (mailOptions) => {
    try {
        // 1. Create initial tracking log
        const logEntry = await EmailLog.create({
            to: mailOptions.to,
            subject: mailOptions.subject,
            status: 'PENDING',
        });

        // 2. Queue in BullMQ
        await emailQueue.add(
            'sendEmail',
            {
                to: mailOptions.to,
                subject: mailOptions.subject,
                html: mailOptions.html,
                logId: logEntry._id,
            },
            {
                attempts: 3, // Manage retries in BullMQ
                backoff: {
                    type: 'exponential',
                    delay: 2000, // 2s -> 4s -> 8s
                },
            }
        );

        console.log(`[EMAIL QUEUED] Email to ${mailOptions.to} pushed to queue.`);
        return true;
    } catch (error) {
        console.error(`[EMAIL QUEUE ERROR] Failed to push email to queue for ${mailOptions.to}:`, error);
        return false;
    }
};

// ── HTML email wrapper ──────────────────────────────────────────────
const wrapInTemplate = (heading, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  body { margin:0; padding:0; background:#f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width:560px; margin:40px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding:32px 40px; }
  .header h1 { margin:0; color:#ffffff; font-size:22px; font-weight:800; letter-spacing:-0.5px; }
  .body { padding:32px 40px; color:#1e293b; line-height:1.7; font-size:15px; }
  .otp-box { background:#f0f4ff; border:2px dashed #3b82f6; border-radius:12px; text-align:center; padding:20px; margin:24px 0; }
  .otp-code { font-size:36px; font-weight:900; color:#1e40af; letter-spacing:8px; margin:0; }
  .btn { display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:700; font-size:14px; margin:20px 0; }
  .footer { padding:24px 40px; background:#f8fafc; text-align:center; font-size:12px; color:#94a3b8; }
  .subtle { color:#64748b; font-size:13px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>${heading}</h1>
  </div>
  <div class="body">
    ${bodyContent}
  </div>
  <div class="footer">
    &copy; ${new Date().getFullYear()} AK Job Services &mdash; Secure & Trusted Job Portal
  </div>
</div>
</body>
</html>
`;

// ═══════════════════════════════════════════════════════════════════
//  PUBLIC API — Call these from controllers
// ═══════════════════════════════════════════════════════════════════

/**
 * Send account verification email — link-based only, no OTP.
 * The verification link points to the frontend /verify-email/:token route.
 */
export const sendVerificationEmail = async (email, name, verificationToken) => {
    const verificationLink = `https://akjobservices.com/verify-email/${verificationToken}`;

    const html = wrapInTemplate('Verify Your Account 🔐', `
        <p>Hi <strong>${name}</strong>,</p>
        <p>
            Thank you for joining <strong>AK Job Services</strong>!
            Your account has been created — one final step to get started.
        </p>
        <p>Please click the button below to verify your email address and activate your account:</p>

        <div style="text-align: center; margin: 36px 0;">
            <a href="${verificationLink}"
               target="_blank"
               rel="noopener noreferrer"
               style="
                    display: inline-block;
                    background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
                    color: #ffffff;
                    text-decoration: none;
                    padding: 16px 48px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 800;
                    letter-spacing: 0.3px;
                    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
               ">
               ✅ Verify My Account
            </a>
        </div>

        <p style="text-align: center; color: #ef4444; font-weight: 700; font-size: 13px;">
            ⚠️ This link expires in <strong>15 minutes</strong>.
        </p>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

        <p class="subtle">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="
            word-break: break-all;
            background: #f0f4ff;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 12px;
            color: #1d4ed8;
            font-family: monospace;
        ">${verificationLink}</p>

        <p class="subtle" style="margin-top: 24px;">
            If you did not create an account with us, you can safely ignore this email.
        </p>
    `);

    return sendEmailWithRetry({
        from: `"${process.env.SMTP_FROM_NAME || 'AK Job Services'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@akjobs.com'}>`,
        to: email,
        subject: `[ACTION REQUIRED] Verify your AK Job Services account`,
        html,
    });
};



/**
 * Send password-reset email
 */
export const sendPasswordResetEmail = async (email, name, otpCode) => {
    const html = wrapInTemplate('Password Reset Request', `
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Use the code below — it expires in <strong>10 minutes</strong>.</p>
        <div class="otp-box">
            <p class="otp-code">${otpCode}</p>
        </div>
        <p class="subtle">If you did not request this, your account is safe. No action needed.</p>
    `);

    return sendEmailWithRetry({
        from: `"${process.env.SMTP_FROM_NAME || 'AK Job Portal'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@akjobs.com'}>`,
        to: email,
        subject: 'Password Reset — AK Job Portal',
        html,
    });
};

/**
 * Send welcome email after registration
 */
export const sendWelcomeEmail = async (email, name) => {
    const html = wrapInTemplate('Welcome to AK Job Portal! 🎉', `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your account has been created successfully. Here's what you can do next:</p>
        <ul style="padding-left:20px;">
            <li>Complete your profile to stand out</li>
            <li>Browse thousands of job opportunities</li>
            <li>Apply with a single tap</li>
        </ul>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5001'}/jobs" class="btn">Explore Jobs →</a>
        <p class="subtle">Need help? Reply to this email or reach us at support@akjobs.com</p>
    `);

    return sendEmailWithRetry({
        from: `"${process.env.SMTP_FROM_NAME || 'AK Job Portal'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@akjobs.com'}>`,
        to: email,
        subject: 'Welcome to AK Job Portal!',
        html,
    });
};

/**
 * Send admin alert (new user, suspicious activity, etc.)
 */
export const sendAdminAlertEmail = async (subject, messageBody) => {
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_FROM_EMAIL;
    if (!adminEmail) {
        console.warn('[EMAIL] No ADMIN_ALERT_EMAIL configured. Skipping admin alert.');
        return false;
    }

    const html = wrapInTemplate('Admin Alert', `
        <p>${messageBody}</p>
        <p class="subtle">This is an automated alert from the AK Job Portal system.</p>
    `);

    return sendEmailWithRetry({
        from: `"${process.env.SMTP_FROM_NAME || 'AK Job Portal'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@akjobs.com'}>`,
        to: adminEmail,
        subject: `[ADMIN] ${subject}`,
        html,
    });
};

/**
 * Send account locked notification
 */
export const sendAccountLockedEmail = async (email, name) => {
    const html = wrapInTemplate('Account Locked ⚠️', `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your account has been <strong>temporarily locked</strong> due to too many failed login attempts.</p>
        <p>It will automatically unlock after <strong>30 minutes</strong>. If this wasn't you, please reset your password immediately.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5001'}/forgot-password" class="btn">Reset Password →</a>
        <p class="subtle">If you continue to experience issues, contact support@akjobs.com</p>
    `);

    return sendEmailWithRetry({
        from: `"${process.env.SMTP_FROM_NAME || 'AK Job Portal'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@akjobs.com'}>`,
        to: email,
        subject: 'Account Locked — AK Job Portal',
        html,
    });
};

/**
 * Send newsletter subscription confirmation email
 */
export const sendNewsletterSubscriptionEmail = async (email) => {
    const html = wrapInTemplate('Subscription Successful 📬', `
        <p>Hi there,</p>
        <p>You have successfully joined the <strong>AK Job Services</strong> newsletter. You'll receive hand-picked job opportunities from India's top employers delivered straight to your inbox every morning.</p>
        <a href="${process.env.CLIENT_URL || 'https://akjobservices.com'}/jobs" class="btn">Browse Openings →</a>
        <p class="subtle">If you did not request this subscription, you can ignore this email or unsubscribe at any time.</p>
    `);

    return sendEmailWithRetry({
        from: `"${process.env.SMTP_FROM_NAME || 'AK Job Services'}" <${process.env.SMTP_FROM_EMAIL || 'jobak726@gmail.com'}>`,
        to: email,
        subject: 'Welcome to AK Job Services Newsletter! 📬',
        html,
    });
};
