import { LearningStore, CreateCourseInput, UpdateCourseInput, CreateModuleInput, UpdateModuleInput, CreateBlockInput, UpdateBlockInput } from "./types";
import { Course, Module, LearningBlock, UserProgress, Reflection, User, UserRecord, Role } from "@/types";
import { hashPassword } from "../crypto";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = process.env.DATA_FILE_PATH || path.join(/*turbopackIgnore: true*/ process.cwd(), "data.json");

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

    if (!parsed.settings) {
      parsed.settings = {};
    }

    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = [
        {
          id: "user-1782135645820",
          name: "Andreas Kolar",
          email: "andreas@kolar.biz",
          passwordHash: hashPassword("admin123"),
          role: "admin",
          approved: true,
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
      title: input.title,
      description: input.description,
      targetGroup: input.targetGroup,
      category: input.category,
      imageUrl: input.imageUrl,
      status: "draft",
      type: input.type || "comprehensive",
      sprintCourseIds: input.sprintCourseIds || [],
      createdBy: input.createdBy,
      isCustom: input.isCustom ?? false,
      learnerId: input.learnerId,
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

  async getCourseProgress(courseId: string): Promise<{ userId: string; userName: string; completedBlocks: string[] }[]> {
    const data = await this.readData();
    const courseProgress = data.progress?.filter(p => p.courseId === courseId) || [];
    return courseProgress.map(p => {
      const user = data.users.find(u => u.id === p.userId);
      return {
        userId: p.userId,
        userName: user ? user.name : "Unbekannter Lerner",
        completedBlocks: p.completedBlocks
      };
    });
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

  async getCourseReflections(courseId: string): Promise<(Reflection & { userName: string; blockTitle: string })[]> {
    const data = await this.readData();
    const courseModules = data.modules.filter(m => m.courseId === courseId);
    const moduleIds = courseModules.map(m => m.id);
    const courseBlocks = data.blocks.filter(b => moduleIds.includes(b.moduleId));
    const blockIds = courseBlocks.map(b => b.id);

    const courseReflections = data.reflections?.filter(r => blockIds.includes(r.blockId)) || [];
    
    return courseReflections.map(r => {
      const user = data.users.find(u => u.id === r.learnerId);
      const block = courseBlocks.find(b => b.id === r.blockId);
      return {
        ...r,
        userName: user ? user.name : "Unbekannter Lerner",
        blockTitle: block ? block.title : "Unbekannter Block"
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    const { passwordHash, resetToken, resetTokenExpiry, ...safeUser } = user;
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
      approved: false,
      archived: false,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    await this.writeData(data);
    const { passwordHash, resetToken, resetTokenExpiry, ...safeUser } = newUser;
    return safeUser;
  }

  async getUsers(): Promise<User[]> {
    const data = await this.readData();
    return data.users.map(({ passwordHash, resetToken, resetTokenExpiry, ...safeUser }) => safeUser);
  }

  async setResetToken(email: string, token: string, expiry: Date): Promise<void> {
    const data = await this.readData();
    const userIndex = data.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    data.users[userIndex].resetToken = token;
    data.users[userIndex].resetTokenExpiry = expiry.toISOString();
    await this.writeData(data);
  }

  async getUserByResetToken(token: string): Promise<UserRecord | null> {
    const data = await this.readData();
    const user = data.users.find(u => u.resetToken === token);
    if (!user) return null;
    
    if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) > new Date()) {
      return user;
    }
    return null;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    const data = await this.readData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    data.users[userIndex].passwordHash = passwordHash;
    data.users[userIndex].resetToken = undefined;
    data.users[userIndex].resetTokenExpiry = undefined;
    await this.writeData(data);
  }

  async updateUserApproval(userId: string, approved: boolean): Promise<void> {
    const data = await this.readData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    data.users[userIndex].approved = approved;
    await this.writeData(data);
  }

  async updateUserArchived(userId: string, archived: boolean): Promise<void> {
    const data = await this.readData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    data.users[userIndex].archived = archived;
    await this.writeData(data);
  }

  async deleteUser(userId: string): Promise<void> {
    // Clear user telemetry data first
    await this.clearUserData(userId);

    // Remove user record
    const data = await this.readData();
    data.users = data.users.filter(u => u.id !== userId);
    await this.writeData(data);
  }

  async getSystemSetting(key: string, defaultValue: string): Promise<string> {
    const data = await this.readData();
    const settings = (data as any).settings || {};
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }

  async setSystemSetting(key: string, value: string): Promise<void> {
    const data = await this.readData();
    if (!(data as any).settings) {
      (data as any).settings = {};
    }
    (data as any).settings[key] = value;
    await this.writeData(data);
  }
}
