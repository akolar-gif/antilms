import { LearningBlock, Reflection } from "@/types";

export interface Recommendation {
  title: string;
  description: string;
  type: "review" | "practice" | "mentor" | "advance" | "reflect";
  actionText: string;
  actionUrl?: string;
  explanation: string;
}

export function generateRecommendation(
  completedBlockIds: string[],
  blocks: LearningBlock[],
  reflections: Reflection[] = [],
  quizScores: Record<string, { correct: boolean; attempts: number }> = {},
  lang: "de" | "en" = "de"
): Recommendation | null {
  if (blocks.length === 0) return null;

  const isEn = lang === "en";

  // Find the first uncompleted block
  const nextBlock = blocks.find(b => !completedBlockIds.includes(b.id));

  // Case 1: All blocks are completed
  if (!nextBlock) {
    // If the learner struggled with reflections or quizzes in this module
    const hasStruggleQuiz = Object.values(quizScores).some(q => !q.correct || q.attempts > 1);
    const lowConfidenceReflection = reflections.some(r => r.confidence < 4);

    if (hasStruggleQuiz || lowConfidenceReflection) {
      return {
        title: isEn ? "Consolidate and Deepen" : "Vertiefen und festigen",
        description: isEn
          ? "You finished all blocks, but some concepts were challenging. Ask Anka AI to clarify elements you found difficult."
          : "Du hast alle Abschnitte abgeschlossen, aber einige Konzepte waren eine Herausforderung. Frage Anka AI, um schwierige Themen zu klären.",
        type: "mentor",
        actionText: isEn ? "Chat with Anka AI" : "Mit Anka AI chatten",
        explanation: isEn
          ? "Based on your low confidence score or multiple quiz attempts, we suggest wrapping up this module with a reflective dialogue."
          : "Basierend auf deiner niedrigen Konfidenz oder mehreren Quizversuchen empfehlen wir, dieses Modul mit einem klärenden Dialog abzuschließen."
      };
    }

    return {
      title: isEn ? "Module Fully Mastered" : "Modul vollständig gemeistert",
      description: isEn
        ? "Congratulations! You have completed all content, quizzes, and challenges in this module."
        : "Herzlichen Glückwunsch! Du hast alle Inhalte, Quizzes und Herausforderungen in diesem Modul abgeschlossen.",
      type: "advance",
      actionText: isEn ? "Move to next Module" : "Weiter zum nächsten Modul",
      explanation: isEn
        ? "You have verified your understanding and applied your skills in the practical task."
        : "Du hast dein Verständnis überprüft und deine Fähigkeiten im praktischen Teil angewendet."
    };
  }

  // Case 2: The next block is a quiz and we haven't completed the preceding text/video blocks
  const completedCount = completedBlockIds.length;
  const progressRatio = completedCount / blocks.length;

  // Case 3: Learner completed a reflection block
  const lastCompletedBlock = blocks.find(b => completedBlockIds[completedBlockIds.length - 1] === b.id);
  
  if (lastCompletedBlock?.type === "reflection") {
    const matchingReflection = reflections.find(r => r.blockId === lastCompletedBlock.id);
    if (matchingReflection) {
      if (matchingReflection.confidence < 3) {
        return {
          title: isEn ? "Clarify with your Mentor" : "Klären mit deinem Mentor",
          description: isEn
            ? "Your reflection indicates a lower confidence on this topic. Let's discuss it before moving forward."
            : "Deine Reflexion deutet auf eine geringere Sicherheit bei diesem Thema hin. Lass uns das besprechen, bevor du fortfährst.",
          type: "mentor",
          actionText: isEn ? "Ask Anka AI for help" : "Anka AI um Hilfe bitten",
          explanation: isEn
            ? "You marked a low confidence level (below 3/5) in your last reflection response."
            : "Du hast in deiner letzten Reflexionsantwort ein geringes Konfidenzniveau (unter 3/5) angegeben."
        };
      }
      if (matchingReflection.difficulty > 4) {
        return {
          title: isEn ? "Break Down the Difficulty" : "Schwierigkeit analysieren",
          description: isEn
            ? "You found this concept highly difficult. Try asking Anka AI for an easier, real-world analogy."
            : "Du fandest dieses concept sehr schwierig. Frage Anka AI nach einer einfacheren Analogie aus der Praxis.",
          type: "review",
          actionText: isEn ? "Ask for an Analogy" : "Nach einer Analogie fragen",
          explanation: isEn
            ? "You rated the difficulty of the reflection block as high (above 4/5)."
            : "Du hast den Schwierigkeitsgrad des Reflexionsblocks als hoch (über 4/5) eingestuft."
        };
      }
    }
  }

  // Case 4: The next block is a challenge (punk_game or project_task)
  if (nextBlock.type === "punk_game" || nextBlock.type === "project_task") {
    return {
      title: isEn ? "Apply Your Knowledge" : "Wende dein Wissen an",
      description: isEn
        ? "You are ready to test your capability! Solve the practical scenario to prove your hands-on agility."
        : "Du bist bereit, deine Fähigkeiten zu testen! Löse die praktische Aufgabe, um deine Agilität in der Praxis zu beweisen.",
      type: "practice",
      actionText: isEn ? "Start Practical Challenge" : "Praktische Aufgabe starten",
      explanation: isEn
        ? "You have completed the theoretical and reflective parts. Now it's time to create and apply."
        : "Du hast die theoretischen und reflektiven Teile abgeschlossen. Jetzt ist es Zeit, etwas zu erschaffen und anzuwenden."
    };
  }

  // Case 5: Standard progression
  if (nextBlock.type === "quiz") {
    return {
      title: isEn ? "Test Your Understanding" : "Überprüfe dein Verständnis",
      description: isEn
        ? "Let's check if you got the key takeaways. Try the knowledge check block."
        : "Lass uns prüfen, ob du die wichtigsten Erkenntnisse mitgenommen hast. Versuche den Verständnis-Check.",
      type: "review",
      actionText: isEn ? "Take Quiz" : "Quiz starten",
      explanation: isEn
        ? "A quiz is the next step to consolidate what you just read."
        : "Ein Quiz ist der nächste Schritt, um das Gelesene zu festigen."
    };
  }

  if (nextBlock.type === "reflection") {
    return {
      title: isEn ? "Reflect on What You Learned" : "Reflektiere das Gelernte",
      description: isEn
        ? "Take a pause to reflect on how this concept connects to your personal workplace context."
        : "Nimm dir einen Moment Zeit, um darüber nachzudenken, wie dieses Konzept mit deinem persönlichen Arbeitskontext zusammenhängt.",
      type: "reflect",
      actionText: isEn ? "Start Reflection" : "Reflexion starten",
      explanation: isEn
        ? "Reflection helps move concepts from short-term memory into practical capability."
        : "Reflexion hilft dabei, Konzepte vom Kurzzeitgedächtnis in praktische Fähigkeiten zu überführen."
    };
  }

  return {
    title: isEn ? "Continue Your Journey" : "Setze deine Lernreise fort",
    description: isEn
      ? `Next up: "${nextBlock.title}". Let's dive in!`
      : `Als Nächstes: "${nextBlock.title}". Lass uns eintauchen!`,
    type: "advance",
    actionText: isEn ? "Continue" : "Fortsetzen",
    explanation: isEn
      ? "Standard sequential progression based on the structured module curriculum."
      : "Standardmäßige sequenzielle Progression basierend auf dem strukturierten Lehrplan."
  };
}
