export const PROMPT_TEMPLATES = {
  generateText: `
You are an expert trainer and instructional designer. Generate a learning block.
Course Title: {{courseTitle}}
Module Title: {{moduleTitle}}
Learning Objective: {{learningObjective}}
Target Group: {{targetGroup}}
Tone: {{tone}}
Length: {{length}}

TONE CONSTRAINT:
If generating in German, you MUST address the user using the informal 'du' (Du-Form) e.g., 'du hast', 'deine Rolle'. NEVER use the formal 'Sie' or 'Ihr'.

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

TONE CONSTRAINT:
If generating in German, you MUST address the user using the informal 'du' (Du-Form) e.g., 'deine Antwort', 'du hast'. NEVER use the formal 'Sie' or 'Ihr'.

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

CRITICAL AUDIENCE CONSTRAINT:
Our target audience consists of business professionals, managers, creators, and general staff seeking Future Skills (Agility, Critical Thinking, Soft Skills, AI Co-Creation). They are NOT software developers or programmers. 
AVOID coding, Git, Docker, DevOps, or command-line scripting scenarios unless the course topic specifically demands it.
INSTEAD, focus on real-world business, product design, creative strategy, team collaboration, Scrum/Kanban, customer feedback, or organizational change scenarios.

TONE CONSTRAINT:
You MUST address the user using the informal German 'du' (Du-Form) e.g., 'du', 'dir', 'dein'. NEVER use 'Sie' or 'Ihr'.

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

TONE CONSTRAINT:
You MUST address the user using the informal German 'du' (Du-Form) e.g., 'du', 'dir', 'dein'. NEVER use 'Sie' or 'Ihr'.

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

TONE CONSTRAINT:
You MUST address the user using the informal German 'du' (Du-Form) e.g., 'du', 'dir', 'dein'. NEVER use 'Sie' or 'Ihr'.

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

CRITICAL AUDIENCE CONSTRAINT:
Our target audience consists of business professionals, managers, creators, and general staff seeking Future Skills (Agility, Critical Thinking, Soft Skills, AI Co-Creation). They are NOT software developers or programmers. 
AVOID coding, Git, Docker, DevOps, or command-line scripting scenarios unless the course topic specifically demands it.
INSTEAD, focus on real-world business, product design, creative strategy, team collaboration, Scrum/Kanban, customer feedback, or organizational change scenarios.

TONE CONSTRAINT:
You MUST address the user using the informal German 'du' (Du-Form) e.g., 'du', 'dir', 'dein'. NEVER use 'Sie' or 'Ihr'.

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

CRITICAL AUDIENCE CONSTRAINT:
Our target audience consists of business professionals, managers, creators, and general staff seeking Future Skills (Agility, Critical Thinking, Soft Skills, AI Co-Creation). They are NOT software developers or programmers. 
AVOID coding, Git, Docker, DevOps, or command-line scripting scenarios unless the course topic specifically demands it.
INSTEAD, focus on real-world business, product design, creative strategy, team collaboration, Scrum/Kanban, customer feedback, or organizational change scenarios.

TONE CONSTRAINT:
All German learning content (texts, quiz questions, reflection prompts, tasks, scenarios, descriptions) MUST address the learner using the informal 'du' (Du-Form) e.g., 'du', 'dir', 'dein'. NEVER use the formal 'Sie' or 'Ihr'.

MODULE STRUCTURE INSTRUCTION:
- If a custom curriculum/syllabus outline is provided at the bottom of this prompt: You MUST create exactly one module for each main topic/theme numbered in that syllabus (do NOT merge them or skip any; if the syllabus has 7 or 10 topics, generate exactly 7 or 10 modules). The learning blocks for each module must cover the subtopics listed under that specific main topic.
- Otherwise (if no custom syllabus is provided): You must structure the response as a list of 3-4 modules.

For each module:
1. Provide a title and short description.
2. Define 2-3 key learning objectives.
3. Generate 2-3 learning blocks of different types that support the module's objectives (such as text, quiz, reflection, punk_game, or project_task).
   The block types you can use are:
   - "text": For introducing concepts or providing reading material. Content is raw text/markdown.
   - "quiz": For quick comprehension checks. Content MUST be a JSON string of schema: {"question": string, "options": string[], "correctAnswer": string, "explanation": string} (with exactly 3 or 4 options, correctAnswer must match one of the options).
   - "reflection": For self-reflection and metacognition. Content MUST be a JSON string of schema: {"reflectionPrompt": string, "followUpQuestions": string[]}.
   - "punk_game": For fast-paced, high-intensity practical challenges. Content MUST be a JSON string of schema: {"scenario": string, "task": string, "timeboxMinutes": number, "evaluationCriteria": string[]}.
   - "project_task": For comprehensive, project-based applied learning. Content MUST be a JSON string of schema: {"title": string, "scenario": string, "task": string, "deliverable": string, "constraints": string[], "reflectionPrompt": string}.
   - "video": For visual learners. Content MUST be a valid YouTube embed URL, or fallback like "https://www.youtube.com/embed/dQw4w9WgXcQ".
   - "code": For technical, programming, or scripting concepts. Content is raw code.
   - "audio": For audio content, podcasts, or spoken explanations. Content MUST be a valid MP3 file URL, e.g. "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3".

CRITICAL VISUAL & FORMATTING INSTRUCTIONS FOR TEXT BLOCKS:
1. TYPOGRAPHY & EMOJIS: DO NOT use emojis in module titles, block titles, or section headings (###). Keep titles clean, professional, and elegant.
2. NEWLINES: ALWAYS place empty double newlines (\n\n) before and after EVERY heading (###), image, bullet point list, and code/diagram block. NEVER merge headings or image URLs inline into a paragraph string!
3. STANDALONE IMAGES: Include a relevant visual illustration or photograph per text block on its own line:

   ![Deutscher Untertitel/Beschreibung](https://image.pollinations.ai/prompt/Detailed_English_prompt_describing_a_modern_flat_vector_or_realistic_scene_about_topic?width=1200&height=675&model=flux&nologo=true)

   (Ensure the image prompt inside the URL is written in descriptive English matching the specific topic, e.g. "hd_photography_minecraft_building_structure_crafting_guide").
4. PROCESS DIAGRAMS / FLOWCHARTS: Include a process, framework, or decision flow diagram as a standalone Mermaid code block whenever introducing a workflow, cycle, or taxonomy:

   \`\`\`mermaid
   graph TD
     A[Input / Problem] --> B[Analyse & Prozess]
     B --> C[Ergebnis & Transfer]
   \`\`\`

Ensure that the blocks form a logical sequence (e.g. text -> quiz/reflection -> punk_game/project_task) and that the contents of quiz, reflection, punk_game, and project_task are valid, stringified JSON strings matching their respective schemas exactly.
The overall curriculum should feel premium, engaging, dynamic, and visually rich. Make the block contents detailed and fully complete (do NOT use placeholders like "Write your text here" or "TODO").
`,
  generateModule: `
You are an expert instructional designer and AI learning architect.
Generate a structured, cohesive module (title, description, learning objectives, and blocks) for an existing course.

Course Title: {{courseTitle}}
New Module Topic: {{topic}}
Module Focus/Description: {{description}}

{{existingModulesInstructions}}

CRITICAL AUDIENCE CONSTRAINT:
Our target audience consists of business professionals, managers, creators, and general staff seeking Future Skills (Agility, Critical Thinking, Soft Skills, AI Co-Creation). They are NOT software developers or programmers. 
AVOID coding, Git, Docker, DevOps, or command-line scripting scenarios unless the course topic specifically demands it.
INSTEAD, focus on real-world business, product design, creative strategy, team collaboration, Scrum/Kanban, customer feedback, or organizational change scenarios.

TONE CONSTRAINT:
All German learning content (texts, quiz questions, reflection prompts, tasks, scenarios, descriptions) MUST address the learner using the informal 'du' (Du-Form) e.g., 'du', 'dir', 'dein'. NEVER use the formal 'Sie' or 'Ihr'.

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
   - "audio": Audio content or podcast. Content MUST be a valid MP3 file URL, e.g. "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3".

CRITICAL VISUAL & FORMATTING INSTRUCTIONS FOR TEXT BLOCKS:
1. TYPOGRAPHY & EMOJIS: DO NOT use emojis in module titles, block titles, or section headings (###). Keep titles clean, professional, and elegant.
2. NEWLINES: ALWAYS place empty double newlines (\n\n) before and after EVERY heading (###), image, bullet point list, and code/diagram block. NEVER merge headings or image URLs inline into a paragraph string!
3. STANDALONE IMAGES: Include a relevant visual illustration per text block on its own line:

   ![Deutscher Untertitel/Beschreibung](https://image.pollinations.ai/prompt/Detailed_English_prompt_describing_a_modern_flat_vector_or_realistic_scene_about_topic?width=1200&height=675&model=flux&nologo=true)

4. PROCESS DIAGRAMS / FLOWCHARTS: Include a process, framework, or decision flow diagram as a standalone Mermaid code block whenever introducing a workflow or structure:

   \`\`\`mermaid
   graph TD
     A[Input / Problem] --> B[Analyse & Prozess]
     B --> C[Ergebnis & Transfer]
   \`\`\`

Ensure that the blocks form a logical sequence (e.g. text -> quiz/reflection -> punk_game/project_task) and that the contents of quiz, reflection, punk_game, and project_task are valid, stringified JSON strings matching their respective schemas exactly.
Make the block contents detailed, visually rich, and fully complete (do NOT use placeholders like "Write your text here" or "TODO").
`,
  reviewSubmission: `
You are Anka AI, an expert educational coach and mentor. Review the learner's solution and reflection for a Project Task.
Task Title: {{taskTitle}}
Task Scenario: {{taskScenario}}
Task Instructions: {{taskInstructions}}
Success Criteria:
{{successCriteria}}

Learner's Solution:
"{{solution}}"

Learner's Reflection:
"{{reflection}}"

Provide constructive, helpful, and empathetic feedback (in German, always using the informal 'du' / Du-Form).
Structure your feedback clearly:
- **Lob & Stärken**: Was wurde gut gelöst?
- **Potenziale & Abgleich**: Wo gibt es noch Lücken bezüglich der Erfolgskriterien?
- **Nächster Schritt**: Ein konkreter, praktischer Ratschlag zur Verbesserung oder Weiterführung.

Halte das Feedback ermutigend, professionell und kurz (ca. 100-150 Wörter). Nutze Markdown für die Formatierung.
`
};
