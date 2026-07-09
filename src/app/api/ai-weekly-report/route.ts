import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { store } from "@/lib/store";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

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

    // Compile completed courses & active courses
    const completedCoursesList = [];
    const activeCoursesList = [];
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
      if (totalBlocks > 0) {
        if (completedInCourse === totalBlocks) {
          completedCoursesList.push(c.title);
        } else if (completedInCourse > 0) {
          activeCoursesList.push(`${c.title} (${Math.round((completedInCourse / totalBlocks) * 100)}% abgeschlossen)`);
        }
      }
    }

    const reflectionsText = reflections.map(r => r.content).join("\n- ");

    const prompt = `Write a comprehensive, highly personalized, and structured learning report for ${user.name} for the past week.
Our target audience consists of business professionals, managers, creators, and general staff seeking Future Skills. They are NOT software developers or programmers. 
Avoid technical coding, Git, Docker, or DevOps jargon. Focus on real-world business, product design, agility (Scrum/Kanban), team collaboration, and change management scenarios.

Analyze their learning data:
Completed Courses: ${completedCoursesList.length > 0 ? completedCoursesList.join(", ") : "Keine diese Woche abgeschlossen"}
Active Courses: ${activeCoursesList.length > 0 ? activeCoursesList.join(", ") : "Keine aktiven Kurse"}
Their Reflections:
- ${reflectionsText || "Noch keine Reflexionen geschrieben."}

Use the innoversity tone: highly professional, encouraging, witty, direct, and slightly ironical/philosophical.
Generate a structured JSON response matching the schema. All fields must be in German.`;

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        summary: z.string().describe("General pedagogical summary of the learning week (2-3 sentences)."),
        cognitiveDepth: z.string().describe("Critique of their reflection depth and cognitive engagement (2-3 sentences). Be honest but constructive."),
        competencyFocus: z.string().describe("Description of which Future Skill categories they focused on and why it matters for their career (2-3 sentences)."),
        transferChallenge: z.string().describe("A highly concrete, actionable real-world business/collaboration task or challenge to perform next week in their workplace (2-3 sentences)."),
        closingQuote: z.string().describe("A witty, slightly sarcastic, or inspiring closing quote (1 sentence)."),
      }),
      prompt,
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("AI weekly report generation error:", error);
    return NextResponse.json({ 
      summary: "Deine Lernwoche war produktiv! Du hast dich mit Zukunftsthemen auseinandergesetzt und wichtige Schritte nach vorne gemacht.",
      cognitiveDepth: "Deine Reflexionen zeigen ein gutes Grundverständnis. Versuche in Zukunft, noch stärker konkrete Praxissituationen einzubeziehen, um den Lerneffekt zu maximieren.",
      competencyFocus: "Dein Fokus lag diese Woche auf Agilität und Zukunftsfähigkeiten. Diese Fähigkeiten helfen dir direkt dabei, Veränderungen im Team produktiv mitzugestalten.",
      transferChallenge: "Versuche in der kommenden Woche, ein wichtiges Thema in deinem Team visuell aufzubereiten (z. B. auf einem einfachen Board) und hole gezielt Feedback von zwei Kollegen ein.",
      closingQuote: "Agilität bedeutet nicht, schneller zu laufen, sondern früher zu bemerken, dass man in die falsche Richtung rennt."
    });
  }
}
