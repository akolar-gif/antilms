import { AIProvider, GenerateTextInput, GenerateTextResult, GenerateBlockInput, MentorReplyInput, MentorReplyResult, CoDesignerInput, CoDesignerResult, GenerateCurriculumInput, GeneratedCurriculumResult, GenerateModuleInput, GeneratedModule } from "./provider";
import { LearningBlock } from "@/types";
import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { PROMPT_TEMPLATES } from "./prompts";

function getLanguageInstruction(language?: string): string {
  const lang = language?.toLowerCase();
  if (lang === "en") {
    return "\n\nCRITICAL REQUIREMENT: You MUST generate all text, titles, descriptions, objectives, content, questions, scenarios, and replies in ENGLISH (EN).";
  }
  // Default to German since the app is originally in German
  return "\n\nCRITICAL REQUIREMENT: Sie MÜSSEN alle Texte, Titel, Beschreibungen, Lernziele, Inhalte, Fragen, Szenarien und Antworten auf DEUTSCH (DE) generieren.";
}

export class RealAIProvider implements AIProvider {
  // We use gemini-2.5-flash as the default fast and capable model
  private model = google("gemini-2.5-flash");

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const prompt = PROMPT_TEMPLATES.generateText
      .replace("{{courseTitle}}", input.courseTitle)
      .replace("{{moduleTitle}}", input.moduleTitle)
      .replace("{{learningObjective}}", input.learningObjective)
      .replace("{{targetGroup}}", input.targetGroup)
      .replace("{{tone}}", input.tone)
      .replace("{{length}}", input.length)
      + getLanguageInstruction(input.language);

    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        title: z.string(),
        content: z.string(),
        reflectionQuestion: z.string(),
      }),
      prompt,
    });

    return object;
  }

  async generateStructuredBlock(input: GenerateBlockInput): Promise<Partial<LearningBlock>> {
    const langInst = getLanguageInstruction(input.language);
    const customPromptStr = (input.prompt ? `\n\nUSER CUSTOM INSTRUCTIONS: ${input.prompt}\nCRITICAL: You MUST follow these custom instructions above all else.` : "") + langInst;

    if (input.type === "quiz") {
      const prompt = PROMPT_TEMPLATES.generateQuiz
        .replace("{{concept}}", input.courseTopic)
        .replace("{{difficulty}}", "medium")
        .replace("{{targetGroup}}", "professionals") + customPromptStr;

      const { object } = await generateObject({
        model: this.model,
        schema: z.object({
          question: z.string(),
          options: z.array(z.string()).min(2),
          correctAnswer: z.string(),
          explanation: z.string(),
        }),
        prompt,
      });

      return {
        type: "quiz",
        title: "Knowledge Check",
        content: JSON.stringify(object),
        learningMode: "test",
        source: "ai_assisted"
      };
    }
    
    if (input.type === "punk_game") {
      const prompt = PROMPT_TEMPLATES.generatePunkGame
        .replace("{{concept}}", input.courseTopic)
        .replace("{{targetGroup}}", "professionals") + customPromptStr;

      const { object } = await generateObject({
        model: this.model,
        schema: z.object({
          scenario: z.string(),
          task: z.string(),
          timeboxMinutes: z.number().min(1).max(30),
          evaluationCriteria: z.array(z.string()).min(1),
        }),
        prompt,
      });

      return {
        type: "punk_game",
        title: "Practical Challenge",
        content: JSON.stringify(object),
        learningMode: "challenge",
        source: "ai_assisted"
      };
    }

    if (input.type === "project_task") {
      const prompt = PROMPT_TEMPLATES.generateProjectTask
        .replace("{{concept}}", input.courseTopic)
        .replace("{{objective}}", input.moduleObjective) + customPromptStr;

      const { object } = await generateObject({
        model: this.model,
        schema: z.object({
          title: z.string(),
          scenario: z.string(),
          task: z.string(),
          deliverable: z.string(),
          constraints: z.array(z.string()).min(1),
          reflectionPrompt: z.string(),
        }),
        prompt,
      });

      return {
        type: "project_task",
        title: object.title || "Project Assignment",
        content: JSON.stringify(object),
        learningMode: "apply",
        source: "ai_assisted"
      };
    }

    if (input.type === "reflection") {
      const prompt = PROMPT_TEMPLATES.generateReflection
        .replace("{{moduleTopic}}", input.courseTopic)
        .replace("{{futureSkillFocus}}", input.moduleObjective) + customPromptStr;

      const { object } = await generateObject({
        model: this.model,
        schema: z.object({
          reflectionPrompt: z.string(),
          followUpQuestions: z.array(z.string()).optional(),
        }),
        prompt,
      });

      return {
        type: "reflection",
        title: "Pause and Reflect",
        content: JSON.stringify(object),
        learningMode: "reflect",
        source: "ai_assisted"
      };
    }

    if (input.type === "video") {
      const prompt = `Suggest a relevant YouTube embed URL for a course about "${input.courseTopic}", focusing on "${input.moduleObjective}". If you don't know an exact URL, provide a plausible placeholder like https://www.youtube.com/embed/dQw4w9WgXcQ. ${customPromptStr}`;
      const { object } = await generateObject({
        model: this.model,
        schema: z.object({
          title: z.string(),
          embedUrl: z.string().url().describe("A valid YouTube embed URL"),
        }),
        prompt,
      });
      return { type: "video", title: object.title, content: object.embedUrl, learningMode: "understand", source: "ai_assisted" };
    }

    if (input.type === "code") {
      const prompt = `Generate a relevant code snippet for a course about "${input.courseTopic}", focusing on "${input.moduleObjective}". ${customPromptStr}`;
      const { object } = await generateObject({
        model: this.model,
        schema: z.object({
          title: z.string(),
          code: z.string().describe("The raw code snippet. Do NOT wrap in markdown backticks, just the code itself."),
        }),
        prompt,
      });
      return { type: "code", title: object.title, content: object.code, learningMode: "apply", source: "ai_assisted" };
    }

    // Default Text Block
    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        title: z.string(),
        content: z.string(),
      }),
      prompt: `Generate a learning block for a course about "${input.courseTopic}". The module objective is "${input.moduleObjective}". Context: ${input.context || "none"}. ${customPromptStr}`,
    });

    return {
      type: "text",
      title: object.title,
      content: object.content,
      learningMode: "understand",
      source: "ai_assisted"
    };
  }

  async mentorReply(input: MentorReplyInput): Promise<MentorReplyResult> {
    const prompt = PROMPT_TEMPLATES.mentorReply
      .replace("{{courseContext}}", input.courseContext)
      .replace("{{moduleContext}}", input.moduleContext)
      .replace("{{blockContext}}", input.blockContext || "General")
      .replace("{{learnerMessage}}", input.learnerMessage)
      .replace("{{learnerConfidence}}", (input.learnerConfidence || 50).toString())
      + getLanguageInstruction(input.language);

    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        answer: z.string(),
        question: z.string().optional(),
        nextStep: z.string().optional(),
      }),
      prompt,
    });

    return object;
  }

  async coDesignerReply(input: CoDesignerInput): Promise<CoDesignerResult> {
    const prompt = `You are an expert Instructional Designer and AI Co-Designer assisting a trainer in building a Learning Management System (LMS) module.
Your goal is to help brainstorm, structure, rewrite, or ideate learning blocks.

Current Context:
Course Title: ${input.courseTitle}
Module Title: ${input.moduleTitle}
Module Description: ${input.moduleDescription}
Existing Blocks:
${input.existingBlocksInfo}

Trainer Message:
${input.trainerMessage}

If the trainer asks for suggestions or to create a block, provide an actionable idea and propose a block. If the trainer is just asking a question, provide a helpful reply and omit the proposedBlock.
Format your reply in Markdown.` + getLanguageInstruction(input.language);

    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        reply: z.string().describe("Your conversational reply in Markdown."),
        proposedBlock: z.object({
          type: z.enum(["text", "video", "quiz", "code", "reflection", "punk_game"]),
          title: z.string().describe("A concise title for the block"),
          content: z.string().describe("The actual content of the block. For quizzes/reflection/punk_game, this should be a JSON string representation. For video, just the embed URL. For text/code, the raw string."),
          learningMode: z.enum(["understand", "apply", "test", "reflect", "challenge"])
        }).optional().describe("Provide this ONLY if suggesting a specific new block to add.")
      }),
      prompt,
    });

    return object as CoDesignerResult;
  }

  async generateCurriculum(input: GenerateCurriculumInput): Promise<GeneratedCurriculumResult> {
    const prompt = PROMPT_TEMPLATES.generateCurriculum
      .replace("{{title}}", input.title)
      .replace("{{description}}", input.description)
      + getLanguageInstruction(input.language);

    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        modules: z.array(z.object({
          title: z.string(),
          description: z.string(),
          learningObjectives: z.array(z.string()).min(1),
          blocks: z.array(z.object({
            type: z.enum(["text", "quiz", "reflection", "punk_game", "project_task", "video", "code"]),
            title: z.string(),
            content: z.string(),
            learningMode: z.enum(["understand", "practice", "reflect", "apply", "create", "discuss", "test", "transfer", "challenge"])
          })).min(1)
        })).min(1).max(5)
      }),
      prompt,
    });

    return object;
  }

  async generateModule(input: GenerateModuleInput): Promise<GeneratedModule> {
    const existingInstructions = input.existingModulesInfo
      ? `CRITICAL REQUIREMENT:\nThe course already contains the following modules:\n${input.existingModulesInfo}\n\nYou MUST NOT repeat any topics, learning objectives, or content of these existing modules. Focus entirely on new, complementary concepts that build upon them logically.`
      : "";

    const prompt = PROMPT_TEMPLATES.generateModule
      .replace("{{courseTitle}}", input.courseTitle)
      .replace("{{topic}}", input.topic)
      .replace("{{description}}", input.description)
      .replace("{{existingModulesInstructions}}", existingInstructions)
      + getLanguageInstruction(input.language);

    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        title: z.string(),
        description: z.string(),
        learningObjectives: z.array(z.string()).min(1),
        blocks: z.array(z.object({
          type: z.enum(["text", "quiz", "reflection", "punk_game", "project_task", "video", "code"]),
          title: z.string(),
          content: z.string(),
          learningMode: z.enum(["understand", "practice", "reflect", "apply", "create", "discuss", "test", "transfer", "challenge"])
        })).min(1)
      }),
      prompt,
    });

    return object;
  }
}
