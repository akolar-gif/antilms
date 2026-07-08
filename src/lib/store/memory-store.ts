import { Course, Module, LearningBlock, Reflection } from "@/types";
import { LearningStore, CreateCourseInput, UpdateCourseInput, CreateModuleInput, UpdateModuleInput, CreateBlockInput, UpdateBlockInput } from "./types";

const mockCourses: Course[] = [
  {
    id: "course-1",
    title: "Critical Thinking and Complex Problem Solving",
    description: "Learn how to frame problems correctly and avoid jumping to conclusions.",
    targetGroup: "Professionals and Agile Coaches",
    status: "published",
    createdBy: "trainer-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockModules: Module[] = [
  {
    id: "module-1",
    courseId: "course-1",
    title: "Understanding the Real Problem",
    description: "Before solving a problem, we must frame it correctly.",
    order: 0,
    learningObjectives: ["Identify the difference between a symptom and a root cause."],
  }
];

const mockBlocks: LearningBlock[] = [
  {
    id: "block-1",
    moduleId: "module-1",
    type: "text",
    title: "Why Problem Framing Matters",
    content: "If you solve the wrong problem perfectly, you still fail. We often jump to solutions before understanding the root cause.",
    order: 0,
    learningMode: "understand",
    source: "trainer",
  }
];

export class MemoryStore implements LearningStore {
  private courses: Course[] = [...mockCourses];
  private modules: Module[] = [...mockModules];
  private blocks: LearningBlock[] = [...mockBlocks];

  async getCourses(): Promise<Course[]> {
    return this.courses;
  }

  async getCourse(id: string): Promise<Course | null> {
    return this.courses.find(c => c.id === id) || null;
  }

  async createCourse(input: CreateCourseInput): Promise<Course> {
    const course: Course = {
      id: `course-${Date.now()}`,
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
    this.courses.push(course);
    return course;
  }

  async updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Course not found");
    
    this.courses[index] = {
      ...this.courses[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return this.courses[index];
  }

  async getModules(courseId: string): Promise<Module[]> {
    return this.modules.filter(m => m.courseId === courseId).sort((a, b) => a.order - b.order);
  }

  async createModule(input: CreateModuleInput): Promise<Module> {
    const modules = await this.getModules(input.courseId);
    const order = modules.length;
    
    const module: Module = {
      id: `module-${Date.now()}`,
      ...input,
      order,
    };
    this.modules.push(module);
    return module;
  }

  async updateModule(id: string, input: UpdateModuleInput): Promise<Module> {
    const index = this.modules.findIndex(m => m.id === id);
    if (index === -1) throw new Error("Module not found");
    
    this.modules[index] = {
      ...this.modules[index],
      ...input,
    };
    return this.modules[index];
  }

  async getBlocks(moduleId: string): Promise<LearningBlock[]> {
    return this.blocks.filter(b => b.moduleId === moduleId).sort((a, b) => a.order - b.order);
  }

  async createBlock(input: CreateBlockInput): Promise<LearningBlock> {
    const blocks = await this.getBlocks(input.moduleId);
    const order = blocks.length;
    
    const block: LearningBlock = {
      id: `block-${Date.now()}`,
      ...input,
      order,
    };
    this.blocks.push(block);
    return block;
  }

  async updateBlock(id: string, input: UpdateBlockInput): Promise<LearningBlock> {
    const index = this.blocks.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Block not found");
    
    this.blocks[index] = {
      ...this.blocks[index],
      ...input,
    };
    return this.blocks[index];
  }

  async deleteBlock(id: string): Promise<void> {
    const index = this.blocks.findIndex(b => b.id === id);
    if (index !== -1) {
      this.blocks.splice(index, 1);
    }
  }

  async deleteCourse(id: string): Promise<void> {
    const courseModules = this.modules.filter(m => m.courseId === id);
    const moduleIds = courseModules.map(m => m.id);

    this.blocks = this.blocks.filter(b => !moduleIds.includes(b.moduleId));
    this.modules = this.modules.filter(m => m.courseId !== id);
    this.courses = this.courses.filter(c => c.id !== id);
  }

  async deleteModule(id: string): Promise<void> {
    this.blocks = this.blocks.filter(b => b.moduleId !== id);
    this.modules = this.modules.filter(m => m.id !== id);
  }

  async reorderBlocks(moduleId: string, orderedBlockIds: string[]): Promise<void> {
    this.blocks = this.blocks.map(block => {
      if (block.moduleId === moduleId) {
        const index = orderedBlockIds.indexOf(block.id);
        if (index !== -1) {
          return { ...block, order: index };
        }
      }
      return block;
    });
  }

  async getUserProgress(userId: string, courseId: string): Promise<{ completedBlocks: string[] }> {
    return { completedBlocks: [] };
  }

  async markBlockCompleted(userId: string, courseId: string, blockId: string): Promise<void> {
    // Memory store doesn't persist progress
  }

  async getReflections(userId: string): Promise<Reflection[]> {
    return [];
  }

  async saveReflection(userId: string, blockId: string, content: string, confidence: number, difficulty: number): Promise<Reflection> {
    return {
      id: "mock-ref",
      learnerId: userId,
      blockId,
      content,
      confidence,
      difficulty,
      createdAt: new Date().toISOString()
    };
  }

  async clearUserData(userId: string): Promise<void> {
    // Stub
  }
}
