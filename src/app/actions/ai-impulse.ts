"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const fallbackAntiMotivationsDe = [
  "Lebenslanges Lernen bedeutet vor allem, dass die PowerPoint-Folien niemals aufhören.",
  "Agilität ist die Kunst, Fehler in kürzeren Sprints zu wiederholen.",
  "Lernziele sind wie Neujahrsvorsätze: Gut gemeint, aber nach zwei Wochen wieder vergessen.",
  "Synergieeffekte spürst du meistens dann, wenn deine Arbeit einfach verdoppelt wird.",
  "In der Theorie gibt es keinen Unterschied zwischen Theorie und Praxis. In der Praxis schon.",
  "Disruptive Innovation: Etwas so lange verändern, bis es überhaupt nicht mehr funktioniert.",
  "Das Beste am Microlearning ist, dass man die Sinnlosigkeit schneller hinter sich hat.",
  "Wir lernen nicht für die Schule, sondern für das nächste unumgängliche Compliance-Zertifikat.",
  "Ein Meeting ist die didaktische Höchststrafe für ein Problem, das man mit einer E-Mail hätte lösen können."
];

const fallbackRemindersDe = [
  "Bisher ist dein Lernpfad unberührt. Keine Angst, die Sprints beißen nicht – sie kosten nur Zeit.",
  "Du hast noch kein Feedback hinterlassen. Reflektierst du noch oder ignorierst du schon?",
  "Fang am besten mit einem kleinen Skill Sprint an. Je kürzer das Thema, desto schneller kannst du es wieder vergessen.",
  "Der erste Schritt ist der schwerste. Danach wird es nicht einfacher, aber du gewöhnst dich dran."
];

export async function getAiImpulseAction(
  reflections: string[],
  lang: string = "de"
): Promise<{ reminder: string; antiMotivation: string }> {
  const isDe = lang === "de";

  // Pick a random fallback immediately to have it ready
  const randomAnti = fallbackAntiMotivationsDe[Math.floor(Math.random() * fallbackAntiMotivationsDe.length)];
  const randomReminder = fallbackRemindersDe[Math.floor(Math.random() * fallbackRemindersDe.length)];

  // Check if API key is configured
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      reminder: reflections.length > 0 
        ? (isDe ? `Du hast zuletzt über deine Lernerfahrungen reflektiert. Bleib dran und vertiefe diese Punkte im nächsten Modul.` : `You recently reflected on your learning. Keep going and deepen these concepts in the next module.`)
        : randomReminder,
      antiMotivation: randomAnti
    };
  }

  try {
    const prompt = `Du bist der humorvolle, leicht zynische KI-Mentor des anti-LMS 'innoversity'. Deine Aufgabe ist es, zwei kurze Impulse für das Dashboard des Lerners im JSON-Format zu generieren.

Eingaben des Lerners (letzte Reflexionen/Gedanken):
${reflections.length > 0 ? reflections.map(r => `- ${r}`).join("\n") : "Keine Reflexionen vorhanden (hat noch nicht mit dem Lernen begonnen)"}

Generiere ein JSON-Objekt mit genau folgenden zwei Feldern (in deutscher Sprache):
1. "reminder": Ein didaktischer Rückblick oder Erinnerungstipp basierend auf seinen Reflexionen (falls vorhanden) bzw. ein frecher Tipp, wie er starten soll (falls keine vorhanden). Max. 2 kurze Sätze.
2. "antiMotivation": Ein humorvoller, leicht zynischer oder sarkastischer Spruch zum Thema Corporate Learning, Agilität, Lebenslanges Lernen, Meetings oder Digitalisierung. Max. 1 prägnanter Satz.

Antworte NUR mit dem reinen JSON-Objekt. Verwende keine Markdown-Codeblocks (\`\`\`json).`;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    let cleanedText = text.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    }

    const data = JSON.parse(cleanedText);
    
    return {
      reminder: data.reminder || randomReminder,
      antiMotivation: data.antiMotivation || randomAnti
    };
  } catch (error) {
    console.error("Failed to generate AI impulse:", error);
    return {
      reminder: reflections.length > 0 
        ? (isDe ? "Erinnerung: Wiederhole die behandelten Agilitäts- und Innovationsthemen." : "Reminder: Review the covered agility and innovation topics.")
        : randomReminder,
      antiMotivation: randomAnti
    };
  }
}
