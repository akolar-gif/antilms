"use server";

import { MockAIProvider } from "@/lib/ai/mock-provider";
import { RealAIProvider } from "@/lib/ai/real-provider";
import { MentorReplyInput, MentorReplyResult, GenerateBlockInput, CoDesignerResult } from "@/lib/ai/provider";
import { LearningBlock } from "@/types";

import { store } from "@/lib/store";

const aiProvider = new RealAIProvider();

export async function askMentorAction(input: MentorReplyInput): Promise<MentorReplyResult> {
  const courseId = input.courseContext;
  const moduleId = input.moduleContext.split('\n')[0];

  let courseContextStr = courseId;
  let moduleContextStr = input.moduleContext;

  try {
    const course = await store.getCourse(courseId);
    if (course) {
      courseContextStr = `Course: ${course.title}\nDescription: ${course.description || "No description"}`;
    }

    const modules = await store.getModules(courseId);
    const currentModule = modules.find(m => m.id === moduleId);
    
    if (currentModule) {
      const blocks = await store.getBlocks(moduleId);
      const progress = await store.getUserProgress("learner-1", courseId);
      
      let moduleSummary = `Module Title: "${currentModule.title}"\nModule Description: "${currentModule.description}"\n\n`;
      
      if (blocks && blocks.length > 0) {
        moduleSummary += "Module Curriculum & Completion Status:\n";
        blocks.forEach((b, idx) => {
          const isCompleted = progress.completedBlocks.includes(b.id);
          moduleSummary += `- Block ${idx + 1} [${b.type.toUpperCase()}]: "${b.title}" (${isCompleted ? 'Completed' : 'Not Yet Completed'})\n`;
          if (b.type === 'text' && b.content) {
            moduleSummary += `  Excerpt: "${b.content.substring(0, 120)}..."\n`;
          }
        });
      }
      
      // Extract active block details from incoming message
      const activeBlockMatch = input.moduleContext.includes("Current Active Block Context:");
      if (activeBlockMatch) {
        const activeBlockDetails = input.moduleContext.substring(input.moduleContext.indexOf("Current Active Block Context:"));
        moduleContextStr = `${moduleSummary}\n\n${activeBlockDetails}`;
      } else {
        moduleContextStr = moduleSummary;
      }
    }
  } catch (error) {
    console.error("Error enriching mentor context:", error);
  }

  return await aiProvider.mentorReply({
    ...input,
    courseContext: courseContextStr,
    moduleContext: moduleContextStr
  });
}

export async function generateBlockAction(input: GenerateBlockInput): Promise<Partial<LearningBlock>> {
  return await aiProvider.generateStructuredBlock(input);
}

export async function askCoDesignerAction(input: any): Promise<CoDesignerResult> {
  return await aiProvider.coDesignerReply(input);
}

