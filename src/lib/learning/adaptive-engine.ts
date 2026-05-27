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
  quizScores: Record<string, { correct: boolean; attempts: number }> = {}
): Recommendation | null {
  if (blocks.length === 0) return null;

  // Find the first uncompleted block
  const nextBlock = blocks.find(b => !completedBlockIds.includes(b.id));

  // Case 1: All blocks are completed
  if (!nextBlock) {
    // If the learner struggled with reflections or quizzes in this module
    const hasStruggleQuiz = Object.values(quizScores).some(q => !q.correct || q.attempts > 1);
    const lowConfidenceReflection = reflections.some(r => r.confidence < 4);

    if (hasStruggleQuiz || lowConfidenceReflection) {
      return {
        title: "Consolidate and Deepen",
        description: "You finished all blocks, but some concepts were challenging. Ask Anka AI to clarify elements you found difficult.",
        type: "mentor",
        actionText: "Chat with Anka AI",
        explanation: "Based on your low confidence score or multiple quiz attempts, we suggest wrapping up this module with a reflective dialogue."
      };
    }

    return {
      title: "Module Fully Mastered",
      description: "Congratulations! You have completed all content, quizzes, and challenges in this module.",
      type: "advance",
      actionText: "Move to next Module",
      explanation: "You have verified your understanding and applied your skills in the practical task."
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
          title: "Clarify with your Mentor",
          description: "Your reflection indicates a lower confidence on this topic. Let's discuss it before moving forward.",
          type: "mentor",
          actionText: "Ask Anka AI for help",
          explanation: "You marked a low confidence level (below 3/5) in your last reflection response."
        };
      }
      if (matchingReflection.difficulty > 4) {
        return {
          title: "Break Down the Difficulty",
          description: "You found this concept highly difficult. Try asking Anka AI for an easier, real-world analogy.",
          type: "review",
          actionText: "Ask for an Analogy",
          explanation: "You rated the difficulty of the reflection block as high (above 4/5)."
        };
      }
    }
  }

  // Case 4: The next block is a challenge (punk_game or project_task)
  if (nextBlock.type === "punk_game" || nextBlock.type === "project_task") {
    return {
      title: "Apply Your Knowledge",
      description: "You are ready to test your capability! Solve the practical scenario to prove your hands-on agility.",
      type: "practice",
      actionText: "Start Practical Challenge",
      explanation: "You have completed the theoretical and reflective parts. Now it's time to create and apply."
    };
  }

  // Case 5: Standard progression
  if (nextBlock.type === "quiz") {
    return {
      title: "Test Your Understanding",
      description: "Let's check if you got the key takeaways. Try the knowledge check block.",
      type: "review",
      actionText: "Take Quiz",
      explanation: "A quiz is the next step to consolidate what you just read."
    };
  }

  if (nextBlock.type === "reflection") {
    return {
      title: "Reflect on What You Learned",
      description: "Take a pause to reflect on how this concept connects to your personal workplace context.",
      type: "reflect",
      actionText: "Start Reflection",
      explanation: "Reflection helps move concepts from short-term memory into practical capability."
    };
  }

  return {
    title: "Continue Your Journey",
    description: `Next up: "${nextBlock.title}". Let's dive in!`,
    type: "advance",
    actionText: "Continue",
    explanation: "Standard sequential progression based on the structured module curriculum."
  };
}
