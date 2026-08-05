import nodemailer from "nodemailer";

export const AIRA_OFFICIAL_EMAIL = "info@aira-lab.in";
export const AIRA_SENDER_NAME = "AiRA Labs";
export const AIRA_SENDER = `"${AIRA_SENDER_NAME}" <${AIRA_OFFICIAL_EMAIL}>`;

interface WelcomeEmailParams {
    to: string;
    name: string;
    password?: string;
    portalUrl?: string;
    role?: string;
}

/**
 * Creates a transporter instance using environment variables if available.
 */
function getEmailTransporter() {
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
    portalUrl = "https://aira-lab.in/portal/login",
    role = "Team Member",
}: {
    name: string;
    email: string;
    password?: string;
    portalUrl?: string;
    role?: string;
}) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AiRA Labs</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #030712;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #0B0F19;
      border: 1px solid rgba(0, 212, 255, 0.25);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 40px rgba(0, 212, 255, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #0B0F19 0%, #111827 100%);
      padding: 40px 32px 30px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }
    .logo-badge {
      display: inline-block;
      width: 56px;
      height: 56px;
      line-height: 56px;
      background: linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%);
      color: #ffffff;
      font-weight: 800;
      font-size: 20px;
      border-radius: 18px;
      margin-bottom: 16px;
      box-shadow: 0 8px 20px rgba(0, 212, 255, 0.35);
      letter-spacing: 1px;
    }
    .title {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 8px;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 13px;
      color: #00D4FF;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 0;
    }
    .content {
      padding: 36px 32px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 14px;
    }
    .text {
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 24px;
      line-height: 1.7;
    }
    .credentials-box {
      background: #030712;
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin: 28px 0;
    }
    .credentials-title {
      font-size: 12px;
      font-weight: 700;
      color: #00D4FF;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 16px;
    }
    .cred-row {
      display: flex;
      margin-bottom: 12px;
      font-size: 13px;
    }
    .cred-label {
      color: #6b7280;
      width: 110px;
      font-weight: 600;
    }
    .cred-value {
      color: #ffffff;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.06);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #00D4FF 0%, #3B82F6 50%, #7C3AED 100%);
      color: #030712 !important;
      font-weight: 800;
      font-size: 14px;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 14px;
      box-shadow: 0 10px 25px rgba(0, 212, 255, 0.35);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .steps-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .steps-title {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 10px;
    }
    .step-item {
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 6px;
      padding-left: 4px;
    }
    .footer {
      background: #060913;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 12px;
      color: #6b7280;
      line-height: 1.6;
    }
    .footer a {
      color: #00D4FF;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">AL</div>
      <h1 class="title">Welcome to AiRA Labs</h1>
      <p class="subtitle">Premier Innovation & Robotics Hub</p>
    </div>

    <div class="content">
      <div class="greeting">Congratulations, ${name}! 🎉</div>
      <p class="text">
        We are thrilled to inform you that your application to join <strong>AiRA Labs</strong> has been reviewed and officially <strong>ACCEPTED</strong>! You have been assigned as a <strong>${role}</strong>.
      </p>

      ${
          password
              ? `
      <div class="credentials-box">
        <div class="credentials-title">🔑 Your Portal Access Credentials</div>
        <div class="cred-row">
          <span class="cred-label">Portal URL:</span>
          <span class="cred-value">${portalUrl}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Login Email:</span>
          <span class="cred-value">${email}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Password:</span>
          <span class="cred-value">${password}</span>
        </div>
      </div>
      `
              : `
      <div class="credentials-box">
        <div class="credentials-title">🔑 Portal Access</div>
        <div class="cred-row">
          <span class="cred-label">Portal URL:</span>
          <span class="cred-value">${portalUrl}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Login Email:</span>
          <span class="cred-value">${email}</span>
        </div>
      </div>
      `
      }

      <div class="cta-container">
        <a href="${portalUrl}" class="cta-button" target="_blank">Access Member Portal 🚀</a>
      </div>

      <div class="steps-box">
        <div class="steps-title">🛡️ Recommended First Steps:</div>
        <div class="step-item">1. Log in to the member portal using your credentials above.</div>
        <div class="step-item">2. Navigate to <strong>Settings & Security</strong> to update and change your password.</div>
        <div class="step-item">3. Explore your team projects, tasks board, and live lab broadcasts.</div>
      </div>

      <p class="text" style="margin-bottom: 0;">
        If you have any questions or require assistance, feel free to reply directly to this email or reach us at <a href="mailto:${AIRA_OFFICIAL_EMAIL}" style="color: #00D4FF;">${AIRA_OFFICIAL_EMAIL}</a>.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px;">
        <strong>AiRA Labs</strong> • Artificial Intelligence & Robotics Association
      </p>
      <p style="margin: 0 0 6px;">
        Official Support & Inquiries: <a href="mailto:${AIRA_OFFICIAL_EMAIL}">${AIRA_OFFICIAL_EMAIL}</a>
      </p>
      <p style="margin: 0; font-size: 11px; color: #4b5563;">
        This automated invitation was sent to ${email} regarding your lab membership.
      </p>
    </div>
  </div>
</body>
</html>
    `;
}

/**
 * Generate plain-text welcome email
 */
export function generateWelcomeEmailText({
    name,
    email,
    password,
    portalUrl = "https://aira-lab.in/portal/login",
    role = "Team Member",
}: {
    name: string;
    email: string;
    password?: string;
    portalUrl?: string;
    role?: string;
}) {
    return `
Welcome to AiRA Labs! 🎉

Dear ${name},

Congratulations! Your application to join AiRA Labs has been reviewed and officially ACCEPTED. You are assigned as a ${role}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 YOUR MEMBER PORTAL LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal Login URL: ${portalUrl}
Login Email ID:   ${email}
${password ? `Temporary Password: ${password}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ RECOMMENDED NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visit the portal login page at: ${portalUrl}
2. Log in using your email and password.
3. Open your Dashboard / Settings to change your password and personalize your profile.
4. Check your assigned team tasks and active lab projects.

If you have any questions, contact us at ${AIRA_OFFICIAL_EMAIL}.

Best regards,
The AiRA Labs Leadership Team
Official Email: ${AIRA_OFFICIAL_EMAIL}
Website: https://aira-lab.in
`.trim();
}

/**
 * Dispatches a welcome email to an accepted member
 */
export async function sendWelcomeEmail({
    to,
    name,
    password,
    portalUrl = "https://aira-lab.in/portal/login",
    role = "Team Member",
}: WelcomeEmailParams) {
    const subject = `🎉 Congratulations ${name}! Welcome to AiRA Labs (Your Portal Login Credentials)`;
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
            return {
                success: true,
                messageId: info.messageId,
                status: "sent_via_smtp",
                subject,
                text,
            };
        } catch (error: any) {
            console.error("SMTP send error:", error);
            return {
                success: false,
                error: error?.message || "SMTP error",
                status: "smtp_failed",
                subject,
                text,
            };
        }
    }

    // If SMTP is not yet set in environment variables, return preformatted payload with mailto
    return {
        success: true,
        status: "ready_for_dispatch",
        subject,
        text,
        mailtoUrl: `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
    };
}
