import { LearningBlock } from "@/types";

export interface GenerateTextInput {
  courseTitle: string;
  moduleTitle: string;
  learningObjective: string;
  targetGroup: string;
  tone: string;
  length: "short" | "medium" | "long";
  language?: string;
}

export interface GenerateTextResult {
  title: string;
  content: string;
  reflectionQuestion: string;
}

export interface GenerateBlockInput {
  type: LearningBlock["type"];
  courseTopic: string;
  moduleObjective: string;
  context?: string; // Existing text or previous block
  prompt?: string; // Custom instructions from the user
  language?: string;
}

export interface MentorReplyInput {
  learnerMessage: string;
  courseContext: string;
  moduleContext: string;
  blockContext?: string;
  learnerConfidence?: number;
  language?: string;
}

export interface MentorReplyResult {
  answer: string;
  question?: string;
  nextStep?: string;
}

export interface CoDesignerInput {
  trainerMessage: string;
  courseTitle: string;
  moduleTitle: string;
  moduleDescription: string;
  existingBlocksInfo: string;
  language?: string;
}

export interface CoDesignerResult {
  reply: string;
  proposedBlock?: {
    type: LearningBlock["type"];
    title: string;
    content: string;
    learningMode: LearningBlock["learningMode"];
  };
}

export interface GenerateCurriculumInput {
  title: string;
  description: string;
  language?: string;
}

export interface GeneratedBlock {
  type: LearningBlock["type"];
  title: string;
  content: string;
  learningMode: LearningBlock["learningMode"];
}

export interface GeneratedModule {
  title: string;
  description: string;
  learningObjectives: string[];
  blocks: GeneratedBlock[];
}

export interface GeneratedCurriculumResult {
  modules: GeneratedModule[];
}

export interface AIProvider {
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
  generateStructuredBlock(input: GenerateBlockInput): Promise<Partial<LearningBlock>>;
  mentorReply(input: MentorReplyInput): Promise<MentorReplyResult>;
  coDesignerReply(input: CoDesignerInput): Promise<CoDesignerResult>;
  generateCurriculum(input: GenerateCurriculumInput): Promise<GeneratedCurriculumResult>;
  generateModule(input: GenerateModuleInput): Promise<GeneratedModule>;
}

export interface GenerateModuleInput {
  courseTitle: string;
  topic: string;
  description: string;
  existingModulesInfo?: string;
  language?: string;
}
