import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { store } from "@/lib/store";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = token ? await verifySession(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const reflections = await store.getReflections(userId);
    const courses = await store.getCourses();

    // Find completed courses
    const completedCoursesList = [];
    for (const c of courses) {
      if (c.status !== "published" || c.isCustom) continue;
      const progress = await store.getUserProgress(userId, c.id);
      const modules = await store.getModules(c.id);
      let totalBlocks = 0;
      let completedInCourse = 0;
      for (const mod of modules) {
        const blocks = await store.getBlocks(mod.id);
        totalBlocks += blocks.length;
        for (const block of blocks) {
          if (progress.completedBlocks.includes(block.id)) {
            completedInCourse++;
          }
        }
      }
      if (totalBlocks > 0 && completedInCourse === totalBlocks) {
        completedCoursesList.push(c.title);
      }
    }

    const reflectionSummaries = reflections.map(r => `- Reflection Content: "${r.content}"`).join("\n");

    const prompt = `Write a highly personalized, thoughtful, and slightly philosophical (but encouraging and witty, matching the innoversity tone) milestone review for a learner named ${user.name}.
Do NOT use generic praises. Read their completed courses and actual reflections to point out their specific insights and learning style.
Completed Courses: ${completedCoursesList.length > 0 ? completedCoursesList.join(", ") : "Keine bisher vollständig abgeschlossen - motiviere sie zum Start"}
Their Reflections:
${reflectionSummaries || "Noch keine Reflexionen geschrieben."}

Write in German. Keep it around 3-4 sentences. Format as a single paragraph. Make it feel authentic, like a real human mentor who actually read their thoughts.`;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    return NextResponse.json({ milestoneNote: text.trim() });
  } catch (error: any) {
    console.error("AI milestone generation error:", error);
    return NextResponse.json({ 
      milestoneNote: "Deine Lernreise hat begonnen! Jede Reflexion bringt dich einen Schritt näher an deine Ziele. Schreib weiter, um tiefergehende KI-Analysen freizuschalten." 
    });
  }
}
