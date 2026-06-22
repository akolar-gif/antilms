import { Course, Module, LearningBlock, Reflection, User, UserRecord, Role } from "@/types";

export interface CreateCourseInput {
  title: string;
  description: string;
  targetGroup: string;
  category?: string;
  imageUrl?: string;
  createdBy: string;
}

export type UpdateCourseInput = Partial<CreateCourseInput> & {
  status?: Course["status"];
};

export interface CreateModuleInput {
  courseId: string;
  title: string;
  description: string;
  learningObjectives: string[];
}

export type UpdateModuleInput = Partial<Omit<CreateModuleInput, "courseId">>;

export interface CreateBlockInput {
  moduleId: string;
  type: LearningBlock["type"];
  title: string;
  content: string;
  learningMode?: LearningBlock["learningMode"];
  source: LearningBlock["source"];
  metadata?: Record<string, any>;
}

export type UpdateBlockInput = Partial<Omit<CreateBlockInput, "moduleId" | "type">>;

export interface LearningStore {
  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | null>;
  createCourse(input: CreateCourseInput): Promise<Course>;
  updateCourse(id: string, input: UpdateCourseInput): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
  // Module methods
  getModules(courseId: string): Promise<Module[]>;
  createModule(input: CreateModuleInput): Promise<Module>;
  updateModule(id: string, input: UpdateModuleInput): Promise<Module>;
  deleteModule(id: string): Promise<void>;
  
  // Block methods
  getBlocks(moduleId: string): Promise<LearningBlock[]>;
  createBlock(input: CreateBlockInput): Promise<LearningBlock>;
  updateBlock(id: string, input: UpdateBlockInput): Promise<LearningBlock>;
  deleteBlock(id: string): Promise<void>;
  reorderBlocks(moduleId: string, orderedBlockIds: string[]): Promise<void>;

  // Progress methods
  getUserProgress(userId: string, courseId: string): Promise<{ completedBlocks: string[] }>;
  markBlockCompleted(userId: string, courseId: string, blockId: string): Promise<void>;

  // Reflection methods
  getReflections(userId: string): Promise<Reflection[]>;
  saveReflection(userId: string, blockId: string, content: string, confidence: number, difficulty: number): Promise<Reflection>;
  
  // User methods
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<UserRecord | null>;
  createUser(input: { name: string; email: string; passwordHash: string; role: Role }): Promise<User>;
  getUsers(): Promise<User[]>;

  // Data administration (GDPR)
  clearUserData(userId: string): Promise<void>;
}
