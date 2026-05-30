"use server";

import { store } from "@/lib/store";
import { redirect } from "next/navigation";
import { uploadImageAction } from "./upload";

export async function createCourseAction(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryInput = formData.get("category") as string;
  const courseImage = formData.get("courseImage") as File | null;
  const stockImageUrl = formData.get("stockImageUrl") as string;
  
  const category = categoryInput?.trim() || "Uncategorized";

  if (!title || !description) {
    throw new Error("Title and description are required.");
  }

  let finalImageUrl: string | undefined = undefined;

  // 1. Process uploaded file if present
  if (courseImage && courseImage.size > 0) {
    const uploadFormData = new FormData();
    uploadFormData.append("file", courseImage);
    finalImageUrl = await uploadImageAction(uploadFormData);
  } else if (stockImageUrl) {
    // 2. Use stock image if selected
    finalImageUrl = stockImageUrl;
  }


  // Create course
  const course = await store.createCourse({
    title,
    description,
    targetGroup: "General",
    category,
    imageUrl: finalImageUrl,
    createdBy: "Trainer",
  });

  // Create a default first module
  await store.createModule({
    courseId: course.id,
    title: "Introduction",
    description: "Welcome to the course. This is your first module.",
    learningObjectives: ["Understand the basics of the course"],
  });

  // Redirect to the course studio
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/trainer");
  revalidatePath(`/trainer/courses/${course.id}`);
  redirect(`/trainer/courses/${course.id}`);
}

export async function publishCourseAction(courseId: string) {
  await store.updateCourse(courseId, { status: "published" });
  redirect(`/trainer/courses/${courseId}`);
}

export async function updateCourseSettingsAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryInput = formData.get("category") as string;
  const courseImage = formData.get("courseImage") as File | null;
  const stockImageUrl = formData.get("stockImageUrl") as string;
  
  if (!courseId || !title || !description) {
    throw new Error("Missing required fields.");
  }

  const category = categoryInput?.trim() || "Uncategorized";
  let finalImageUrl: string | undefined = undefined;

  if (courseImage && courseImage.size > 0) {
    const uploadFormData = new FormData();
    uploadFormData.append("file", courseImage);
    finalImageUrl = await uploadImageAction(uploadFormData);
  } else if (stockImageUrl) {
    finalImageUrl = stockImageUrl;
  }

  const updates: any = { title, description, category };
  if (finalImageUrl) {
    updates.imageUrl = finalImageUrl;
  }

  await store.updateCourse(courseId, updates);
  
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/trainer");
  revalidatePath(`/trainer/courses/${courseId}`);
  // Not redirecting to avoid leaving the settings page. Let the client handle toast.
}

export async function addModuleAction(courseId: string) {
  const modules = await store.getModules(courseId);
  
  const newModule = await store.createModule({
    courseId,
    title: `New Module ${modules.length + 1}`,
    description: "Description for the new module",
    learningObjectives: ["New Objective"],
  });

  redirect(`/trainer/courses/${courseId}/modules/${newModule.id}`);
}

export async function updateModuleAction(courseId: string, moduleId: string, input: { title?: string, description?: string }) {
  await store.updateModule(moduleId, input);
  
  // Revalidate paths to show the updated title in the sidebar and module editor
  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/trainer/courses/${courseId}`);
  revalidatePath(`/trainer/courses/${courseId}/modules/${moduleId}`);
}

import { RealAIProvider } from "@/lib/ai/real-provider";
import { GeneratedCurriculumResult } from "@/lib/ai/provider";
import { cookies } from "next/headers";

const aiProvider = new RealAIProvider();

export async function generateCurriculumAction(title: string, description: string): Promise<GeneratedCurriculumResult> {
  if (!title || !description) {
    throw new Error("Title and description are required.");
  }
  const cookieStore = await cookies();
  const language = cookieStore.get("lang")?.value || "de";
  return await aiProvider.generateCurriculum({ title, description, language });
}

export async function saveCurriculumAction(
  courseData: { title: string; category?: string; description: string; imageUrl?: string },
  curriculum: GeneratedCurriculumResult
) {
  // Create Course
  const course = await store.createCourse({
    title: courseData.title,
    description: courseData.description,
    category: courseData.category || "Uncategorized",
    targetGroup: "General",
    imageUrl: courseData.imageUrl,
    createdBy: "Trainer",
  });

  // Create Modules and Blocks
  for (const mod of curriculum.modules) {
    const createdModule = await store.createModule({
      courseId: course.id,
      title: mod.title,
      description: mod.description,
      learningObjectives: mod.learningObjectives,
    });

    for (const block of mod.blocks) {
      await store.createBlock({
        moduleId: createdModule.id,
        type: block.type,
        title: block.title,
        content: block.content,
        learningMode: block.learningMode,
        source: "ai_assisted",
      });
    }
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/trainer");
  revalidatePath(`/trainer/courses/${course.id}`);

  return { courseId: course.id };
}

export async function deleteCourseAction(courseId: string) {
  await store.deleteCourse(courseId);
  
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/trainer");
  revalidatePath("/learner");
  redirect("/trainer");
}

export async function deleteModuleAction(courseId: string, moduleId: string) {
  await store.deleteModule(moduleId);
  
  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/trainer/courses/${courseId}`);
  revalidatePath(`/learner/courses/${courseId}`);
  
  const modules = await store.getModules(courseId);
  if (modules.length > 0) {
    redirect(`/trainer/courses/${courseId}/modules/${modules[0].id}`);
  } else {
    redirect(`/trainer/courses/${courseId}`);
  }
}

export async function generateModuleAction(courseId: string, topic: string, description: string) {
  const course = await store.getCourse(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  const existingModules = await store.getModules(courseId);
  const existingModulesInfo = existingModules.map((m, idx) => 
    `- Module ${idx + 1}: "${m.title}" (Description: ${m.description || "none"})`
  ).join("\n");

  const cookieStore = await cookies();
  const language = cookieStore.get("lang")?.value || "de";

  const generated = await aiProvider.generateModule({
    courseTitle: course.title,
    topic,
    description,
    existingModulesInfo,
    language
  });

  // Create module
  const newModule = await store.createModule({
    courseId,
    title: generated.title,
    description: generated.description,
    learningObjectives: generated.learningObjectives
  });

  // Create blocks inside module
  for (const block of generated.blocks) {
    await store.createBlock({
      moduleId: newModule.id,
      type: block.type,
      title: block.title,
      content: block.content,
      learningMode: block.learningMode,
      source: "ai_assisted"
    });
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/trainer/courses/${courseId}`);
  
  return { moduleId: newModule.id };
}
