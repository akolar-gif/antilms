"use server";

import { store } from "@/lib/store";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function getFrictionAnalysisAction(courseId: string): Promise<{ success: boolean; content: string }> {
  try {
    const reflections = await store.getCourseReflections(courseId);
    
    if (!reflections || reflections.length === 0) {
      return { 
        success: true, 
        content: "### Keine Analysedaten vorhanden\n\nEs liegen noch keine Reflexionen von Lernenden für diesen Kurs vor. Sobald Lernende die Blöcke abschließen und ihre Reflexionen abgeben, wertet die KI hier die Reibungspunkte (Friction Points) aus." 
      };
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        content: "### KI-Fehler: API-Schlüssel fehlt\n\nBitte füge `GOOGLE_GENERATIVE_AI_API_KEY` zu deiner `.env`-Datei hinzu, um die KI-Friction-Points-Analyse zu aktivieren."
      };
    }

    // Prepare reflections data for Gemini
    const reflectionsSummary = reflections.map((r, i) => {
      return `Reflexion #${i+1}:
- Thema/Block: "${r.blockTitle}"
- Lerner: ${r.userName}
- Gemeldete Schwierigkeit: ${r.difficulty}/5 (1=sehr einfach, 5=sehr schwer)
- Gemeldete Zuversicht/Konfidenz: ${r.confidence}/5 (1=sehr unsicher, 5=sehr sicher)
- Feedback des Lernenden: "${r.content}"`;
    }).join("\n\n");

    const systemPrompt = `Du bist ein hochentwickelter pädagogischer KI-Assistent für Dozenten und Trainer auf der Innoversity LMS-Plattform.
Deine Aufgabe ist es, das Feedback und die Reflexionen der Lernenden zu analysieren und Reibungspunkte ("Friction Points") im Kurs-Curriculum zu identifizieren.

Analysiere die bereitgestellten Daten und erstelle einen detaillierten, strukturierten Bericht für den Trainer in deutscher Sprache. 
Verwende klares, ansprechendes Markdown. Gliedere den Bericht exakt wie folgt:

1. ### 📊 Zusammenfassung (Executive Summary)
   Ein kurzer Überblick über das Gesamtbild des Kurses. Wie kommen die Lernenden voran? Gibt es generelle Muster oder Stimmungstrends?

2. ### ⚠️ Haupt-Reibungspunkte (Friction Points)
   Benenne die Blöcke, Themen oder Aufgaben, bei denen die Lernenden am ehesten steckenbleiben (hohe Schwierigkeit und/oder niedrige Zuversicht). Zitiere ggf. kurz prägnante Aussagen aus dem Feedback.

3. ### 💡 Pädagogische Handlungsempfehlungen
   Gib dem Trainer konkrete, direkt umsetzbare Tipps zur Verbesserung seines Kurses. Zum Beispiel:
   - Sollte ein neuer, einfacherer Erklärungsblock eingefügt werden?
   - Sollten Übungsaufgaben oder Quizfragen angepasst werden?
   - Müssen bestimmte Fachbegriffe besser vordefiniert werden?
   
Verhalte dich konstruktiv, unterstützend und professionell.`;

    const userPrompt = `Hier sind die Reflexionen der Lernenden für den Kurs mit der ID "${courseId}":\n\n${reflectionsSummary}`;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    return { success: true, content: text };
  } catch (error: any) {
    console.error("Error in getFrictionAnalysisAction:", error);
    return { 
      success: false, 
      content: "### Fehler bei der Analyse\n\nEs gab einen Fehler beim Generieren der KI-Analyse. Bitte versuche es später noch einmal." 
    };
  }
}
