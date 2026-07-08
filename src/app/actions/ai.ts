"use server";

import { MockAIProvider } from "@/lib/ai/mock-provider";
import { RealAIProvider } from "@/lib/ai/real-provider";
import { MentorReplyInput, MentorReplyResult, GenerateBlockInput, CoDesignerResult } from "@/lib/ai/provider";
import { LearningBlock } from "@/types";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { store } from "@/lib/store";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

const aiProvider = new RealAIProvider();

export async function askMentorAction(input: MentorReplyInput): Promise<MentorReplyResult> {
  const cookieStore = await cookies();
  const language = input.language || cookieStore.get("lang")?.value || "de";
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;
  const userId = user?.id || "learner-1";

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
      const progress = await store.getUserProgress(userId, courseId);
      
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
    moduleContext: moduleContextStr,
    language
  });
}

export async function generateBlockAction(input: GenerateBlockInput): Promise<Partial<LearningBlock>> {
  const cookieStore = await cookies();
  const language = input.language || cookieStore.get("lang")?.value || "de";
  return await aiProvider.generateStructuredBlock({ ...input, language });
}

export async function askCoDesignerAction(input: any): Promise<CoDesignerResult> {
  const cookieStore = await cookies();
  const language = input.language || cookieStore.get("lang")?.value || "de";
  return await aiProvider.coDesignerReply({ ...input, language });
}

export async function askWrapUpAction(input: {
  courseId: string;
  moduleId: string;
  messageHistory: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  currentTurn: number;
  totalTurns: number;
}) {
  const cookieStore = await cookies();
  const language = cookieStore.get("lang")?.value || "de";

  const course = await store.getCourse(input.courseId);
  const modules = await store.getModules(input.courseId);
  const module = modules.find(m => m.id === input.moduleId);

  if (!course || !module) {
    throw new Error("Course or Module not found.");
  }

  return await aiProvider.wrapUpReply({
    courseTitle: course.title,
    moduleTitle: module.title,
    moduleObjectives: module.learningObjectives || [],
    messageHistory: input.messageHistory,
    userMessage: input.userMessage,
    currentTurn: input.currentTurn,
    totalTurns: input.totalTurns,
    language
  });
}

export async function testAiConnectionAction(): Promise<{
  configured: boolean;
  preview: string;
  working: boolean;
  errorMessage?: string;
}> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return {
      configured: false,
      preview: "Kein API-Key gesetzt",
      working: false,
      errorMessage: "Die Umgebungsvariable GOOGLE_GENERATIVE_AI_API_KEY ist nicht definiert."
    };
  }

  // Generate preview e.g. "AIzaSy...XXXX"
  const preview = apiKey.length > 8 
    ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}` 
    : "Gültiger Schlüsseltyp";

  try {
    const model = google("gemini-2.5-flash");
    const { text } = await generateText({
      model,
      prompt: "Reply with the word 'OK'.",
    });

    const isOk = text.toUpperCase().includes("OK");
    return {
      configured: true,
      preview,
      working: true
    };
  } catch (error: any) {
    console.error("AI diagnostics failed:", error);
    return {
      configured: true,
      preview,
      working: false,
      errorMessage: error?.message || "Ein unbekannter Fehler ist bei der API-Anfrage aufgetreten."
    };
  }
}


