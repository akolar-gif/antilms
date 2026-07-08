"use server";

import { store } from "@/lib/store";
import { revalidatePath } from "next/cache";

import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

async function getUserIdFromSession(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getCourseProgressAction(courseId: string) {
  const userId = await getUserIdFromSession();
  return await store.getUserProgress(userId, courseId);
}

export async function markBlockCompletedAction(courseId: string, blockId: string, moduleId: string) {
  const userId = await getUserIdFromSession();
  await store.markBlockCompleted(userId, courseId, blockId);
  revalidatePath(`/learner/courses/${courseId}/modules/${moduleId}`);
  return { success: true };
}

export async function saveReflectionAction(blockId: string, content: string, confidence: number, difficulty: number) {
  const userId = await getUserIdFromSession();
  const reflection = await store.saveReflection(userId, blockId, content, confidence, difficulty);
  return reflection;
}

export async function clearUserDataAction() {
  const userId = await getUserIdFromSession();
  await store.clearUserData(userId);
  revalidatePath("/learner");
  return { success: true };
}
