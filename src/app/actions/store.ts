"use server";

import { store } from "@/lib/store";
import { CreateBlockInput, UpdateBlockInput } from "@/lib/store/types";
import { revalidatePath } from "next/cache";

export async function createBlockAction(courseId: string, input: CreateBlockInput) {
  const block = await store.createBlock(input);
  revalidatePath(`/trainer/courses/${courseId}/modules/${input.moduleId}`);
  revalidatePath(`/learner/courses/${courseId}/modules/${input.moduleId}`);
  return block;
}

export async function updateBlockAction(courseId: string, moduleId: string, id: string, input: UpdateBlockInput) {
  const block = await store.updateBlock(id, input);
  revalidatePath(`/trainer/courses/${courseId}/modules/${moduleId}`);
  revalidatePath(`/learner/courses/${courseId}/modules/${moduleId}`);
  return block;
}

export async function reorderBlocksAction(moduleId: string, orderedBlockIds: string[], courseId: string) {
  await store.reorderBlocks(moduleId, orderedBlockIds);
  revalidatePath(`/trainer/courses/${courseId}/modules/${moduleId}`);
  revalidatePath(`/learner/courses/${courseId}/modules/${moduleId}`);
}

export async function deleteBlockAction(courseId: string, moduleId: string, blockId: string) {
  await store.deleteBlock(blockId);
  revalidatePath(`/trainer/courses/${courseId}/modules/${moduleId}`);
  revalidatePath(`/learner/courses/${courseId}/modules/${moduleId}`);
}
