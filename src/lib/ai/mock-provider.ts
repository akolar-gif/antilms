import { AIProvider, GenerateTextInput, GenerateTextResult, GenerateBlockInput, MentorReplyInput, MentorReplyResult, CoDesignerInput, CoDesignerResult, GenerateCurriculumInput, GeneratedCurriculumResult, GenerateModuleInput, GeneratedModule } from "./provider";
import { LearningBlock } from "@/types";

export class MockAIProvider implements AIProvider {
  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (input.language === "en") {
      return {
        title: "Generated: Understanding the Basics",
        content: "This is a mock generated text explaining the core concepts. It focuses on breaking down the complexity into manageable parts, ensuring the learner grasps the foundational elements first.",
        reflectionQuestion: "How does this basic concept apply to your current work environment?"
      };
    }
    
    return {
      title: "Generiert: Die Grundlagen verstehen",
      content: "Dies ist ein per Mock-AI generierter Text, der die Kernkonzepte erklärt. Er konzentriert sich darauf, die Komplexität in überschaubare Teile zu zerlegen und stellt sicher, dass der Lernende zuerst die grundlegenden Elemente versteht.",
      reflectionQuestion: "Wie lässt sich dieses grundlegende Konzept auf Ihre aktuelle Arbeitsumgebung anwenden?"
    };
  }

  async generateStructuredBlock(input: GenerateBlockInput): Promise<Partial<LearningBlock>> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const promptPrefix = input.prompt ? `[Generated from: "${input.prompt}"]\n\n` : "";
    const isEn = input.language === "en";

    if (input.type === "quiz") {
      if (isEn) {
        return {
          type: "quiz",
          title: "Knowledge Check",
          content: JSON.stringify({
            question: input.prompt ? `(Based on: ${input.prompt}) What is the primary difference?` : "What is the primary difference between a symptom and a root cause?",
            options: ["A symptom is visible, a root cause is hidden", "They are the same thing", "Symptoms cause root problems"],
            correctAnswer: "A symptom is visible, a root cause is hidden",
            explanation: "Symptoms are the visible manifestations of a deeper, underlying issue (the root cause)."
          }),
          learningMode: "test",
          source: "ai_assisted"
        };
      }
      return {
        type: "quiz",
        title: "Wissenstest",
        content: JSON.stringify({
          question: input.prompt ? `(Basierend auf: ${input.prompt}) Was ist der Hauptunterschied?` : "Was ist der Hauptunterschied zwischen einem Symptom und einer Ursache?",
          options: ["Ein Symptom ist sichtbar, eine Ursache ist verborgen", "Sie sind das Gleiche", "Symptome verursachen Kernprobleme"],
          correctAnswer: "Ein Symptom ist sichtbar, eine Ursache ist verborgen",
          explanation: "Symptome sind die sichtbaren Auswirkungen eines tieferen, zugrundeliegenden Problems (der Ursache)."
        }),
        learningMode: "test",
        source: "ai_assisted"
      };
    }
    
    if (input.type === "reflection") {
      if (isEn) {
        return {
          type: "reflection",
          title: "Pause and Reflect",
          content: JSON.stringify({
            reflectionPrompt: input.prompt ? `Reflect on this: ${input.prompt}` : "Think of a time when you solved a problem, only for it to return later. Did you address a symptom or the root cause?",
            followUpQuestions: ["Why did it return?", "What was the actual root cause?"]
          }),
          learningMode: "reflect",
          source: "ai_assisted"
        };
      }
      return {
        type: "reflection",
        title: "Innehalten und Reflektieren",
        content: JSON.stringify({
          reflectionPrompt: input.prompt ? `Reflektieren Sie darüber: ${input.prompt}` : "Denken Sie an eine Zeit zurück, in der Sie ein Problem gelöst haben, nur damit es später wieder auftritt. Haben Sie das Symptom oder die Ursache bekämpft?",
          followUpQuestions: ["Warum kam es zurück?", "Was war die eigentliche Ursache?"]
        }),
        learningMode: "reflect",
        source: "ai_assisted"
      };
    }

    if (input.type === "project_task") {
      if (isEn) {
        return {
          type: "project_task",
          title: "Project Assignment: Solving the Core Friction",
          content: JSON.stringify({
            title: "Project Assignment: Solving the Core Friction",
            scenario: "Your team is running a sprint but the feedback loop from customers is completely broken. You have lots of assumptions but very few facts, leading to wasted effort and slow feature adoption.",
            task: "Design a simple lean experiment or feedback channel to gather real usage signals for a new feature. Outline who you will contact, what data you will capture, and how you will analyze it.",
            deliverable: "A 1-page Experiment Canvas or feedback collection protocol.",
            constraints: ["Timebox: 3 days to design and run the first test", "Must involve at least 5 real users", "Max 500 words for the protocol"],
            reflectionPrompt: "Reflect on how this experiment design changes your team's usual feature delivery approach."
          }),
          learningMode: "apply",
          source: "ai_assisted"
        };
      }
      return {
        type: "project_task",
        title: "Projektarbeit: Reibungen lösen",
        content: JSON.stringify({
          title: "Projektarbeit: Reibungen lösen",
          scenario: "Ihr Team führt einen Sprint durch, aber das Feedback-Loop der Kunden ist gestört. Sie arbeiten auf Basis von Annahmen statt Fakten, was zu unnötigem Aufwand und langsamer Akzeptanz führt.",
          task: "Entwerfen Sie ein einfaches Lean-Experiment oder einen Feedback-Kanal, um echte Nutzungssignale für ein neues Feature zu sammeln. Skizzieren Sie, wen Sie kontaktieren, welche Daten Sie erfassen und wie Sie diese analysieren.",
          deliverable: "Ein einseitiges Experiment-Canvas oder ein Feedback-Erfassungsprotokoll.",
          constraints: ["Zeitrahmen: 3 Tage zur Erstellung und Durchführung des ersten Tests", "Muss mindestens 5 echte Nutzer einbeziehen", "Max. 500 Wörter für das Protokoll"],
          reflectionPrompt: "Reflektieren Sie, wie sich dieses Experiment auf den üblichen Lieferansatz Ihres Teams auswirkt."
        }),
        learningMode: "apply",
        source: "ai_assisted"
      };
    }

    if (input.type === "video") {
      return {
        type: "video",
        title: isEn ? "Video Resource" : "Video-Ressource",
        content: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Default mock video
        learningMode: "understand",
        source: "ai_assisted"
      };
    }

    if (input.type === "code") {
      return {
        type: "code",
        title: isEn ? "Code Example" : "Code-Beispiel",
        content: promptPrefix + "function example() {\n  console.log('Hello World');\n}",
        learningMode: "apply",
        source: "ai_assisted"
      };
    }

    return {
      type: "text",
      title: isEn ? "AI Suggested Content" : "KI-Vorgeschlagener Inhalt",
      content: promptPrefix + (isEn ? "This is a fallback mock block generated by AI." : "Dies ist ein per Mock-KI generierter Fallback-Block."),
      learningMode: "understand",
      source: "ai_assisted"
    };
  }

  async mentorReply(input: MentorReplyInput): Promise<MentorReplyResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isEn = input.language === "en";
    const hasContext = input.moduleContext.includes("Current Active Block Context");
    
    let prefix = "";
    if (isEn) {
      prefix = hasContext ? "[Mock AI: I see you are looking at a specific block!] " : "[Mock AI: General question] ";
      return {
        answer: prefix + "That's a very interesting point. When we focus too much on the immediate symptoms, we often miss the underlying pattern.",
        question: "Can you think of a framework or tool you've used recently that might help uncover those deeper patterns?",
        nextStep: "Try applying the '5 Whys' technique to the situation you just described."
      };
    }

    prefix = hasContext ? "[Mock KI: Ich sehe, dass Sie sich einen bestimmten Block ansehen!] " : "[Mock KI: Allgemeine Frage] ";
    return {
      answer: prefix + "Das ist ein sehr interessanter Punkt. Wenn wir uns zu sehr auf die unmittelbaren Symptome konzentrieren, übersehen wir oft das zugrunde liegende Muster.",
      question: "Fällt Ihnen ein Framework oder Werkzeug ein, das Sie kürzlich verwendet haben, um diese tieferen Muster aufzudecken?",
      nextStep: "Versuchen Sie, die '5-Whys'-Methode auf die von Ihnen beschriebene Situation anzuwenden."
    };
  }

  async coDesignerReply(input: CoDesignerInput): Promise<CoDesignerResult> {
    await new Promise(r => setTimeout(r, 1000));
    const isEn = input.language === "en";

    if (isEn) {
      return {
        reply: "As a mock AI Co-Designer, I suggest adding a **Quiz Block** here to test the learner's knowledge.",
        proposedBlock: {
          type: "quiz",
          title: "Knowledge Check",
          content: JSON.stringify({
            question: "What is the main topic here?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            explanation: "Because it is correct."
          }),
          learningMode: "test"
        }
      };
    }

    return {
      reply: "Als Mock-KI-Co-Designer empfehle ich, hier einen **Quiz-Block** hinzuzufügen, um das Wissen des Lernenden zu testen.",
      proposedBlock: {
        type: "quiz",
        title: "Wissenstest",
        content: JSON.stringify({
          question: "Was ist das Hauptthema hier?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          explanation: "Weil es korrekt ist."
        }),
        learningMode: "test"
      }
    };
  }

  async generateCurriculum(input: GenerateCurriculumInput): Promise<GeneratedCurriculumResult> {
    await new Promise(r => setTimeout(r, 1500));
    const isEn = input.language === "en";

    if (isEn) {
      return {
        modules: [
          {
            title: "Module 1: Introduction to " + input.title,
            description: "Understanding the foundations and setting the stage.",
            learningObjectives: ["Understand core concepts of " + input.title, "Identify primary challenges"],
            blocks: [
              {
                type: "text",
                title: "What is " + input.title + "?",
                content: "This is a reading block explaining the foundations. It covers the basic tenets and explains why this topic is highly relevant today.",
                learningMode: "understand"
              },
              {
                type: "quiz",
                title: "Quick Test",
                content: JSON.stringify({
                  question: "Which of the following is a primary goal of this course?",
                  options: ["To master the basics", "To skip the training", "None of the above"],
                  correctAnswer: "To master the basics",
                  explanation: "The course is designed to build foundational mastery."
                }),
                learningMode: "test"
              }
            ]
          },
          {
            title: "Module 2: Practical Application",
            description: "Hands-on projects and tools to implement ideas.",
            learningObjectives: ["Apply frameworks", "Solve simulated conflicts"],
            blocks: [
              {
                type: "punk_game",
                title: "Rapid Execution Challenge",
                content: JSON.stringify({
                  scenario: "A client calls with a major issue and needs a response within 10 minutes.",
                  task: "Write a 3-step action plan to address the issue and align the team.",
                  timeboxMinutes: 10,
                  evaluationCriteria: ["Clarity of response", "Empathy towards client", "Feasibility of plan"]
                }),
                learningMode: "challenge"
              },
              {
                type: "reflection",
                title: "Final Reflection",
                content: JSON.stringify({
                  reflectionPrompt: "How will you apply these tools in your day-to-day work environment?",
                  followUpQuestions: ["What obstacle do you expect first?", "How can you mitigate it?"]
                }),
                learningMode: "reflect"
              }
            ]
          }
        ]
      };
    }

    return {
      modules: [
        {
          title: "Modul 1: Einführung in " + input.title,
          description: "Die Grundlagen verstehen und die Basis schaffen.",
          learningObjectives: ["Kernkonzepte von " + input.title + " verstehen", "Hauptsächliche Herausforderungen identifizieren"],
          blocks: [
            {
              type: "text",
              title: "Was ist " + input.title + "?",
              content: "Dies ist ein Leseblock, der die Grundlagen erklärt. Er deckt die Kernprinzipien ab und erklärt, warum dieses Thema heute von hoher Relevanz ist.",
              learningMode: "understand"
            },
            {
              type: "quiz",
              title: "Schnelltest",
              content: JSON.stringify({
                question: "Welches der folgenden ist ein Hauptziel dieses Kurses?",
                options: ["Die Grundlagen meistern", "Das Training überspringen", "Keines der oben genannten"],
                correctAnswer: "Die Grundlagen meistern",
                explanation: "Der Kurs ist darauf ausgelegt, ein grundlegendes Verständnis aufzubauen."
              }),
              learningMode: "test"
            }
          ]
        },
        {
          title: "Modul 2: Praktische Anwendung",
          description: "Praxisnahe Projekte und Werkzeuge zur Umsetzung von Ideen.",
          learningObjectives: ["Frameworks anwenden", "Simulierte Konflikte lösen"],
          blocks: [
            {
              type: "punk_game",
              title: "Schnellfeuer-Herausforderung",
              content: JSON.stringify({
                scenario: "Ein Kunde ruft mit einem schwerwiegenden Problem an und benötigt innerhalb von 10 Minuten eine Antwort.",
                task: "Schreiben Sie einen dreistufigen Aktionsplan, um das Problem anzugehen und das Team abzustimmen.",
                timeboxMinutes: 10,
                evaluationCriteria: ["Klarheit der Antwort", "Empathie gegenüber dem Kunden", "Machbarkeit des Plans"]
              }),
              learningMode: "challenge"
            },
            {
              type: "reflection",
              title: "Abschluss-Reflexion",
              content: JSON.stringify({
                reflectionPrompt: "Wie werden Sie diese Werkzeuge in Ihrer täglichen Arbeitsumgebung anwenden?",
                followUpQuestions: ["Welches Hindernis erwarten Sie zuerst?", "Wie können Sie dieses entschärfen?"]
              }),
              learningMode: "reflect"
            }
          ]
        }
      ]
    };
  }

  async generateModule(input: GenerateModuleInput): Promise<GeneratedModule> {
    await new Promise(r => setTimeout(r, 1500));
    const isEn = input.language === "en";

    if (isEn) {
      return {
        title: input.topic,
        description: input.description,
        learningObjectives: ["Understand " + input.topic, "Apply standard practices of " + input.topic],
        blocks: [
          {
            type: "text",
            title: "Introduction to " + input.topic,
            content: "Welcome. This module covers " + input.topic + ". It details the core definitions and provides useful guides.",
            learningMode: "understand"
          },
          {
            type: "quiz",
            title: "Knowledge Check",
            content: JSON.stringify({
              question: "What is the key focus of " + input.topic + "?",
              options: ["The target goals", "Irrelevant activities", "Other items"],
              correctAnswer: "The target goals",
              explanation: "The module focuses on attaining the key goals related to the topic."
            }),
            learningMode: "test"
          }
        ]
      };
    }

    return {
      title: input.topic,
      description: input.description,
      learningObjectives: ["Verständnis von " + input.topic, "Anwendung von Best Practices im Bereich " + input.topic],
      blocks: [
        {
          type: "text",
          title: "Einführung in " + input.topic,
          content: "Willkommen. Dieses Modul behandelt " + input.topic + ". Es beschreibt die Kerndefinitionen und bietet nützliche Anleitungen.",
          learningMode: "understand"
        },
        {
          type: "quiz",
          title: "Wissenstest",
          content: JSON.stringify({
            question: "Was ist der Schwerpunkt von " + input.topic + "?",
            options: ["Die Zielsetzungen", "Irrelevante Aktivitäten", "Andere Aspekte"],
            correctAnswer: "Die Zielsetzungen",
            explanation: "Das Modul konzentriert sich auf das Erreichen der wichtigsten Ziele im Zusammenhang mit dem Thema."
          }),
          learningMode: "test"
        }
      ]
    };
  }
}
