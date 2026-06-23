const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(toEmail, name, token) {
  const verifyUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: 'Verify your CrackJAMB account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1b2a4a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">🎓 CrackJAMB</h1>
          <p style="color: #8ba3c7; margin: 8px 0 0;">Your JAMB success starts here</p>
        </div>

        <div style="padding: 32px 24px;">
          <h2 style="color: #1b2a4a;">Hi ${name}! 👋</h2>
          <p style="color: #444; line-height: 1.6;">
            Welcome to CrackJAMB! We are excited to have you join thousands 
            of Nigerian students preparing for JAMB.
          </p>
          <p style="color: #444; line-height: 1.6;">
            Please verify your email address to activate your account:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}"
               style="background: #d4ac0d; color: #1b2a4a; padding: 14px 32px;
                      border-radius: 30px; text-decoration: none; font-weight: 800;
                      font-size: 16px;">
              Verify My Account
            </a>
          </div>

          <p style="color: #888; font-size: 13px;">
            This link expires in 24 hours. If you did not create an account, 
            ignore this email.
          </p>

          <p style="color: #444;">
            Nagode! Ka yi kyau 🎓<br>
            <strong>The CrackJAMB Team</strong>
          </p>
        </div>

        <div style="background: #f4f6fb; padding: 16px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            CrackJAMB — Helping Nigerian students ace JAMB
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendWelcomeEmail(toEmail, name) {
  const mailOptions = {
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: 'Welcome to CrackJAMB! Ya yi kyau 🎓',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1b2a4a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">🎓 CrackJAMB</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #1b2a4a;">Account verified! Nagode, ${name}! 🎉</h2>
          <p style="color: #444; line-height: 1.6;">
            Your account is now active. Start studying and crack that JAMB exam!
          </p>
          <p style="color: #444;">Sai haka! 💪<br><strong>The CrackJAMB Team</strong></p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail, sendWelcomeEmail };