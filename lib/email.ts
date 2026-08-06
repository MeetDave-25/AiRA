import nodemailer from "nodemailer";

export const AIRA_OFFICIAL_EMAIL = "info@aira-lab.in";
export const AIRA_SENDER_NAME = "AiRA Lab";
export const AIRA_SENDER = `"${AIRA_SENDER_NAME}" <${AIRA_OFFICIAL_EMAIL}>`;
export const PORTAL_URL = "https://www.aira-lab.in/portal/login";

interface WelcomeEmailParams {
    to: string;
    name: string;
    password?: string;
    setupToken?: string;
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
    setupToken,
    portalUrl = PORTAL_URL,
    role = "Team Member",
}: {
    name: string;
    email: string;
    password?: string;
    setupToken?: string;
    portalUrl?: string;
    role?: string;
}) {
    const firstName = name.split(" ")[0];
    const setupUrl = setupToken ? `https://www.aira-lab.in/portal/setup-password?token=${setupToken}` : portalUrl;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AiRA Lab</title>
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
        <div class="header-label">Official Membership Notice</div>
        <h1 class="header-title">Welcome to <span>AiRA Lab</span></h1>
      </div>

      <!-- Congrats Banner -->
      <div class="congrats-banner">
        <p>🎉 Your application has been <strong>ACCEPTED</strong> — you're now an official AiRA Lab member!</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="greeting">Hi ${firstName}! 👋</div>
        <p class="text">
          We're excited to welcome you to <strong style="color:#e2e8f0;">AiRA Lab</strong> — Advanced Innovation Research and analysis Lab. Your account has been set up and you can now access the member portal using the credentials below.
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

        ${password ? `
        <div class="notice">
          ⚠️ <strong>Tip:</strong> You can log in using the password above, or click the button below to set your own custom password before logging in.
        </div>` : ""}

        <!-- CTA Buttons -->
        <div class="cta-wrap">
          ${setupToken ? `<a href="${setupUrl}" class="cta-btn" target="_blank" style="background: linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%); display:inline-block;">Set My Own Password →</a>` : `<a href="${portalUrl}" class="cta-btn" target="_blank">Access Member Portal →</a>`}
        </div>
        ${setupToken ? `<p style="text-align:center;font-size:12px;color:#64748b;margin:-16px 0 28px;">or log in directly with the password above</p>` : ""}

        <!-- Steps -->
        <div class="steps-box">
          <div class="steps-title">🛡️ How to Get Started</div>
          <div class="step">
            <span class="step-num">1</span>
            <span><strong style="color:#e2e8f0;">Option A:</strong> Click <em>Set My Own Password</em> above to choose your own password, then log in.</span>
          </div>
          <div class="step">
            <span class="step-num">2</span>
            <span><strong style="color:#e2e8f0;">Option B:</strong> Log in directly at <a href="${portalUrl}" style="color:#00D4FF;">${portalUrl}</a> using the provided password above.</span>
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
        <div class="footer-logo">AiRA Lab</div>
        <p class="footer-sub">Advanced Innovation Research and analysis Lab</p>
        <p class="footer-sub">
          <a href="mailto:${AIRA_OFFICIAL_EMAIL}">${AIRA_OFFICIAL_EMAIL}</a> &nbsp;•&nbsp;
          <a href="https://www.aira-lab.in">www.aira-lab.in</a>
        </p>
        <div class="divider"></div>
        <p class="footer-sub" style="font-size:11px; color:#334155;">
          This email was sent to ${email} because your application to AiRA Lab was approved.
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
    setupToken,
    portalUrl = PORTAL_URL,
}: {
    name: string;
    email: string;
    password?: string;
    setupToken?: string;
    portalUrl?: string;
    role?: string;
}) {
    const setupUrl = setupToken ? `https://www.aira-lab.in/portal/setup-password?token=${setupToken}` : portalUrl;

    return `Welcome to AiRA Lab!

Hi ${name},

Your application to join AiRA Lab has been ACCEPTED.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Portal Login Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal URL: ${portalUrl}
Login ID:   ${email}
${password ? `Password:   ${password}` : ""}

${setupToken ? `Want to set your own password? Use this link (valid 24hrs):\n${setupUrl}` : ""}

How to get started:
1. Log in at ${portalUrl} with the password above.
${setupToken ? `   OR click the link above to set your own custom password first.` : ""}
2. Explore your dashboard, tasks, and team projects.

Questions? Email us at ${AIRA_OFFICIAL_EMAIL}

Best regards,
The AiRA Lab Leadership Team
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
    setupToken,
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
    const subject = `🎉 Welcome to AiRA Lab, ${name}! — Your Portal Login Credentials`;
    const html = generateWelcomeEmailHtml({ name, email: to, password, setupToken, portalUrl, role });
    const text = generateWelcomeEmailText({ name, email: to, password, setupToken, portalUrl, role });

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
    };
}

// ─── Application Confirmation Email ──────────────────────────────────────────

interface ApplicationConfirmationParams {
    to: string;
    name: string;
    interest?: string | null;
}

/**
 * Generate HTML confirmation email for a new applicant
 */
function generateApplicationConfirmationHtml({
    name,
    interest,
}: {
    name: string;
    interest?: string | null;
}) {
    const firstName = name.split(" ")[0];
    const interestLine = interest ? `<p style="margin:0 0 8px;font-size:14px;color:#94a3b8;">Area of interest: <strong style="color:#e2e8f0;">${interest}</strong></p>` : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received — AiRA Lab</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; }
    .wrapper { width: 100%; background-color: #030712; padding: 32px 16px; }
    .container { max-width: 580px; margin: 0 auto; background: #0B0F19; border: 1px solid rgba(0, 212, 255, 0.25); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 60px rgba(0,212,255,0.08); }
    .header { background: linear-gradient(135deg, #0a0e1a 0%, #0f172a 100%); padding: 40px 32px 32px; text-align: center; border-bottom: 1px solid rgba(0,212,255,0.15); }
    .header-label { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #00D4FF; margin-bottom: 10px; }
    .header-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; line-height: 1.2; }
    .header-title span { background: linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .banner { background: linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(124,58,237,0.1) 100%); border-top: 1px solid rgba(0,212,255,0.2); border-bottom: 1px solid rgba(0,212,255,0.2); padding: 16px 32px; text-align: center; font-size: 14px; font-weight: 600; color: #e2e8f0; }
    .content { padding: 32px; }
    .greeting { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 12px; }
    .text { font-size: 14px; color: #94a3b8; line-height: 1.75; margin-bottom: 24px; }
    .info-box { background: #060b14; border: 1px solid rgba(0,212,255,0.2); border-radius: 14px; padding: 20px 24px; margin-bottom: 24px; }
    .info-box-title { font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #00D4FF; margin-bottom: 14px; }
    .footer { background: #060913; border-top: 1px solid rgba(255,255,255,0.06); padding: 24px 32px; text-align: center; }
    .footer-logo { font-size: 14px; font-weight: 800; color: #e2e8f0; margin-bottom: 6px; }
    .footer-sub { font-size: 12px; color: #475569; line-height: 1.6; margin-bottom: 4px; }
    .footer a { color: #00D4FF; text-decoration: none; }
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 16px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-label">Application Status</div>
        <h1 class="header-title">Application <span>Received</span></h1>
      </div>
      <div class="banner">✅ We've received your application and will review it shortly.</div>
      <div class="content">
        <div class="greeting">Hi ${firstName}! 👋</div>
        <p class="text">
          Thank you for applying to <strong style="color:#e2e8f0;">AiRA Lab</strong> — Advanced Innovation Research and analysis Lab.
          Your application is now in our review queue. Our team will evaluate it and get back to you as soon as possible.
        </p>
        <div class="info-box">
          <div class="info-box-title">📋 What Happens Next</div>
          <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin-bottom:10px;">1. Our team will review your application.</p>
          <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin-bottom:10px;">2. If accepted, you'll receive a welcome email with your portal credentials.</p>
          <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin-bottom:0;">3. You can reach out to us anytime at <a href="mailto:${AIRA_OFFICIAL_EMAIL}" style="color:#00D4FF;">${AIRA_OFFICIAL_EMAIL}</a>.</p>
        </div>
        ${interestLine}
        <p class="text" style="margin-bottom:0;font-size:13px;">
          Questions? Reply to this email or contact us at <a href="mailto:${AIRA_OFFICIAL_EMAIL}" style="color:#00D4FF;">${AIRA_OFFICIAL_EMAIL}</a>.
        </p>
      </div>
      <div class="footer">
        <div class="footer-logo">AiRA Lab</div>
        <p class="footer-sub">Advanced Innovation Research and analysis Lab</p>
        <p class="footer-sub">
          <a href="mailto:${AIRA_OFFICIAL_EMAIL}">${AIRA_OFFICIAL_EMAIL}</a> &nbsp;•&nbsp;
          <a href="https://www.aira-lab.in">www.aira-lab.in</a>
        </p>
        <div class="divider"></div>
        <p class="footer-sub" style="font-size:11px;color:#334155;">You received this because you submitted an application to AiRA Lab.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate plain-text confirmation email for a new applicant
 */
function generateApplicationConfirmationText({
    name,
    interest,
}: {
    name: string;
    interest?: string | null;
}) {
    return `Application Received — AiRA Lab

Hi ${name},

Thank you for applying to AiRA Lab (Advanced Innovation Research and analysis Lab)!

We've received your application${interest ? ` for ${interest}` : ""} and our team will review it shortly.

What happens next:
1. Our team will review your application.
2. If accepted, you'll receive a welcome email with your portal login credentials.
3. You can reach out to us anytime at ${AIRA_OFFICIAL_EMAIL}.

Questions? Email us at ${AIRA_OFFICIAL_EMAIL}

Best regards,
The AiRA Lab Leadership Team
${AIRA_OFFICIAL_EMAIL} | https://www.aira-lab.in
`.trim();
}

/**
 * Sends a confirmation email to a new applicant acknowledging receipt of their application
 */
export async function sendApplicationConfirmationEmail({
    to,
    name,
    interest,
}: ApplicationConfirmationParams): Promise<{
    success: boolean;
    status: string;
    messageId?: string;
    error?: string;
    subject: string;
    text: string;
}> {
    const subject = `✅ We've received your AiRA Lab application, ${name}!`;
    const html = generateApplicationConfirmationHtml({ name, interest });
    const text = generateApplicationConfirmationText({ name, interest });

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

            console.log(`[Email] Application confirmation sent to ${to} — MessageID: ${info.messageId}`);

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

    console.warn("[Email] No SMTP transporter configured. Set RESEND_API_KEY in .env to enable emails.");
    return {
        success: false,
        status: "no_smtp_configured",
        error: "RESEND_API_KEY not set in environment variables",
        subject,
        text,
    };
}