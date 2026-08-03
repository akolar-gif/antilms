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

// Submission and Revision Actions for Project Tasks
import { RealAIProvider } from "@/lib/ai/real-provider";

export async function getSubmissionAction(blockId: string) {
  const userId = await getUserIdFromSession();
  return await store.getSubmission(userId, blockId);
}

export async function submitProjectTaskAction(courseId: string, moduleId: string, blockId: string, solution: string, reflection: string) {
  const userId = await getUserIdFromSession();
  
  // 1. Save submission
  const submission = await store.saveSubmission(userId, blockId, solution, reflection);

  // 2. Fetch the block to see success criteria and if AI coach is enabled
  const blocks = await store.getBlocks(moduleId);
  const block = blocks.find(b => b.id === blockId);

  // 3. Mark the block completed in progress
  await store.markBlockCompleted(userId, courseId, blockId);

  if (block) {
    let taskData: any = {};
    try {
      taskData = JSON.parse(block.content);
    } catch (e) {
      taskData = { title: block.title, scenario: "", task: block.content };
    }

    const isAiCoachEnabled = block.metadata?.allowAiCoach ?? block.metadata?.aiCoach ?? true; 
    const successCriteria = block.metadata?.successCriteria || taskData.successCriteria || block.metadata?.successCriteria || [];

    if (isAiCoachEnabled && successCriteria.length > 0) {
      try {
        const aiProvider = new RealAIProvider();
        const review = await aiProvider.reviewSubmission({
          solution,
          reflection,
          taskTitle: taskData.title || block.title,
          taskScenario: taskData.scenario || "",
          taskInstructions: taskData.task || "",
          successCriteria,
        });

        // 4. Update feedback list for the latest version
        const feedbackObj = {
          id: "ai-" + Date.now(),
          source: "ai" as const,
          evaluatorId: "ai",
          text: review.feedback,
          createdAt: new Date().toISOString()
        };

        const updatedSubmission = await store.updateSubmissionFeedback(submission.id, [feedbackObj]);

        // Evaluate mastery status if block is a mastery block
        if (block.assessmentRole === "mastery") {
          const isDemonstrated = review.feedback.toLowerCase().includes("erfolgreich") || 
                              review.feedback.toLowerCase().includes("demonstrated") ||
                              review.feedback.toLowerCase().includes("sehr gut") ||
                              review.feedback.toLowerCase().includes("kriterien erfüllt");
          const status = isDemonstrated ? "demonstrated" as const : "developing" as const;
          await store.updateMasteryStatus(submission.id, status);
        }

        revalidatePath(`/learner/courses/${courseId}/modules/${moduleId}`);
        return { success: true, submission: updatedSubmission };
      } catch (error) {
        console.error("AI review generation failed:", error);
      }
    }
  }

  revalidatePath(`/learner/courses/${courseId}/modules/${moduleId}`);
  return { success: true, submission };
}

export async function submitRevisionAction(courseId: string, moduleId: string, submissionId: string, solution: string, reflection: string) {
  // 1. Save revision (appends new version)
  const submission = await store.saveSubmissionRevision(submissionId, solution, reflection);

  // 2. Re-trigger AI review if we want, or just save it
  const block = await store.getBlocks(moduleId).then(blocks => blocks.find(b => b.id === submission.blockId));
  if (block) {
    let taskData: any = {};
    try {
      taskData = JSON.parse(block.content);
    } catch (e) {
      taskData = { title: block.title, scenario: "", task: block.content };
    }

    const isAiCoachEnabled = block.metadata?.allowAiCoach ?? block.metadata?.aiCoach ?? true; 
    const successCriteria = block.metadata?.successCriteria || taskData.successCriteria || block.metadata?.successCriteria || [];

    if (isAiCoachEnabled && successCriteria.length > 0) {
      try {
        const aiProvider = new RealAIProvider();
        const review = await aiProvider.reviewSubmission({
          solution,
          reflection,
          taskTitle: `[ÜBERARBEITUNG] ${taskData.title || block.title}`,
          taskScenario: taskData.scenario || "",
          taskInstructions: taskData.task || "",
          successCriteria,
        });

        // Update feedback list for this version
        const feedbackObj = {
          id: "ai-" + Date.now(),
          source: "ai" as const,
          evaluatorId: "ai",
          text: review.feedback,
          createdAt: new Date().toISOString()
        };

        const updatedSubmission = await store.updateSubmissionFeedback(submissionId, [feedbackObj]);

        if (block.assessmentRole === "mastery") {
          const isDemonstrated = review.feedback.toLowerCase().includes("erfolgreich") || 
                              review.feedback.toLowerCase().includes("demonstrated") ||
                              review.feedback.toLowerCase().includes("sehr gut") ||
                              review.feedback.toLowerCase().includes("kriterien erfüllt");
          const status = isDemonstrated ? "demonstrated" as const : "developing" as const;
          await store.updateMasteryStatus(submissionId, status);
        }

        revalidatePath(`/learner/courses/${courseId}/modules/${moduleId}`);
        return { success: true, submission: updatedSubmission };
      } catch (error) {
        console.error("AI revision review failed:", error);
      }
    }
  }

  revalidatePath(`/learner/courses/${courseId}/modules/${moduleId}`);
  return { success: true, submission };
}

export async function updateMasteryStatusAction(submissionId: string, status: "not_assessed" | "developing" | "demonstrated") {
  const submission = await store.updateMasteryStatus(submissionId, status);
  return { success: true, submission };
}
