import { store } from "../src/lib/store";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function seed() {
  const jsonPath = path.resolve(process.cwd(), "prototype-course.json");
  const courseData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  console.log(`Seeding prototype course: "${courseData.title}"...`);

  // Create course
  const course = await store.createCourse({
    title: courseData.title,
    description: courseData.description,
    targetGroup: courseData.targetGroup || "General",
    category: courseData.category || "AI",
    imageUrl: courseData.imageUrl,
    type: courseData.type || "comprehensive",
    price: courseData.price !== undefined ? Number(courseData.price) : undefined,
    createdBy: "Trainer",
    status: "published", // Directly publish for pilot
    learningOutcomes: courseData.learningOutcomes || [],
    competencyTags: courseData.competencyTags || [],
    estimatedMinutes: courseData.estimatedMinutes !== undefined ? Number(courseData.estimatedMinutes) : undefined,
    difficulty: courseData.difficulty || undefined,
    prerequisiteCourseIds: courseData.prerequisiteCourseIds || [],
  });

  console.log(`Course created with ID: ${course.id}`);

  const modulesData = courseData.modules || [];
  for (let mIdx = 0; mIdx < modulesData.length; mIdx++) {
    const modData = modulesData[mIdx];
    const mod = await store.createModule({
      courseId: course.id,
      title: modData.title,
      description: modData.description || "",
      learningObjectives: modData.learningObjectives || [],
      competencyTags: modData.competencyTags || [],
      estimatedMinutes: modData.estimatedMinutes !== undefined ? Number(modData.estimatedMinutes) : undefined,
      difficulty: modData.difficulty || undefined,
      prerequisiteModuleIds: modData.prerequisiteModuleIds || [],
      successCriteria: modData.successCriteria || [],
    });

    console.log(`  Module created: "${mod.title}" (ID: ${mod.id})`);

    const blocksData = modData.blocks || [];
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
      if (blockData.type === "quiz" && blockData.settings) {
        contentValue = JSON.stringify({
          question: blockData.settings.question || "",
          options: blockData.settings.options || [],
          correctAnswer: blockData.settings.options[blockData.settings.correctAnswer] || String(blockData.settings.correctAnswer),
          explanation: blockData.settings.explanation || ""
        });
      } else if (blockData.type === "reflection" && blockData.settings) {
        contentValue = JSON.stringify({
          reflectionPrompt: blockData.settings.reflectionPrompt || "",
          followUpQuestions: blockData.settings.followUpQuestions || []
        });
      } else if (blockData.type === "punk_game" && blockData.settings) {
        contentValue = JSON.stringify({
          scenario: blockData.settings.scenario || "",
          task: blockData.settings.task || "",
          timeboxMinutes: blockData.settings.timeboxMinutes || 8,
          evaluationCriteria: blockData.settings.evaluationCriteria || []
        });
      } else if (blockData.type === "project_task" && blockData.settings) {
        contentValue = JSON.stringify({
          title: blockData.settings.title || blockData.title || "",
          scenario: blockData.settings.scenario || "",
          task: blockData.settings.task || "",
          deliverable: blockData.settings.deliverable || "",
          constraints: blockData.settings.constraints || [],
          reflectionPrompt: blockData.settings.reflectionPrompt || ""
        });
      }

      const block = await store.createBlock({
        moduleId: mod.id,
        type: blockData.type || "text",
        title: blockData.title || "Lektion",
        content: contentValue,
        learningMode,
        source: "user_created",
        metadata: blockData.settings || {},
        competencyTags: blockData.competencyTags || [],
        estimatedMinutes: blockData.estimatedMinutes !== undefined ? Number(blockData.estimatedMinutes) : undefined,
        assessmentRole: blockData.assessmentRole || "none",
      });

      console.log(`    Block created: "${block.title}" (ID: ${block.id})`);
    }
  }

  console.log("Seeding completed successfully!");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
