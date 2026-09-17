"use server";

import { store } from "@/lib/store";
import { redirect } from "next/navigation";
import { uploadImageAction } from "./upload";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";
import { generateAndSaveAIImage } from "@/lib/ai/image-generator";

export async function createCourseAction(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryInput = formData.get("category") as string;
  const courseImage = formData.get("courseImage") as File | null;
  const stockImageUrl = formData.get("stockImageUrl") as string;
  const type = (formData.get("type") as any) || "comprehensive";
  const sprintCourseIdsRaw = formData.get("sprintCourseIds") as string;
  const sprintCourseIds = sprintCourseIdsRaw ? JSON.parse(sprintCourseIdsRaw) : [];
  
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

  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;
  const createdBy = user ? user.id : "Trainer";

  // Create course
  const course = await store.createCourse({
    title,
    description,
    targetGroup: "General",
    category,
    imageUrl: finalImageUrl,
    type,
    sprintCourseIds,
    createdBy,
  });

  // Create a default first module (only for non-tracks)
  if (type !== "track") {
    await store.createModule({
      courseId: course.id,
      title: "Introduction",
      description: "Welcome to the course. This is your first module.",
      learningObjectives: ["Understand the basics of the course"],
    });
  }

  // Redirect to the course studio
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/trainer");
  revalidatePath(`/trainer/courses/${course.id}`);
  redirect(`/trainer/courses/${course.id}`);
}

export async function publishCourseAction(courseId: string) {
  await store.updateCourse(courseId, { status: "pending_review" });
  
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/trainer");
  revalidatePath(`/trainer/courses/${courseId}`);
  redirect(`/trainer/courses/${courseId}`);
}

