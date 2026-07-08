export type Role = "trainer" | "learner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  approved: boolean;
  archived: boolean;
  createdAt: string;
}

export interface UserRecord extends User {
  passwordHash: string;
  resetToken?: string;
  resetTokenExpiry?: string;
}

export type CourseStatus = "draft" | "published" | "archived";

export interface Course {
  id: string;
  title: string;
  description: string;
  targetGroup: string;
  category?: string;
  imageUrl?: string;
  status: CourseStatus;
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  learningObjectives: string[];
}

export type BlockType = "text" | "quiz" | "reflection" | "ai_chat" | "project_task" | "media" | "video" | "code" | "punk_game" | "audio";
export type LearningMode = "understand" | "practice" | "reflect" | "apply" | "create" | "discuss" | "test" | "transfer" | "challenge";
export type BlockSource = "trainer" | "ai_assisted" | "imported";

export interface LearningBlock {
  id: string;
  moduleId: string;
  type: BlockType;
  title: string;
  content: string; // Could be JSON for complex blocks, HTML/MD for text
  order: number;
  learningMode?: LearningMode;
  source: BlockSource;
  metadata?: Record<string, any>;
}

export interface QuizQuestion {
  id: string;
  blockId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Reflection {
  id: string;
  learnerId: string;
  blockId: string;
  content: string;
  confidence: number;
  difficulty: number;
  createdAt: string;
}

export interface MentorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface MentorConversation {
  id: string;
  learnerId: string;
  courseId: string;
  moduleId: string;
  messages: MentorMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningSignal {
  id: string;
  learnerId: string;
  courseId: string;
  moduleId: string;
  type: string;
  value: any;
  explanation: string;
  createdAt: string;
}

export interface Competence {
  id: string;
  name: string;
  description: string;
}

export interface CompetenceSignal {
  id: string;
  learnerId: string;
  competenceId: string;
  source: string;
  level: number;
  evidence: string;
  createdAt: string;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  completedBlocks: string[];
}
