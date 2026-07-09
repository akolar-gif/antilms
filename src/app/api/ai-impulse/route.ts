import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { store } from "@/lib/store";
import { getAiImpulseAction } from "@/app/actions/ai-impulse";

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
    const lang = (cookieStore.get("lang")?.value || "de") as "de" | "en";
    
    // Fetch user reflections
    const reflections = await store.getReflections(userId);
    const reflectionTexts = reflections.map(r => r.content);

    // Call the action asynchronously
    const aiImpulse = await getAiImpulseAction(reflectionTexts, lang);

    return NextResponse.json(aiImpulse);
  } catch (error: any) {
    console.error("AI impulse api error:", error);
    return NextResponse.json({ 
      reminder: "Konzentriere dich auf deine aktuellen Lernschwerpunkte.",
      quote: "Lernen ist wie Rudern gegen den Strom: Sobald man aufhört, treibt man zurück."
    });
  }
}
