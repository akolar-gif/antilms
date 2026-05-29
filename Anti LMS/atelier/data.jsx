/* ATELIER — data model (creativity courses) */

const COURSES = [
  {
    id:"creative-mind", no:"01", color:"blue", tag:"Foundations", kw:"creative,art,abstract", lock:11,
    title:"The Creative Mind", lessons:8, minutes:96, level:"Beginner",
    progress:0.38, ai:false,
    blurb:"How original ideas actually form — and how to make more of them on purpose.",
  },
  {
    id:"visual-thinking", no:"02", color:"paper", tag:"Practice", photo:true, slot:"cover-visual", kw:"sketch,drawing,notebook", lock:24,
    title:"Visual Thinking", lessons:6, minutes:72, level:"All levels",
    progress:0.0, ai:false,
    blurb:"Think with your hands. Sketch ideas faster than you can second-guess them.",
  },
  {
    id:"storytelling", no:"03", color:"ink", tag:"Craft", kw:"writing,books,typewriter", lock:33,
    title:"The Art of Storytelling", lessons:7, minutes:84, level:"Intermediate",
    progress:0.62, ai:false,
    blurb:"Structure, tension, and the shapes every great story secretly shares.",
  },
  {
    id:"ideation", no:"04", color:"paper", tag:"Method", kw:"brainstorm,notes,sticky", lock:42,
    title:"Ideation Engines", lessons:5, minutes:55, level:"Beginner",
    progress:0.0, ai:true,
    blurb:"Brainstorming systems that reliably out-produce the blank page.",
  },
  {
    id:"confidence", no:"05", color:"coral", tag:"Mindset", kw:"artist,studio,portrait", lock:55,
    title:"Creative Confidence", lessons:6, minutes:66, level:"All levels",
    progress:0.18, ai:false,
    blurb:"Quiet the inner critic. Ship work before it's ready and learn in public.",
  },
  {
    id:"composition", no:"06", color:"paper", tag:"Visual", photo:true, slot:"cover-composition", kw:"color,paint,abstract", lock:66,
    title:"Color & Composition", lessons:9, minutes:110, level:"Intermediate",
    progress:0.0, ai:false,
    blurb:"The grammar of looking — balance, rhythm, contrast, and restraint.",
  },
];

// AI-tuned path on the dashboard
const PATH = [
  { k:"PREV", title:"Constraints as Fuel", why:"You finished this — 100%.", done:true },
  { k:"NOW",  title:"Borrowing & Remixing", why:"Picks up where you left off in The Creative Mind.", done:false },
  { k:"NEXT", title:"Ideation Engines", why:"AI suggests this next — builds on remixing.", done:false },
  { k:"SOON", title:"Daily sketch habit", why:"A 10-min practice to lock in what you learn.", done:false },
];

// Lessons for the open course (The Creative Mind)
const LESSONS = [
  { n:"01", t:"Where Ideas Come From", s:"Combinatorial creativity, demystified.", min:11, state:"done" },
  { n:"02", t:"The Myth of the Lone Genius", s:"Why every idea has parents.", min:13, state:"done" },
  { n:"03", t:"Constraints as Fuel", s:"How limits make you more inventive.", min:12, state:"done" },
  { n:"04", t:"Borrowing & Remixing", s:"Steal like an artist, ethically.", min:14, state:"now" },
  { n:"05", t:"The Adjacent Possible", s:"Why timing shapes what's thinkable.", min:12, state:"todo" },
  { n:"06", t:"Incubation & Rest", s:"Letting the back of your mind work.", min:10, state:"todo" },
  { n:"07", t:"From Idea to Output", s:"Closing the gap between thought and thing.", min:13, state:"todo" },
  { n:"08", t:"Building a Creative Practice", s:"Make it a habit, not a mood.", min:11, state:"todo" },
];

