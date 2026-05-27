export const PROMPT_TEMPLATES = {
  generateText: `
You are an expert trainer and instructional designer. Generate a learning block.
Course Title: {{courseTitle}}
Module Title: {{moduleTitle}}
Learning Objective: {{learningObjective}}
Target Group: {{targetGroup}}
Tone: {{tone}}
Length: {{length}}

Output a JSON object with:
- title (string)
- content (string, using clear instructional language)
- reflectionQuestion (string, a question for the learner to ponder)
  `,
  generateQuiz: `
You are an expert trainer. Generate a knowledge check for this concept.
Concept: {{concept}}
Difficulty: {{difficulty}}
Target Group: {{targetGroup}}

Output a JSON object with:
- question (string)
- options (array of strings, exactly 3 or 4)
- correctAnswer (string, must exactly match one of the options)
- explanation (string, why the correct answer is correct and others are not)
  `,
  generatePunkGame: `
You are an expert trainer. Generate a fast-paced, "Practical Challenge" for the learner.
Concept: {{concept}}
Target Group: {{targetGroup}}

Output a JSON object with:
- scenario (string, a brief context or setup for the challenge)
- task (string, the actionable challenge the learner must solve quickly)
- timeboxMinutes (number, a suggested time limit in minutes between 1 and 15)
- evaluationCriteria (array of strings, exactly 3 short points for peer review)
  `,
  generateReflection: `
Generate a reflection prompt that focuses on future skills.
Module Topic: {{moduleTopic}}
Future Skill Focus: {{futureSkillFocus}}

Output a JSON object with:
- reflectionPrompt (string)
- followUpQuestions (array of strings, optional)
  `,
  mentorReply: `
You are Anka AI, a supportive learning companion and mentor.
Do not give the final answer immediately. Encourage reflection and ask guiding questions.
Course Context: {{courseContext}}
Module Context: {{moduleContext}}
Block Context: {{blockContext}}
Learner Message: {{learnerMessage}}
Learner Confidence: {{learnerConfidence}}

Output a JSON object with:
- answer (string, supportive and empathetic)
- question (string, optional, to prompt deeper thinking)
- nextStep (string, optional, actionable advice)
  `,
  generateProjectTask: `
You are an expert trainer. Generate a structured, project-based learning task.
Course/Topic: {{concept}}
Module Objective: {{objective}}
Mode: Individual
Complexity: Medium

Output a JSON object with:
- title (string)
- scenario (string, a realistic case study or scenario)
- task (string, what the learner must do)
- deliverable (string, what artifact the learner must produce/submit)
- constraints (array of strings, key constraints or rules)
- reflectionPrompt (string, a post-project reflection question)
  `,
  generateCurriculum: `
You are an expert instructional designer, AI learning architect, and curriculum designer.
Generate a structured, cohesive, and comprehensive learning curriculum (modules and blocks) for a course based on the provided title and description.

Course Title: {{title}}
Course Description: {{description}}

You must structure the response as a list of 3-4 modules.
For each module:
1. Provide a title and short description.
2. Define 2-3 key learning objectives.
3. Generate 3-4 learning blocks of different types that support the module's objectives.
   The block types you can use are:
   - "text": For introducing concepts or providing reading material. Content is raw text/markdown.
   - "quiz": For quick comprehension checks. Content MUST be a JSON string of schema: {"question": string, "options": string[], "correctAnswer": string, "explanation": string} (with exactly 3 or 4 options, correctAnswer must match one of the options).
   - "reflection": For self-reflection and metacognition. Content MUST be a JSON string of schema: {"reflectionPrompt": string, "followUpQuestions": string[]}.
   - "punk_game": For fast-paced, high-intensity practical challenges. Content MUST be a JSON string of schema: {"scenario": string, "task": string, "timeboxMinutes": number, "evaluationCriteria": string[]}.
   - "project_task": For comprehensive, project-based applied learning. Content MUST be a JSON string of schema: {"title": string, "scenario": string, "task": string, "deliverable": string, "constraints": string[], "reflectionPrompt": string}.
   - "video": For visual learners. Content MUST be a valid YouTube embed URL, or fallback like "https://www.youtube.com/embed/dQw4w9WgXcQ".
   - "code": For technical, programming, or scripting concepts. Content is raw code.

Ensure that the blocks form a logical sequence (e.g. text -> quiz/reflection -> punk_game/project_task) and that the contents of quiz, reflection, punk_game, and project_task are valid, stringified JSON strings matching their respective schemas exactly.
The overall curriculum should feel premium, engaging, and modern. Make the block contents detailed and fully complete (do NOT use placeholders like "Write your text here" or "TODO").
`,
  generateModule: `
You are an expert instructional designer and AI learning architect.
Generate a structured, cohesive module (title, description, learning objectives, and blocks) for an existing course.

Course Title: {{courseTitle}}
New Module Topic: {{topic}}
Module Focus/Description: {{description}}

{{existingModulesInstructions}}

You must generate:
1. A descriptive title and short overview.
2. 2-3 key learning objectives.
3. 3-4 learning blocks of different types that support this module's objectives.
   The block types you can use are:
   - "text": Concept reading material. Content is raw text/markdown.
   - "quiz": Comprehension check. Content MUST be a JSON string of schema: {"question": string, "options": string[], "correctAnswer": string, "explanation": string} (with exactly 3 or 4 options, correctAnswer must match one of the options).
   - "reflection": Self-reflection prompt. Content MUST be a JSON string of schema: {"reflectionPrompt": string, "followUpQuestions": string[]}.
   - "punk_game": Practical high-intensity challenge. Content MUST be a JSON string of schema: {"scenario": string, "task": string, "timeboxMinutes": number, "evaluationCriteria": string[]}.
   - "project_task": Complex project assignment. Content MUST be a JSON string of schema: {"title": string, "scenario": string, "task": string, "deliverable": string, "constraints": string[], "reflectionPrompt": string}.
   - "video": YouTube embed URL or placeholder.
   - "code": Raw code snippet.

Ensure that the blocks form a logical sequence (e.g. text -> quiz/reflection -> punk_game/project_task) and that the contents of quiz, reflection, punk_game, and project_task are valid, stringified JSON strings matching their respective schemas exactly.
Make the block contents detailed and fully complete (do NOT use placeholders like "Write your text here" or "TODO").
`
};
