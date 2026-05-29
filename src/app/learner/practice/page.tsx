import { store } from "@/lib/store";
import { LearnerPracticeClient } from "./practice-client";

export const dynamic = 'force-dynamic';

export default async function LearnerPracticePage() {
  const courses = await store.getCourses();
  const publishedCourses = courses.filter(c => c.status === "published");

  // Fetch all quiz blocks in published courses
  const quizzes = [];
  
  for (const course of publishedCourses) {
    const modules = await store.getModules(course.id);
    for (const mod of modules) {
      const blocks = await store.getBlocks(mod.id);
      const quizBlocks = blocks.filter(b => b.type === "quiz");
      
      for (const q of quizBlocks) {
        try {
          const data = JSON.parse(q.content);
          quizzes.push({
            id: q.id,
            q: data.question,
            opts: data.options,
            correct: data.options.indexOf(data.correctAnswer) !== -1 ? data.options.indexOf(data.correctAnswer) : 0,
            fb: data.explanation || "Gut gemacht! Das ist die richtige Antwort.",
            fbWrong: `Leider nicht ganz. Die richtige Antwort ist: <b>${data.correctAnswer}</b>. ${data.explanation || ""}`
          });
        } catch (e) {
          // ignore corrupted json
        }
      }
    }
  }

  // Fallback default questions if database has no quizzes yet
  const fallbacks = [
    {
      id: "fb-1",
      q: "Was ist der Hauptunterschied zwischen einer Kopie und einem Remix im kreativen Schaffen?",
      opts: [
        "Ein Remix verändert die Oberfläche unter Beibehaltung der Kernstruktur, während eine Kopie eins-zu-eins abbildet.",
        "Eine Kopie ist illegal, ein Remix ist immer legal.",
        "Ein Remix kombiniert bestehende Teile neu und transformiert sie, um etwas Neues zu schaffen."
      ],
      correct: 2,
      fb: "Richtig! Ein Remix nimmt bestehende Teile, arrangiert sie neu und fügt eine eigene Transformation hinzu, was zu einem neuen kreativen Werk führt.",
      fbWrong: "Nicht ganz. Der Remix zeichnet sich durch die **kombinatorische Neuanordnung und Transformation** bestehender Elemente aus."
    },
    {
      id: "fb-2",
      q: "Wie können Mentor-Fragen per KI optimal bereichert werden?",
      opts: [
        "Durch das Senden des kompletten Benutzerprofils.",
        "Durch das automatische Mitsenden des aktuellen Modul-Kontexts und des Lernfortschritts.",
        "Indem der Benutzer gezwungen wird, lange Fragen zu stellen."
      ],
      correct: 1,
      fb: "Korrekt! Die KI antwortet deutlich präziser, wenn sie weiß, in welchem Kurs, Modul und an welchem konkreten Block der Lerner arbeitet.",
      fbWrong: "Nicht ganz. Der Schlüssel liegt im **automatischen Kontext-Enrichment** (Kurs, Modul, Block und Status)."
    },
    {
      id: "fb-3",
      q: "Welches Ziel verfolgt ein 'Project Task' Block im projektbasierten Lernen?",
      opts: [
        "Reines Auswendiglernen von Begriffen.",
        "Praktische Anwendung von Konzepten mit anschließender Deliverable-Abgabe und Reflexion.",
        "Das Anschauen von Lehrvideos ohne Interaktion."
      ],
      correct: 1,
      fb: "Hervorragend! Ein Project Task verlangt die aktive Anwendung und vertieft das Verständnis durch die strukturierte Reflexion nach der Abgabe.",
      fbWrong: "Leider falsch. Project Tasks zielen auf die **praktische Anwendung und anschließende Reflexion** ab."
    }
  ];

  const activeQuizzes = quizzes.length > 0 ? quizzes : fallbacks;

  return (
    <LearnerPracticeClient initialQuizzes={activeQuizzes} />
  );
}
