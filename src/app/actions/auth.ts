"use server";

import { cookies } from "next/headers";
import { signSession } from "@/lib/session";

export async function loginAction(
  role: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  // Validate credentials
  let isValid = false;
  if (role === "admin") {
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    isValid = passwordInput === adminPassword;
  } else if (role === "trainer") {
    const trainerPassword = process.env.TRAINER_PASSWORD || "trainer123";
    isValid = passwordInput === trainerPassword;
  } else if (role === "learner") {
    isValid = true; // Learners don't require password
  } else {
    return { success: false, error: "Ungültige Rolle ausgewählt." };
  }

  if (!isValid) {
    return { success: false, error: "Ungültiges Passwort für diese Rolle." };
  }

  const token = await signSession(role);
  const cookieStore = await cookies();
  
  cookieStore.set("user_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true };
}

import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  redirect("/login");
}
