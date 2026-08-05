import nodemailer from "nodemailer";

export const AIRA_OFFICIAL_EMAIL = "info@aira-lab.in";
export const AIRA_SENDER_NAME = "AiRA Labs";
export const AIRA_SENDER = `"${AIRA_SENDER_NAME}" <${AIRA_OFFICIAL_EMAIL}>`;
export const PORTAL_URL = "https://www.aira-lab.in/portal/login";

interface WelcomeEmailParams {
    to: string;
    name: string;
    password?: string;
    portalUrl?: string;
    role?: string;
}

/**
 * Creates a Resend SMTP transporter.
 * 
 * How to get a free Resend API key:
 * 1. Go to https://resend.com and sign up for a free account
 * 2. Add your domain (aira-lab.in) and verify it by adding DNS records
 * 3. Go to API Keys → Create API Key
 * 4. Copy the key and set RESEND_API_KEY in your .env file
 * 
 * Free tier: 3,000 emails/month, 100/day — perfect for a lab!
 */
function getEmailTransporter() {
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
        return nodemailer.createTransport({
            host: "smtp.resend.com",
            port: 465,
            secure: true,
            auth: {
                user: "resend",
                pass: apiKey,
            },
        });
    }

    // Legacy SMTP fallback (if you have your own SMTP server)
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
    }

    return null;
}

/**
 * Generate high-end HTML Welcome Email for accepted members
 */
