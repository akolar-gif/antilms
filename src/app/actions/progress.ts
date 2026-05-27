"use server";

import { store } from "@/lib/store";
import { revalidatePath } from "next/cache";

const MOCK_USER_ID = "learner-1";

export async function getCourseProgressAction(courseId: string) {
  return await store.getUserProgress(MOCK_USER_ID, courseId);
}

export async function markBlockCompletedAction(courseId: string, blockId: string, moduleId: string) {
  await store.markBlockCompleted(MOCK_USER_ID, courseId, blockId);
  // Revalidate the module page to reflect the new progress state if needed
  revalidatePath(`/learner/courses/${courseId}/modules/${moduleId}`);
  return { success: true };
}

export async function saveReflectionAction(blockId: string, content: string, confidence: number, difficulty: number) {
  const reflection = await store.saveReflection(MOCK_USER_ID, blockId, content, confidence, difficulty);
  return reflection;
}

export async function clearUserDataAction() {
  await store.clearUserData(MOCK_USER_ID);
  revalidatePath("/learner");
  return { success: true };
}
