import { Brain, Star, Clock, Trophy, Target, Sparkles } from "lucide-react";
import { store } from "@/lib/store";
import { CourseListClient } from "@/components/trainer/course-list-client";
import { GDPRControls } from "@/components/learner/gdpr-controls";

export const dynamic = 'force-dynamic';

export default async function LearnerDashboard() {
  const courses = await store.getCourses();
  const reflections = await store.getReflections("learner-1");

  // Get all completed blocks count across all courses
  const publishedCourses = courses.filter(c => c.status === "published");
  let completedBlocksCount = 0;
  let totalPunkGamesCompleted = 0;
  let totalQuizzesCompleted = 0;
  
  for (const course of publishedCourses) {
    const userProgress = await store.getUserProgress("learner-1", course.id);
    completedBlocksCount += userProgress.completedBlocks.length;
    
    // Fetch blocks of this course modules to match types
    const modules = await store.getModules(course.id);
    for (const mod of modules) {
      const blocks = await store.getBlocks(mod.id);
      for (const block of blocks) {
        if (userProgress.completedBlocks.includes(block.id)) {
          if (block.type === "punk_game") totalPunkGamesCompleted++;
          if (block.type === "quiz") totalQuizzesCompleted++;
        }
      }
    }
  }

  // Calculate scores (baseline 20 for empty states, increments based on actual work)
  const criticalThinking = Math.min(100, reflections.length * 20 + 20);
  const complexProblemSolving = Math.min(100, totalPunkGamesCompleted * 25 + 20);
  const aiLiteracy = Math.min(100, totalQuizzesCompleted * 20 + 20);
  const agileMindset = Math.min(100, completedBlocksCount * 5 + 20);

  const futureSkills = [
    { name: "Critical Thinking", score: criticalThinking, icon: Brain, color: "text-plum bg-plum/10 border-plum/20", progressColor: "bg-plum" },
    { name: "Complex Problem Solving", score: complexProblemSolving, icon: Target, color: "text-emerald-green bg-emerald-green/10 border-emerald-green/20", progressColor: "bg-emerald-green" },
    { name: "AI Literacy", score: aiLiteracy, icon: Sparkles, color: "text-royal-blue bg-royal-blue/10 border-royal-blue/20", progressColor: "bg-royal-blue" },
    { name: "Agile Mindset", score: agileMindset, icon: Trophy, color: "text-amber-600 bg-amber-50 border-amber-200", progressColor: "bg-amber-500" }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">My Learning Journeys</h1>
        <p className="text-slate-600">Explore your journeys, build capability, and track your future skills progress.</p>
      </div>

      {/* Future Skills Progress Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-royal-blue" />
          <h2 className="font-heading font-bold text-slate-800 text-lg">My Future Skills Competence Signals</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {futureSkills.map((skill) => {
            const Icon = skill.icon;
            return (
              <div key={skill.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg border ${skill.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-bold text-slate-800">{skill.score}%</span>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">{skill.name}</h4>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${skill.progressColor}`} style={{ width: `${skill.score}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 italic">
          * Competence levels are dynamically calculated based on your module completions, quiz performance, and reflections.
        </p>
      </div>

      {/* Courses Catalog */}
      <div className="space-y-6">
        <h3 className="text-xl font-heading font-bold text-slate-800">Published Learning Journeys</h3>
        <CourseListClient courses={publishedCourses} role="learner" />
      </div>

      {/* GDPR Data controls */}
      <GDPRControls reflections={reflections} completedBlocksCount={completedBlocksCount} />
    </div>
  );
}