export function generateWelcomeEmailHtml({
    name,
    email,
    password,
    portalUrl = PORTAL_URL,
    role = "Team Member",
}: {
    name: string;
    email: string;
    password?: string;
    portalUrl?: string;
    role?: string;
}) {
    const firstName = name.split(" ")[0];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AiRA Labs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #030712;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f3f4f6;
      -webkit-text-size-adjust: 100%;
    }
    .wrapper {
      width: 100%;
      background-color: #030712;
      padding: 32px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background: #0B0F19;
      border: 1px solid rgba(0, 212, 255, 0.25);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 60px rgba(0, 212, 255, 0.08);
    }
    /* Header */
    .header {
      background: linear-gradient(135deg, #0a0e1a 0%, #0f172a 100%);
      padding: 40px 32px 32px;
      text-align: center;
      border-bottom: 1px solid rgba(0, 212, 255, 0.15);
      position: relative;
      overflow: hidden;
    }
    .header-glow {
      position: absolute;
      top: -60px; left: 50%;
      transform: translateX(-50%);
      width: 240px; height: 160px;
      background: radial-gradient(ellipse, rgba(0,212,255,0.18) 0%, transparent 70%);
      pointer-events: none;
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 60px; height: 60px;
      background: linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%);
      border-radius: 18px;
      margin-bottom: 18px;
      box-shadow: 0 8px 24px rgba(0, 212, 255, 0.4);
      font-weight: 900;
      font-size: 18px;
      color: #ffffff;
      letter-spacing: 1px;
    }
    .header-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #00D4FF;
      margin-bottom: 10px;
    }
    .header-title {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    .header-title span {
      background: linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    /* Congrats Banner */
    .congrats-banner {
      background: linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(124,58,237,0.12) 100%);
      border-top: 1px solid rgba(0,212,255,0.2);
      border-bottom: 1px solid rgba(0,212,255,0.2);
      padding: 18px 32px;
      text-align: center;
    }
    .congrats-banner p {
      font-size: 14px;
      font-weight: 600;
      color: #e2e8f0;
      line-height: 1.5;
    }
    .congrats-banner strong {
      color: #00D4FF;
    }
    /* Content */
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 12px;
    }
    .text {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.75;
      margin-bottom: 28px;
    }
    /* Credentials Box */
    .creds-box {
      background: #060b14;
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 18px;
      padding: 24px 28px;
      margin-bottom: 28px;
      position: relative;
      overflow: hidden;
    }
    .creds-box-glow {
      position: absolute;
      top: -30px; right: -30px;
      width: 120px; height: 120px;
      background: radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .creds-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #00D4FF;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cred-row {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 13px;
    }
    .cred-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .cred-label {
      color: #64748b;
      font-weight: 600;
      min-width: 120px;
      flex-shrink: 0;
    }
    .cred-value {
      color: #e2e8f0;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-weight: 700;
      background: rgba(0, 212, 255, 0.06);
      border: 1px solid rgba(0, 212, 255, 0.15);
      padding: 4px 10px;
      border-radius: 8px;
      word-break: break-all;
      font-size: 12px;
    }
    .cred-value.password-value {
      background: rgba(124, 58, 237, 0.08);
      border-color: rgba(124, 58, 237, 0.3);
      color: #c4b5fd;
    }
    /* CTA Button */
    .cta-wrap {
      text-align: center;
      margin: 28px 0;
    }
    .cta-btn {
      display: inline-block;
      background: linear-gradient(135deg, #00D4FF 0%, #3B82F6 50%, #7C3AED 100%);
      color: #030712 !important;
      font-weight: 800;
      font-size: 13px;
      text-decoration: none;
      padding: 14px 40px;
      border-radius: 14px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 8px 24px rgba(0, 212, 255, 0.35);
    }
    /* Steps */
    .steps-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 14px;
      padding: 20px 22px;
      margin-bottom: 28px;
    }
    .steps-title {
      font-size: 12px;
      font-weight: 800;
      color: #e2e8f0;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .step {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .step:last-child { margin-bottom: 0; }
    .step-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px; height: 20px;
      min-width: 20px;
      border-radius: 50%;
      background: rgba(0,212,255,0.15);
      color: #00D4FF;
      font-size: 11px;
      font-weight: 800;
    }
    .notice {
      font-size: 13px;
      color: #64748b;
      line-height: 1.7;
      padding: 16px;
      background: rgba(245, 158, 11, 0.06);
      border: 1px solid rgba(245, 158, 11, 0.15);
      border-radius: 12px;
      margin-bottom: 28px;
    }
    .notice strong { color: #fbbf24; }
    /* Footer */
    .footer {
      background: #060913;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding: 24px 32px;
      text-align: center;
    }
    .footer-logo {
      font-size: 14px;
      font-weight: 800;
      color: #e2e8f0;
      margin-bottom: 6px;
    }
    .footer-sub {
      font-size: 12px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 4px;
    }
    .footer a {
      color: #00D4FF;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background: rgba(255,255,255,0.06);
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">

      <!-- Header -->
      <div class="header">
        <div class="header-glow"></div>
        <div class="logo-badge">AL</div>
        <div class="header-label">Official Membership Notice</div>
        <h1 class="header-title">Welcome to <span>AiRA Labs</span></h1>
      </div>

      <!-- Congrats Banner -->
      <div class="congrats-banner">
        <p>🎉 Your application has been <strong>ACCEPTED</strong> — you're now an official AiRA Labs member!</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="greeting">Hi ${firstName}! 👋</div>
        <p class="text">
          We're excited to welcome you to <strong style="color:#e2e8f0;">AiRA Labs</strong> — Artificial Intelligence &amp; Robotics Association. Your account has been set up and you can now access the member portal using the credentials below.
        </p>

        <!-- Credentials Box -->
        <div class="creds-box">
          <div class="creds-box-glow"></div>
          <div class="creds-title">🔑&nbsp; Your Portal Login Credentials</div>

          <div class="cred-row">
            <span class="cred-label">Portal URL:</span>
            <span class="cred-value"><a href="${portalUrl}" style="color:#00D4FF;text-decoration:none;">${portalUrl}</a></span>
          </div>
          <div class="cred-row">
            <span class="cred-label">Login ID:</span>
            <span class="cred-value">${email}</span>
          </div>
          ${password ? `
          <div class="cred-row">
            <span class="cred-label">Password:</span>
            <span class="cred-value password-value">${password}</span>
          </div>` : ""}
        </div>

        <!-- Password change notice -->
        ${password ? `
        <div class="notice">
          ⚠️ <strong>Important:</strong> This is a temporary password. Please log in and go to <strong>Portal → Settings</strong> to change it immediately.
        </div>` : ""}

        <!-- CTA Button -->
        <div class="cta-wrap">
          <a href="${portalUrl}" class="cta-btn" target="_blank">Access Member Portal →</a>
        </div>

        <!-- Steps -->
        <div class="steps-box">
          <div class="steps-title">🛡️ First Steps After Login</div>
          <div class="step">
            <span class="step-num">1</span>
            <span>Log in at <a href="${portalUrl}" style="color:#00D4FF;">${portalUrl}</a> using your credentials above.</span>
          </div>
          <div class="step">
            <span class="step-num">2</span>
            <span>Go to <strong style="color:#e2e8f0;">Settings</strong> and change your temporary password immediately.</span>
          </div>
          <div class="step">
            <span class="step-num">3</span>
            <span>Explore your dashboard — check your team tasks, lab broadcasts, and upcoming events.</span>
          </div>
          <div class="step">
            <span class="step-num">4</span>
            <span>Your role will be assigned by an admin shortly — watch out for an update notification.</span>
          </div>
        </div>

        <p class="text" style="margin-bottom: 0; font-size:13px;">
          Questions? Reply to this email or contact us at <a href="mailto:${AIRA_OFFICIAL_EMAIL}" style="color:#00D4FF;">${AIRA_OFFICIAL_EMAIL}</a>.<br>
          We're glad to have you on board!
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-logo">AiRA Labs</div>
        <p class="footer-sub">Artificial Intelligence &amp; Robotics Association</p>
        <p class="footer-sub">
          <a href="mailto:${AIRA_OFFICIAL_EMAIL}">${AIRA_OFFICIAL_EMAIL}</a> &nbsp;•&nbsp;
          <a href="https://www.aira-lab.in">www.aira-lab.in</a>
        </p>
        <div class="divider"></div>
        <p class="footer-sub" style="font-size:11px; color:#334155;">
          This email was sent to ${email} because your application to AiRA Labs was approved.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate plain-text welcome email (fallback)
 */
export function generateWelcomeEmailText({
    name,
    email,
    password,
    portalUrl = PORTAL_URL,
}: {
    name: string;
    email: string;
    password?: string;
    portalUrl?: string;
    role?: string;
}) {
    return `Welcome to AiRA Labs!

Hi ${name},

Your application to join AiRA Labs has been ACCEPTED. Here are your portal login credentials:

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Portal Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal URL: ${portalUrl}
Login ID:   ${email}
${password ? `Password:   ${password}` : ""}

${password ? "⚠️  Please log in and change your password from Portal → Settings immediately." : ""}

First Steps:
1. Visit: ${portalUrl}
2. Log in with your email and password above.
3. Go to Settings to change your password.
4. Explore your dashboard, tasks, and team projects.

Questions? Email us at ${AIRA_OFFICIAL_EMAIL}

Best regards,
The AiRA Labs Leadership Team
${AIRA_OFFICIAL_EMAIL} | https://www.aira-lab.in
`.trim();
}

/**
 * Dispatches a welcome email to an accepted member
 */
export async function sendWelcomeEmail({
    to,
    name,
    password,
    portalUrl = PORTAL_URL,
    role = "Team Member",
}: WelcomeEmailParams): Promise<{
    success: boolean;
    status: string;
    messageId?: string;
    error?: string;
    subject: string;
    text: string;
    mailtoUrl?: string;
}> {
    const subject = `🎉 Welcome to AiRA Labs, ${name}! — Your Portal Login Credentials`;
    const html = generateWelcomeEmailHtml({ name, email: to, password, portalUrl, role });
    const text = generateWelcomeEmailText({ name, email: to, password, portalUrl, role });

    const transporter = getEmailTransporter();

    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: AIRA_SENDER,
                to,
                replyTo: AIRA_OFFICIAL_EMAIL,
                subject,
                text,
                html,
            });

            console.log(`[Email] Welcome email sent to ${to} — MessageID: ${info.messageId}`);

            return {
                success: true,
                messageId: info.messageId,
                status: "sent",
                subject,
                text,
            };
        } catch (error: any) {
            console.error("[Email] SMTP send failed:", error?.message || error);
            return {
                success: false,
                error: error?.message || "SMTP send failed",
                status: "smtp_failed",
                subject,
                text,
            };
        }
    }

    // No transporter configured — return a preformatted payload so you can debug
    console.warn("[Email] No SMTP transporter configured. Set RESEND_API_KEY in .env to enable emails.");
    return {
        success: false,
        status: "no_smtp_configured",
        error: "RESEND_API_KEY not set in environment variables",
        subject,
        text,
        mailtoUrl: `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
    };
}
