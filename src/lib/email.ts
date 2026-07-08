import nodemailer from "nodemailer";

function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || "no-reply@innoversity.berlin";

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

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
    return { transporter, smtpFrom };
  } catch (err) {
    console.error("Error creating nodemailer transport:", err);
    return null;
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const messageText = `Hi,\n\nDu hast ein Zurücksetzen deines Passworts angefordert. Klicke auf den folgenden Link, um ein neues Passwort festzulegen:\n\n${resetUrl}\n\nDieser Link ist 1 Stunde lang gültig.\n\nFalls du dies nicht angefordert hast, kannst du diese E-Mail ignorieren.`;
  const mailDetails = getTransporter();

  // Fallback: If no SMTP is configured, log the email to console
  if (!mailDetails) {
    console.log("==========================================");
    console.log("PASSWORD RESET EMAIL (SMTP NOT CONFIGURED)");
    console.log(`TO: ${email}`);
    console.log("BODY:");
    console.log(messageText);
    console.log("==========================================");
    return;
  }

  // Real SMTP sending
  try {
    await mailDetails.transporter.sendMail({
      from: mailDetails.smtpFrom,
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
    console.error("Failed to send SMTP password reset email:", error);
    console.log("==========================================");
    console.log("PASSWORD RESET EMAIL FALLBACK LOG");
    console.log(`TO: ${email}`);
    console.log(`LINK: ${resetUrl}`);
    console.log("==========================================");
  }
}

export async function sendSignUpNotificationEmail(
  adminEmail: string,
  newUser: { name: string; email: string; role: string }
): Promise<void> {
  const messageText = `Hallo Admin,\n\nein neuer Benutzer hat sich auf Innoversity registriert und wartet auf Freischaltung:\n\nName: ${newUser.name}\nE-Mail: ${newUser.email}\nRolle: ${newUser.role}\n\nBitte logge dich im Admin-Bereich ein, um diesen Benutzer freizuschalten.`;
  const mailDetails = getTransporter();

  if (!mailDetails) {
    console.log("==========================================");
    console.log("SIGNUP NOTIFICATION EMAIL (SMTP NOT CONFIGURED)");
    console.log(`TO: ${adminEmail}`);
    console.log("BODY:");
    console.log(messageText);
    console.log("==========================================");
    return;
  }

  try {
    await mailDetails.transporter.sendMail({
      from: mailDetails.smtpFrom,
      to: adminEmail,
      subject: "Innoversity LMS - Neue Registrierung wartet auf Freischaltung",
      text: messageText,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1.5px solid #eee; border-radius: 12px; background: #fff;">
          <h2 style="font-family: Arial, sans-serif; color: #1e3a8a; margin-top: 0;">Innoversity LMS</h2>
          <p>Hallo Admin,</p>
          <p>ein neuer Benutzer hat sich auf Innoversity registriert und wartet auf Freischaltung:</p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <strong style="display: block; margin-bottom: 4px;">Name:</strong> ${newUser.name}<br/>
            <strong style="display: block; margin-top: 12px; margin-bottom: 4px;">E-Mail:</strong> ${newUser.email}<br/>
            <strong style="display: block; margin-top: 12px; margin-bottom: 4px;">Rolle:</strong> ${newUser.role}
          </div>
          <p>Bitte logge dich im Admin-Bereich unter <a href="https://innoversity.berlin/admin" style="color: #2563eb;">innoversity.berlin/admin</a> ein, um diesen Benutzer freizuschalten.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send SMTP signup notification email:", error);
    console.log("==========================================");
    console.log("SIGNUP NOTIFICATION EMAIL FALLBACK LOG");
    console.log(`TO: ${adminEmail}`);
    console.log(`NEW USER: ${newUser.email} (${newUser.name}, ${newUser.role})`);
    console.log("==========================================");
  }
}

export async function sendAccountApprovedEmail(userEmail: string): Promise<void> {
  const messageText = `Hi,\n\ngute Neuigkeiten! Dein Account bei Innoversity LMS wurde freigeschaltet.\n\nDu kannst dich ab sofort unter https://innoversity.berlin/login mit deinen Zugangsdaten anmelden und mit dem Lernen beginnen!\n\nWir freuen uns auf dich!`;
  const mailDetails = getTransporter();

  if (!mailDetails) {
    console.log("==========================================");
    console.log("ACCOUNT APPROVED EMAIL (SMTP NOT CONFIGURED)");
    console.log(`TO: ${userEmail}`);
    console.log("BODY:");
    console.log(messageText);
    console.log("==========================================");
    return;
  }

  try {
    await mailDetails.transporter.sendMail({
      from: mailDetails.smtpFrom,
      to: userEmail,
      subject: "Innoversity LMS - Dein Account wurde freigeschaltet!",
      text: messageText,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1.5px solid #eee; border-radius: 12px; background: #fff;">
          <h2 style="font-family: Arial, sans-serif; color: #10b981; margin-top: 0;">Innoversity LMS</h2>
          <p>Hi,</p>
          <p>gute Neuigkeiten! Dein Account bei Innoversity LMS wurde freigeschaltet.</p>
          <p>Du kannst dich ab sofort mit deinen Zugangsdaten anmelden und mit dem Lernen beginnen!</p>
          <div style="margin: 24px 0;">
            <a href="https://innoversity.berlin/login" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Jetzt anmelden & starten</a>
          </div>
          <p>Wir freuen uns auf dich!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send SMTP account approved email:", error);
    console.log("==========================================");
    console.log("ACCOUNT APPROVED EMAIL FALLBACK LOG");
    console.log(`TO: ${userEmail}`);
    console.log("==========================================");
  }
}
