"use server";

import { cookies } from "next/headers";
import { signSession } from "@/lib/session";
import { store } from "@/lib/store";
import { verifyPassword, hashPassword } from "@/lib/crypto";
import { Role } from "@/types";

export async function loginAction(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; role?: Role; error?: string }> {
  if (!emailInput || !passwordInput) {
    return { success: false, error: "Bitte füllen Sie alle Felder aus." };
  }

  try {
    const user = await store.getUserByEmail(emailInput);
    if (!user) {
      return { success: false, error: "Ungültige E-Mail-Adresse oder Passwort." };
    }

    const isValid = verifyPassword(passwordInput, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Ungültige E-Mail-Adresse oder Passwort." };
    }

    const token = await signSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    const cookieStore = await cookies();
    cookieStore.set("user_session", token, {
      httpOnly: true,
      secure: false, // Set to false to support plain HTTP deployments (e.g. raw IP)
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("Login action error:", error);
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." };
  }
}

export async function registerAction(
  name: string,
  email: string,
  passwordInput: string,
  role: "learner" | "trainer" = "learner"
): Promise<{ success: boolean; role?: Role; error?: string }> {
  if (!name || !email || !passwordInput) {
    return { success: false, error: "Bitte füllen Sie alle Felder aus." };
  }

  try {
    const existingUser = await store.getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: "Diese E-Mail-Adresse wird bereits verwendet." };
    }

    const hashedPassword = hashPassword(passwordInput);
    const newUser = await store.createUser({
      name,
      email,
      passwordHash: hashedPassword,
      role
    });

    // Automatically log in the user after registration
    const token = await signSession({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    const cookieStore = await cookies();
    cookieStore.set("user_session", token, {
      httpOnly: true,
      secure: false, // Set to false to support plain HTTP deployments (e.g. raw IP)
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, role: newUser.role };
  } catch (error: any) {
    console.error("Registration action error:", error);
    return { success: false, error: error.message || "Ein unerwarteter Fehler ist aufgetreten." };
  }
}

import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  redirect("/login");
}
