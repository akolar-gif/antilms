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

export async function toggleUserArchivedAction(
  userId: string,
  archived: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await store.getUser(userId);
    if (!user) {
      return { success: false, error: "Benutzer nicht gefunden." };
    }

    await store.updateUserArchived(userId, archived);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle user archived status:", error);
    return { success: false, error: "Fehler beim Aktualisieren des Archivierungsstatus." };
  }
}

export async function deleteUserAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await store.getUser(userId);
    if (!user) {
      return { success: false, error: "Benutzer nicht gefunden." };
    }

    await store.deleteUser(userId);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "Fehler beim Löschen des Benutzers." };
  }
}

export async function updateSystemSettingsAction(
  email: string,
  testRegistrationEnabled: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Ungültige E-Mail-Adresse." };
  }

  try {
    await store.setSystemSetting("admin_notification_email", email.trim());
    await store.setSystemSetting("test_user_registration_enabled", testRegistrationEnabled ? "true" : "false");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update system settings:", error);
    return { success: false, error: "Fehler beim Speichern der Einstellungen." };
  }
}

export async function getSystemSettingsAction(): Promise<{ adminEmail: string; testRegistrationEnabled: boolean }> {
  try {
    const adminEmail = await store.getSystemSetting("admin_notification_email", "andreas@kolar.biz");
    const testRegistrationEnabled = await store.getSystemSetting("test_user_registration_enabled", "true");
    return {
      adminEmail,
      testRegistrationEnabled: testRegistrationEnabled === "true"
    };
  } catch (err) {
    return {
      adminEmail: "andreas@kolar.biz",
      testRegistrationEnabled: true
    };
  }
}

export async function bookCourseAction(
  userId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await store.bookCourse(userId, courseId);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to book course:", error);
    return { success: false, error: "Fehler beim Buchen des Kurses." };
  }
}

export async function revokeCourseBookingAction(
  userId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await store.revokeCourseBooking(userId, courseId);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to revoke course booking:", error);
    return { success: false, error: "Fehler beim Stornieren der Kursbuchung." };
  }
}

export async function getUserBookingsAction(
  userId: string
): Promise<{ success: boolean; bookings?: string[]; error?: string }> {
  try {
    const bookings = await store.getUserBookings(userId);
    return { success: true, bookings };
  } catch (error: any) {
    console.error("Failed to get user bookings:", error);
    return { success: false, error: "Fehler beim Abrufen der Kursbuchungen." };
  }
}
