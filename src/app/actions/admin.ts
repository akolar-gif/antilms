"use server";

import { store } from "@/lib/store";
import { sendAccountApprovedEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function updateAdminEmailSettingAction(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Ungültige E-Mail-Adresse." };
  }

  try {
    await store.setSystemSetting("admin_notification_email", email.trim());
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update admin email setting:", error);
    return { success: false, error: "Fehler beim Speichern der Einstellungen." };
  }
}

export async function toggleUserApprovalAction(
  userId: string,
  approved: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await store.getUser(userId);
    if (!user) {
      return { success: false, error: "Benutzer nicht gefunden." };
    }

    await store.updateUserApproval(userId, approved);

    // If approved, notify the user via email
    if (approved) {
      try {
        await sendAccountApprovedEmail(user.email);
      } catch (emailErr) {
        console.error(`Failed to send account activation email to ${user.email}:`, emailErr);
      }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle user approval status:", error);
    return { success: false, error: "Fehler beim Aktualisieren des Benutzerstatus." };
  }
}
