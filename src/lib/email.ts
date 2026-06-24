import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || "no-reply@innoversity.berlin";

  const messageText = `Hi,\n\nDu hast ein Zurücksetzen deines Passworts angefordert. Klicke auf den folgenden Link, um ein neues Passwort festzulegen:\n\n${resetUrl}\n\nDieser Link ist 1 Stunde lang gültig.\n\nFalls du dies nicht angefordert hast, kannst du diese E-Mail ignorieren.`;

  // Fallback: If no SMTP is configured, log the email to console
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log("==========================================");
    console.log("PASSWORD RESET EMAIL (SMTP NOT CONFIGURED)");
    console.log(`TO: ${email}`);
    console.log(`FROM: ${smtpFrom}`);
    console.log("BODY:");
    console.log(messageText);
    console.log("==========================================");
    return;
  }

  // Real SMTP sending
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for others
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: "Innoversity LMS - Passwort zurücksetzen",
      text: messageText,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1.5px solid #eee; border-radius: 12px; background: #fff;">
          <h2 style="font-family: Arial, sans-serif; color: #1e3a8a; margin-top: 0;">Innoversity LMS</h2>
          <p>Hi,</p>
          <p>du hast ein Zurücksetzen deines Passworts angefordert. Klicke auf den folgenden Button, um dein Passwort neu festzulegen:</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Passwort zurücksetzen</a>
          </div>
          <p>Oder kopiere diesen Link in deinen Browser:</p>
          <p style="word-break: break-all;"><a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a></p>
          <p>Dieser Link ist 1 Stunde lang gültig.</p>
          <hr style="border: none; border-top: 1.5px solid #eee; margin-top: 24px;" />
          <p style="font-size: 11px; color: #888; margin-bottom: 0;">Falls du dies nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send SMTP email:", error);
    // Even if SMTP fails, we log it to console as fallback in development/VM testing
    console.log("==========================================");
    console.log("PASSWORD RESET EMAIL FALLBACK LOG");
    console.log(`TO: ${email}`);
    console.log(`LINK: ${resetUrl}`);
    console.log("==========================================");
  }
}