// Reading content for the "now" lesson
const READING = {
  no:"LESSON 04 · THE CREATIVE MIND",
  title:"Borrowing & Remixing",
  body:[
    { type:"p", text:"Every new idea is built from old parts. The painter borrows a palette, the songwriter borrows a chord progression, the founder borrows a business model and points it somewhere new. Originality is not creation from nothing — it is combination nobody has tried yet." },
    { type:"h", text:"The remix is the unit of creativity" },
    { type:"p", text:"When you stop trying to invent from a blank slate and start collecting raw material — phrases, images, methods, mistakes — your job shifts from \"think of something\" to \"connect these.\" That is a far easier and far more reliable task." },
    { type:"pull", text:"You can't connect dots you haven't collected. Inputs decide outputs." },
    { type:"img", cap:"diagram — two distant ideas connecting into a new one" },
    { type:"h", text:"Borrowing ethically" },
    { type:"p", text:"There's a line between remixing and copying, and it's about transformation. Take the structure, not the surface. Honour your sources. The goal is to absorb influences so thoroughly that what comes out the other side is unmistakably yours." },
    { type:"p", text:"In the practice below, the AI tutor will challenge you to remix two unrelated fields into a single idea — the core muscle of this entire course." },
  ],
};

const QUIZ = [
  {
    q:"What is the core claim behind \u201Cborrowing & remixing\u201D?",
    opts:[
      "Truly original ideas appear from nothing",
      "New ideas are novel combinations of existing parts",
      "Copying others is the fastest path to mastery",
      "Creativity can't be taught or practiced",
    ],
    correct:1,
    fb:"Exactly. Creativity is <b>combinatorial</b> — you're connecting collected material in ways no one has tried, not summoning ideas from a void. That's why your inputs (what you read, see, and notice) shape the ceiling of your output.",
    fbWrong:"Not quite. The lesson argues creativity is <b>combinatorial</b> — new ideas are fresh combinations of existing parts. Originality comes from the connection, not from inventing from nothing.",
  },
  {
    q:"What separates remixing from simply copying?",
    opts:[
      "The number of sources you use",
      "Whether you credit the original",
      "Transformation — taking structure, not surface",
      "How long you spend on it",
    ],
    correct:2,
    fb:"Right. The line is <b>transformation</b>: borrow the underlying structure and point it somewhere new, rather than lifting the surface. Crediting sources matters too, but transformation is what makes the work yours.",
    fbWrong:"Close, but the key idea is <b>transformation</b> — taking the deep structure rather than the surface, and making something unmistakably new from it.",
  },
  {
    q:"Why does the lesson say \u201Cinputs decide outputs\u201D?",
    opts:[
      "Because you can only connect dots you've collected",
      "Because faster typing means more ideas",
      "Because rest is unnecessary for creativity",
      "Because talent is fixed at birth",
    ],
    correct:0,
    fb:"Yes — you <b>can't connect dots you haven't collected</b>. Widening and diversifying your inputs is the most reliable way to get richer, more surprising combinations out the other side.",
    fbWrong:"Reconsider — the point is that you can only combine raw material you've actually gathered. <b>Inputs decide outputs</b>: richer inputs, richer ideas.",
  },
];

// canned AI generation outline for the Create screen
const GEN_OUTLINE = {
  title:"Designing With Constraints",
  meta:"6 lessons · ~70 min · Beginner-friendly",
  rows:[
    { t:"Why limits unlock ideas", d:"The counter-intuitive psychology of creative constraints." },
    { t:"The brief as a creative tool", d:"Turning vague goals into sharp, generative problems." },
    { t:"Budget, time & medium", d:"Working with the three constraints you can't escape." },
    { t:"Self-imposed rules", d:"Inventing your own limits to break creative blocks." },
    { t:"Case studies", d:"How great work emerged from tight boxes." },
    { t:"Your constrained project", d:"A guided brief to make something this week." },
  ],
};

Object.assign(window, { COURSES, PATH, LESSONS, READING, QUIZ, GEN_OUTLINE });