export async function updateCourseSettingsAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryInput = formData.get("category") as string;
  const courseImage = formData.get("courseImage") as File | null;
  const stockImageUrl = formData.get("stockImageUrl") as string;
  const priceRaw = formData.get("price") as string;
  const type = formData.get("type") as string;

  const learningOutcomesRaw = formData.get("learningOutcomes") as string;
  const competencyTagsRaw = formData.get("competencyTags") as string;
  const estimatedMinutesRaw = formData.get("estimatedMinutes") as string;
  const difficulty = formData.get("difficulty") as string;
  const prerequisiteCourseIdsRaw = formData.get("prerequisiteCourseIds") as string;
  
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

  const price = priceRaw && priceRaw.trim() !== "" ? parseFloat(priceRaw.trim().replace(",", ".")) : null;

  const updates: any = { 
    title, 
    description, 
    category,
    price: price !== null && !isNaN(price) ? price : null,
    type: type === "sprint" ? "sprint" : "comprehensive"
  };
  if (finalImageUrl) {
    updates.imageUrl = finalImageUrl;
  }

  if (learningOutcomesRaw !== null) {
    updates.learningOutcomes = learningOutcomesRaw ? learningOutcomesRaw.split(",").map(x => x.trim()).filter(Boolean) : [];
  }
  if (competencyTagsRaw !== null) {
    updates.competencyTags = competencyTagsRaw ? competencyTagsRaw.split(",").map(x => x.trim()).filter(Boolean) : [];
  }
  if (estimatedMinutesRaw !== null) {
    updates.estimatedMinutes = estimatedMinutesRaw.trim() !== "" ? Number(estimatedMinutesRaw) : null;
  }
  if (difficulty !== null) {
    updates.difficulty = difficulty || null;
  }
  if (prerequisiteCourseIdsRaw !== null) {
    updates.prerequisiteCourseIds = prerequisiteCourseIdsRaw ? JSON.parse(prerequisiteCourseIdsRaw) : [];
  }
  const curriculumSyllabusRaw = formData.get("curriculumSyllabus") as string;
  if (curriculumSyllabusRaw !== null) {
    updates.curriculumSyllabus = curriculumSyllabusRaw;
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

const aiProvider = new RealAIProvider();

export async function generateCurriculumAction(
  title: string, 
  description: string, 
  curriculumSyllabus?: string
): Promise<{ success: boolean; data?: GeneratedCurriculumResult; error?: string }> {
  try {
    if (!title || !description) {
      return { success: false, error: "Title and description are required." };
    }
    const cookieStore = await cookies();
    const language = cookieStore.get("lang")?.value || "de";
    const data = await aiProvider.generateCurriculum({ title, description, language, curriculumSyllabus });
    return { success: true, data };
  } catch (err: any) {
    console.error("generateCurriculumAction error:", err);
    return { 
      success: false, 
      error: err?.message || "Fehler bei der KI-Generierung. Bitte überprüfen Sie den Gemini API-Key in der .env auf dem Server." 
    };
  }
}

export async function saveCurriculumAction(
  courseData: { title: string; category?: string; description: string; imageUrl?: string; curriculumSyllabus?: string },
  curriculum: GeneratedCurriculumResult
) {
  // Create Course with curriculumSyllabus
  const course = await store.createCourse({
    title: courseData.title,
    description: courseData.description,
    category: courseData.category || "Uncategorized",
    targetGroup: "General",
    imageUrl: courseData.imageUrl,
    createdBy: "Trainer",
    curriculumSyllabus: courseData.curriculumSyllabus,
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
      let blockContent = block.content;

      // Process and permanently generate AI images for text blocks
      if (block.type === "text") {
        const imgMatch = blockContent.match(/!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
          const caption = imgMatch[1] || block.title;
          const staticUrl = await generateAndSaveAIImage(caption);
          blockContent = blockContent.replace(/!\[(.*?)\]\((.*?)\)/, `![${caption}](${staticUrl})`);
        } else {
          const staticUrl = await generateAndSaveAIImage(block.title);
          blockContent += `\n\n![${block.title}](${staticUrl})`;
        }
      }

      await store.createBlock({
        moduleId: createdModule.id,
        type: block.type,
        title: block.title,
        content: blockContent,
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

export async function regenerateBlockImageAction(
  courseId: string,
  moduleId: string,
  blockId: string,
  customPrompt?: string
): Promise<{ success: boolean; newImageUrl?: string; error?: string }> {
  try {
    const blocks = await store.getBlocks(moduleId);
    const block = blocks.find((b) => b.id === blockId);
    if (!block) {
      return { success: false, error: "Block not found" };
    }

    const prompt = customPrompt?.trim() || block.title;
    const staticUrl = await generateAndSaveAIImage(prompt, "ai-img-regen");

    let newContent = block.content;
    const imgMatch = newContent.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const caption = customPrompt?.trim() || imgMatch[1] || block.title;
      newContent = newContent.replace(/!\[(.*?)\]\((.*?)\)/, `![${caption}](${staticUrl})`);
    } else {
      newContent += `\n\n![${prompt}](${staticUrl})`;
    }

    await store.updateBlock(blockId, { content: newContent });

    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/trainer/courses/${courseId}`);
    revalidatePath(`/trainer/courses/${courseId}/modules/${moduleId}`);
    revalidatePath(`/learner/courses/${courseId}/modules/${moduleId}`);

    return { success: true, newImageUrl: staticUrl };
  } catch (err: any) {
    console.error("regenerateBlockImageAction error:", err);
    return { success: false, error: err?.message || "Fehler beim Generieren des Bildes." };
  }
}

export async function regenerateCurriculumFromSyllabusAction(
  courseId: string,
  curriculumSyllabus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const course = await store.getCourse(courseId);
    if (!course) {
      return { success: false, error: "Course not found" };
    }

    const cookieStore = await cookies();
    const language = cookieStore.get("lang")?.value || "de";

    // 1. Generate new curriculum structure with AI
    const curriculum = await aiProvider.generateCurriculum({
      title: course.title,
      description: course.description,
      language,
      curriculumSyllabus
    });

    // 2. Delete existing modules
    const existingModules = await store.getModules(courseId);
    for (const mod of existingModules) {
      await store.deleteModule(mod.id);
    }

    // 3. Update course's syllabus outline
    await store.updateCourse(courseId, { curriculumSyllabus });

    // 4. Create new modules and blocks with permanent images
    for (const mod of curriculum.modules) {
      const createdModule = await store.createModule({
        courseId,
        title: mod.title,
        description: mod.description,
        learningObjectives: mod.learningObjectives,
      });

      for (const block of mod.blocks) {
        let blockContent = block.content;
        if (block.type === "text") {
          const imgMatch = blockContent.match(/!\[(.*?)\]\((.*?)\)/);
          const caption = imgMatch ? imgMatch[1] : block.title;
          const staticUrl = await generateAndSaveAIImage(caption);
          if (imgMatch) {
            blockContent = blockContent.replace(/!\[(.*?)\]\((.*?)\)/, `![${caption}](${staticUrl})`);
          } else {
            blockContent += `\n\n![${caption}](${staticUrl})`;
          }
        }

        await store.createBlock({
          moduleId: createdModule.id,
          type: block.type,
          title: block.title,
          content: blockContent,
          learningMode: block.learningMode,
          source: "ai_assisted",
        });
      }
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/trainer");
    revalidatePath(`/trainer/courses/${courseId}`);
    revalidatePath(`/learner/courses/${courseId}`);

    return { success: true };
  } catch (err: any) {
    console.error("regenerateCurriculumFromSyllabusAction error:", err);
    return { success: false, error: err?.message || "Fehler beim Regenerieren des Kurses." };
  }
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

export async function moderateCourseAction(
  courseId: string,
  status: any
): Promise<{ success: boolean; error?: string }> {
  try {
    await store.updateCourse(courseId, { status });
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin");
    revalidatePath("/trainer");
    revalidatePath("/learner/library");
    revalidatePath(`/trainer/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to moderate course:", error);
    return { success: false, error: "Fehler beim Aktualisieren des Kursstatus." };
  }
}

export async function deleteCourseAction(
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await store.deleteCourse(courseId);
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin");
    revalidatePath("/trainer");
    revalidatePath("/learner/library");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete course:", error);
    return { success: false, error: "Fehler beim Löschen des Kurses." };
  }
}

export async function optimizeTrackOrderAction(
  sprintCourseIds: string[]
): Promise<{ success: boolean; orderedIds?: string[]; error?: string }> {
  try {
    const sprints = [];
    for (const id of sprintCourseIds) {
      const course = await store.getCourse(id);
      if (course) {
        sprints.push({ id: course.id, title: course.title, description: course.description || "" });
      }
    }

    if (sprints.length <= 1) {
      return { success: true, orderedIds: sprintCourseIds };
    }

    const prompt = `Du bist ein erfahrener Lehrplan-Designer. Ein Lerner möchte folgende Skill Sprints (Kurz-Kurse) zu einer logischen Lernkette (Skill Track) verbinden. 
Bringe die Sprints in eine didaktisch sinnvolle Reihenfolge (z.B. Grundlagen zuerst, dann fortgeschrittene Techniken/Tools).

Hier sind die Sprints:
${sprints.map((s, idx) => `${idx + 1}. ID: "${s.id}", Titel: "${s.title}", Beschreibung: "${s.description}"`).join("\n")}

Antworte ausschließlich mit einem JSON-Array, das die IDs in der empfohlenen Reihenfolge enthält, z.B.:
["course-123", "course-456"]

Gib keinerlei Text drumherum aus, auch keine Markdown-Codeblocks (\`\`\`json).`;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    let cleanedText = text.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    }

    const orderedIds = JSON.parse(cleanedText) as string[];
    if (Array.isArray(orderedIds) && orderedIds.length === sprintCourseIds.length && orderedIds.every(id => sprintCourseIds.includes(id))) {
      return { success: true, orderedIds };
    }

    return { success: true, orderedIds: sprintCourseIds };
  } catch (error) {
    console.error("Failed to optimize track order:", error);
    return { success: false, error: "KI-Optimierung fehlgeschlagen.", orderedIds: sprintCourseIds };
  }
}

export async function createCustomTrackAction(
  title: string,
  sprintCourseIds: string[]
): Promise<{ success: boolean; courseId?: string; error?: string }> {
  try {
    if (!title || sprintCourseIds.length === 0) {
      return { success: false, error: "Titel und Sprints sind erforderlich." };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = token ? await verifySession(token) : null;
    if (!user) {
      return { success: false, error: "Nicht angemeldet." };
    }

    const created = await store.createCourse({
      title,
      description: "Individuell zusammengestellter Skill Track aus verschiedenen Sprints.",
      targetGroup: "Eigener Lernpfad",
      category: "Personalisiert",
      createdBy: user.id,
      type: "track",
      sprintCourseIds,
      isCustom: true,
      learnerId: user.id
    });

    await store.updateCourse(created.id, { status: "published" });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/learner");
    revalidatePath("/learner/library");

    return { success: true, courseId: created.id };
  } catch (error) {
    console.error("Failed to create custom track:", error);
    return { success: false, error: "Fehler beim Erstellen des Skill Tracks." };
  }
}

export async function importCourseAction(data: any): Promise<{ success: boolean; courseId?: string; error?: string }> {
  try {
    if (!data || typeof data !== "object") {
      return { success: false, error: "Ungültige Kursdaten." };
    }

    const { title, description } = data;
    if (!title || !description) {
      return { success: false, error: "Titel und Beschreibung sind erforderlich." };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = token ? await verifySession(token) : null;
    if (!user) {
      return { success: false, error: "Nicht angemeldet." };
    }

    // Create course
    const course = await store.createCourse({
      title,
      description,
      targetGroup: data.targetGroup || "General",
      category: data.category || "Importiert",
      imageUrl: data.imageUrl || undefined,
      type: data.type === "track" ? "track" : (data.type === "sprint" ? "sprint" : "comprehensive"),
      price: data.price !== undefined ? Number(data.price) : undefined,
      createdBy: user.id,
      status: "draft",
      learningOutcomes: data.learningOutcomes || [],
      competencyTags: data.competencyTags || [],
      estimatedMinutes: data.estimatedMinutes !== undefined ? Number(data.estimatedMinutes) : undefined,
      difficulty: data.difficulty || undefined,
      prerequisiteCourseIds: data.prerequisiteCourseIds || [],
    });

    // Create modules and blocks
    const modulesData = Array.isArray(data.modules) ? data.modules : [];
    for (let mIdx = 0; mIdx < modulesData.length; mIdx++) {
      const modData = modulesData[mIdx];
      const moduleTitle = modData.title || `Modul ${mIdx + 1}`;
      
      const mod = await store.createModule({
        courseId: course.id,
        title: moduleTitle,
        description: modData.description || "",
        learningObjectives: modData.learningObjectives || [],
        competencyTags: modData.competencyTags || [],
        estimatedMinutes: modData.estimatedMinutes !== undefined ? Number(modData.estimatedMinutes) : undefined,
        difficulty: modData.difficulty || undefined,
        prerequisiteModuleIds: modData.prerequisiteModuleIds || [],
        successCriteria: modData.successCriteria || [],
      });

      const blocksData = Array.isArray(modData.blocks) ? modData.blocks : [];
      for (let bIdx = 0; bIdx < blocksData.length; bIdx++) {
        const blockData = blocksData[bIdx];
        
        let learningMode = blockData.learningMode || "understand";
        if (!blockData.learningMode) {
          if (blockData.type === "quiz") {
            learningMode = "practice";
          } else if (blockData.type === "reflection") {
            learningMode = "reflect";
          } else if (blockData.type === "ai_chat") {
            learningMode = "co-design";
          }
        }

        let contentValue = blockData.content || "";
        
        if (blockData.type === "quiz") {
          let correctAnswerText = "";
          if (blockData.settings?.correctAnswer !== undefined) {
            const idx = Number(blockData.settings.correctAnswer);
            if (Array.isArray(blockData.settings.options) && idx >= 0 && idx < blockData.settings.options.length) {
              correctAnswerText = blockData.settings.options[idx];
            } else {
              correctAnswerText = String(blockData.settings.correctAnswer);
            }
          }
          contentValue = JSON.stringify({
            question: blockData.settings?.question || blockData.content || "",
            options: blockData.settings?.options || [],
            correctAnswer: correctAnswerText,
            explanation: blockData.settings?.explanation || ""
          });
        } else if (blockData.type === "reflection") {
          contentValue = JSON.stringify({
            reflectionPrompt: blockData.content || "",
            followUpQuestions: blockData.settings?.followUpQuestions || []
          });
        } else if (blockData.type === "punk_game") {
          contentValue = JSON.stringify({
            scenario: blockData.settings?.scenario || blockData.content || "",
            task: blockData.settings?.task || "",
            timeboxMinutes: blockData.settings?.timeboxMinutes || 8,
            evaluationCriteria: blockData.settings?.evaluationCriteria || []
          });
        } else if (blockData.type === "project_task") {
          contentValue = JSON.stringify({
            title: blockData.title || "",
            scenario: blockData.settings?.scenario || blockData.content || "",
            task: blockData.settings?.task || "",
            deliverable: blockData.settings?.deliverable || "",
            constraints: blockData.settings?.constraints || [],
            reflectionPrompt: blockData.settings?.reflectionPrompt || ""
          });
        }

        await store.createBlock({
          moduleId: mod.id,
          type: blockData.type || "text",
          title: blockData.title || "Lerneinheit",
          content: contentValue,
          learningMode,
          source: "user_created",
          metadata: blockData.settings || {},
          competencyTags: blockData.competencyTags || [],
          estimatedMinutes: blockData.estimatedMinutes !== undefined ? Number(blockData.estimatedMinutes) : undefined,
          assessmentRole: blockData.assessmentRole || "none",
        });
      }
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/trainer");

    return { success: true, courseId: course.id };
  } catch (error) {
    console.error("Failed to import course:", error);
    return { success: false, error: "Fehler beim Importieren des Kurses." };
  }
}
