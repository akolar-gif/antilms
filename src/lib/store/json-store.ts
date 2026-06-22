import { LearningStore, CreateCourseInput, UpdateCourseInput, CreateModuleInput, UpdateModuleInput, CreateBlockInput, UpdateBlockInput } from "./types";
import { Course, Module, LearningBlock, UserProgress, Reflection, User, UserRecord, Role } from "@/types";
import { hashPassword } from "../crypto";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

type Database = {
  courses: Course[];
  modules: Module[];
  blocks: LearningBlock[];
  progress?: UserProgress[];
  reflections?: Reflection[];
  users?: UserRecord[];
};

export class JsonStore implements LearningStore {
  private async readData(): Promise<Database & { users: UserRecord[] }> {
    let parsed: any;
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      parsed = JSON.parse(data);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        parsed = { courses: [], modules: [], blocks: [], users: [] };
      } else {
        throw e;
      }
    }

    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = [
        {
          id: "user-admin",
          name: "Innoversity Admin",
          email: "admin@innoversity.com",
          passwordHash: hashPassword("admin123"),
          role: "admin",
          createdAt: new Date().toISOString()
        },
        {
          id: "user-trainer",
          name: "Innoversity Trainer",
          email: "trainer@innoversity.com",
          passwordHash: hashPassword("trainer123"),
          role: "trainer",
          createdAt: new Date().toISOString()
        },
        {
          id: "user-learner",
          name: "Innoversity Learner",
          email: "learner@innoversity.com",
          passwordHash: hashPassword("learner123"),
          role: "learner",
          createdAt: new Date().toISOString()
        }
      ];
      await fs.writeFile(DATA_FILE, JSON.stringify(parsed, null, 2));
    }

    return parsed;
  }

  private async writeData(data: Database): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  async getCourses(): Promise<Course[]> {
    const data = await this.readData();
    return data.courses;
  }

  async getCourse(id: string): Promise<Course | null> {
    const data = await this.readData();
    return data.courses.find(c => c.id === id) || null;
  }

  async createCourse(input: CreateCourseInput): Promise<Course> {
    const data = await this.readData();
    const newCourse: Course = {
      id: "course-" + Date.now(),
      ...input,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.courses.push(newCourse);
    await this.writeData(data);
    return newCourse;
  }

  async updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
    const data = await this.readData();
    const courseIndex = data.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) throw new Error("Course not found");
    
    const updatedCourse = {
      ...data.courses[courseIndex],
      ...input,
      updatedAt: new Date().toISOString()
    };
    data.courses[courseIndex] = updatedCourse;
    await this.writeData(data);
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    const data = await this.readData();
    const courseModules = data.modules.filter(m => m.courseId === id);
    const moduleIds = courseModules.map(m => m.id);

    data.blocks = data.blocks.filter(b => !moduleIds.includes(b.moduleId));
    data.modules = data.modules.filter(m => m.courseId !== id);

    if (data.progress) {
      data.progress = data.progress.filter(p => p.courseId !== id);
    }

    data.courses = data.courses.filter(c => c.id !== id);
    await this.writeData(data);
  }

  async getModules(courseId: string): Promise<Module[]> {
    const data = await this.readData();
    return data.modules
      .filter(m => m.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async createModule(input: CreateModuleInput): Promise<Module> {
    const data = await this.readData();
    const courseModules = data.modules.filter(m => m.courseId === input.courseId);
    
    const newModule: Module = {
      id: "module-" + Date.now(),
      ...input,
      order: courseModules.length,
    };
    data.modules.push(newModule);
    await this.writeData(data);
    return newModule;
  }

  async updateModule(id: string, input: UpdateModuleInput): Promise<Module> {
    const data = await this.readData();
    const moduleIndex = data.modules.findIndex(m => m.id === id);
    if (moduleIndex === -1) throw new Error("Module not found");
    
    data.modules[moduleIndex] = { ...data.modules[moduleIndex], ...input };
    await this.writeData(data);
    return data.modules[moduleIndex];
  }

  async deleteModule(id: string): Promise<void> {
    const data = await this.readData();
    data.blocks = data.blocks.filter(b => b.moduleId !== id);
    data.modules = data.modules.filter(m => m.id !== id);
    await this.writeData(data);
  }

  async getBlocks(moduleId: string): Promise<LearningBlock[]> {
    const data = await this.readData();
    return data.blocks
      .filter(b => b.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }

  async createBlock(input: CreateBlockInput): Promise<LearningBlock> {
    const data = await this.readData();
    const moduleBlocks = data.blocks.filter(b => b.moduleId === input.moduleId);
    
    const newBlock: LearningBlock = {
      id: "block-" + Date.now() + Math.floor(Math.random() * 1000),
      ...input,
      order: moduleBlocks.length,
    };
    data.blocks.push(newBlock);
    await this.writeData(data);
    return newBlock;
  }

  async updateBlock(id: string, input: UpdateBlockInput): Promise<LearningBlock> {
    const data = await this.readData();
    const blockIndex = data.blocks.findIndex(b => b.id === id);
    if (blockIndex === -1) throw new Error("Block not found");
    
    const updatedBlock = {
      ...data.blocks[blockIndex],
      ...input
    };
    data.blocks[blockIndex] = updatedBlock;
    await this.writeData(data);
    return updatedBlock;
  }

  async deleteBlock(id: string): Promise<void> {
    const data = await this.readData();
    data.blocks = data.blocks.filter(b => b.id !== id);
    await this.writeData(data);
  }

  async reorderBlocks(moduleId: string, orderedBlockIds: string[]): Promise<void> {
    const data = await this.readData();
    data.blocks = data.blocks.map(block => {
      if (block.moduleId === moduleId) {
        const index = orderedBlockIds.indexOf(block.id);
        if (index !== -1) {
          return { ...block, order: index };
        }
      }
      return block;
    });
    await this.writeData(data);
  }

  async getUserProgress(userId: string, courseId: string): Promise<{ completedBlocks: string[] }> {
    const data = await this.readData();
    const progress = data.progress?.find(p => p.userId === userId && p.courseId === courseId);
    return progress ? { completedBlocks: progress.completedBlocks } : { completedBlocks: [] };
  }

  async markBlockCompleted(userId: string, courseId: string, blockId: string): Promise<void> {
    const data = await this.readData();
    if (!data.progress) {
      data.progress = [];
    }

    const progressIndex = data.progress.findIndex(p => p.userId === userId && p.courseId === courseId);
    
    if (progressIndex === -1) {
      data.progress.push({
        userId,
        courseId,
        completedBlocks: [blockId]
      });
    } else {
      const currentProgress = data.progress[progressIndex];
      if (!currentProgress.completedBlocks.includes(blockId)) {
        currentProgress.completedBlocks.push(blockId);
      }
    }
    
    await this.writeData(data);
  }

  async getReflections(userId: string): Promise<Reflection[]> {
    const data = await this.readData();
    return data.reflections?.filter(r => r.learnerId === userId) || [];
  }

  async saveReflection(userId: string, blockId: string, content: string, confidence: number, difficulty: number): Promise<Reflection> {
    const data = await this.readData();
    if (!data.reflections) {
      data.reflections = [];
    }

    const newReflection: Reflection = {
      id: "reflection-" + Date.now(),
      learnerId: userId,
      blockId,
      content,
      confidence,
      difficulty,
      createdAt: new Date().toISOString()
    };

    // Remove existing reflection for the same block if exists
    data.reflections = data.reflections.filter(r => !(r.learnerId === userId && r.blockId === blockId));
    data.reflections.push(newReflection);
    await this.writeData(data);
    return newReflection;
  }

  async clearUserData(userId: string): Promise<void> {
    const data = await this.readData();
    
    // Clear progress
    if (data.progress) {
      data.progress = data.progress.filter(p => p.userId !== userId);
    }
    
    // Clear reflections
    if (data.reflections) {
      data.reflections = data.reflections.filter(r => r.learnerId !== userId);
    }

    await this.writeData(data);
  }

  async getUser(id: string): Promise<User | null> {
    const data = await this.readData();
    const user = data.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const data = await this.readData();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async createUser(input: { name: string; email: string; passwordHash: string; role: Role }): Promise<User> {
    const data = await this.readData();
    if (data.users.some(u => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("Email already registered");
    }
    const newUser: UserRecord = {
      id: "user-" + Date.now(),
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    await this.writeData(data);
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  async getUsers(): Promise<User[]> {
    const data = await this.readData();
    return data.users.map(({ passwordHash, ...safeUser }) => safeUser);
  }
}
