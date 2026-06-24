"use server";

import { store } from "@/lib/store";
import { hashPassword } from "@/lib/crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { headers } from "next/headers";

export async function requestResetAction(email: string): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  try {
    const user = await store.getUserByEmail(email);
    if (!user) {
      // Security practice: Don't reveal if user exists, say email was sent if account exists
      return { success: true, message: "Falls diese E-Mail-Adresse registriert ist, wurde ein Link zum Zurücksetzen gesendet." };
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    // Token valid for 1 hour
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    await store.setResetToken(email, token, expiry);

    // Get current host from request headers to construct absolute URL
    const headersList = await headers();
    const host = headersList.get("host") || "innoversity.berlin";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const resetUrl = `${protocol}://${host}/reset-password?token=${token}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return { success: true, message: "Falls diese E-Mail-Adresse registriert ist, wurde ein Link zum Zurücksetzen gesendet." };
  } catch (error: any) {
    console.error("Error in requestResetAction:", error);
    return { success: false, message: "Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal." };
  }
}

export async function resetPasswordAction(token: string, passwordInput: string): Promise<{ success: boolean; message: string }> {
  if (!token) {
    return { success: false, message: "Ungültiger oder abgelaufener Token." };
  }

  if (!passwordInput || passwordInput.length < 6) {
    return { success: false, message: "Das Passwort muss mindestens 6 Zeichen lang sein." };
  }

  try {
    const user = await store.getUserByResetToken(token);
    if (!user) {
      return { success: false, message: "Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen." };
    }

    // Hash new password
    const passwordHash = hashPassword(passwordInput);

    // Update password in database
    await store.updateUserPassword(user.id, passwordHash);

    return { success: true, message: "Passwort erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden." };
  } catch (error: any) {
    console.error("Error in resetPasswordAction:", error);
    return { success: false, message: "Ein Fehler ist aufgetreten beim Zurücksetzen des Passworts." };
  }
}
