import { store } from "@/lib/store";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { translations } from "@/components/layout/translations";
import Link from "next/link";
import { verifySession } from "@/lib/session";
import { Lock, CheckCircle, PlayCircle, ArrowRight } from "lucide-react";
import { CourseBookingWall } from "@/components/learner/course-booking-wall";

export default async function LearnerCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await store.getCourse(courseId);
  
  if (!course) {
    redirect("/learner/library");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;
  const userId = user?.id || "learner-1";
  const lang = (cookieStore.get("lang")?.value || "de") as "de" | "en";
  const dict = translations[lang] || translations.de;
  const t = (key: keyof typeof translations.de, params?: Record<string, string>) => {
    let text = dict[key] || translations.de[key] || String(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  const userRole = user?.role || "learner";
  const isApproved = user?.approved || false;

  const isLocked = !(
    userRole === "trainer" || 
    userRole === "admin" || 
    course.isCustom || 
    isApproved || 
    await store.isCourseBooked(userId, courseId)
  );

  if (isLocked) {
    const modules = await store.getModules(courseId);
    return (
      <div className="flex-1 bg-paper min-h-[calc(100vh-4rem)] p-8">
        <CourseBookingWall 
          courseId={courseId}
          userId={userId}
          courseTitle={course.title}
          courseDescription={course.description || ""}
          courseCategory={course.category}
          modulesCount={modules.length}
          lang={lang}
        />
      </div>
    );
  }

  if (course.type === "track") {
    // Render Skill Track page
    const sprintIds = course.sprintCourseIds || [];
    const sprints = [];
    
    let previousCompleted = true; // First sprint is always unlocked
    
    for (let i = 0; i < sprintIds.length; i++) {
      const sprintId = sprintIds[i];
      const sprint = await store.getCourse(sprintId);
      if (!sprint) continue;

      // Calculate progress for this sprint
      const userProgress = await store.getUserProgress(userId, sprint.id);
      const modules = await store.getModules(sprint.id);
      
      let totalBlocks = 0;
      let completedInCourse = 0;
      for (const mod of modules) {
        const blocks = await store.getBlocks(mod.id);
        totalBlocks += blocks.length;
        completedInCourse += blocks.filter(b => userProgress.completedBlocks.includes(b.id)).length;
      }
      
      const percentage = totalBlocks > 0 ? Math.round((completedInCourse / totalBlocks) * 100) : 0;
      const isCompleted = totalBlocks > 0 && percentage === 100;
      const isLocked = !previousCompleted;

      sprints.push({
        ...sprint,
        percentage,
        totalBlocks,
        isCompleted,
        isLocked
      });

      // Update previousCompleted for the next sprint in the sequence
      previousCompleted = isCompleted;
    }

    return (
      <div className="flex-1 bg-paper min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-500/20 text-blue bg-blue-500/5 uppercase tracking-wider">
                Skill Track
              </span>
              <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">
                {course.category}
              </span>
            </div>
            <h1 className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-ink">
              {course.title}
            </h1>
            <p className="text-sm text-ink-2 max-w-xl leading-relaxed mt-2">
              {course.description || (lang === "de" ? "Folge dieser aufeinander aufbauenden Reihe von Skill Sprints." : "Follow this sequential learning track of skill sprints.")}
            </p>
          </div>

          {/* Sprints Timeline */}
          <div className="flex flex-col gap-6 relative pl-8 border-l border-line mt-4">
            {sprints.map((sprint, idx) => {
              return (
                <div key={sprint.id} className="relative">
                  {/* Timeline bullet */}
                  <div className={`absolute -left-[41px] top-4 w-6 h-6 rounded-full border-2 bg-paper flex items-center justify-center font-mono text-xs font-bold ${
                    sprint.isCompleted 
                      ? "border-emerald text-emerald-green" 
                      : sprint.isLocked 
                        ? "border-line-soft text-ink-3" 
                        : "border-blue text-blue"
                  }`}>
                    {sprint.isCompleted ? "✓" : String(idx + 1).padStart(2, "0")}
                  </div>

                  {/* Sprint Card */}
                  {sprint.isLocked ? (
                    <div className="bg-paper-2 border border-line-soft rounded-2xl p-6 opacity-75 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-ink uppercase">{sprint.title}</span>
                          <Lock className="w-3.5 h-3.5 text-ink-3" />
                        </div>
                        <span className="text-[10px] font-mono text-ink-3 font-semibold uppercase">{lang === "de" ? "Gesperrt" : "Locked"}</span>
                      </div>
                      <p className="text-xs text-ink-3">
                        {lang === "de" ? "Schließe den vorherigen Sprint ab, um diesen Lernpfad freizuschalten." : "Complete the previous sprint to unlock this learning path."}
                      </p>
                    </div>
                  ) : (
                    <Link 
                      href={`/learner/courses/${sprint.id}`} 
                      className="block bg-paper border border-line hover:border-blue rounded-2xl p-6 transition-all hover:shadow-soft flex flex-col gap-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-ink uppercase group-hover:text-blue transition-colors text-lg">
                          {sprint.title}
                        </span>
                        
                        {sprint.isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-green-d font-mono font-bold uppercase">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald" />
                            {lang === "de" ? "Abgeschlossen" : "Completed"}
                          </span>
                        ) : sprint.percentage > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-blue font-mono font-bold uppercase">
                            <PlayCircle className="w-3.5 h-3.5" />
                            {sprint.percentage}% {lang === "de" ? "Gestartet" : "In Progress"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-ink-2 font-mono font-bold uppercase">
                            {lang === "de" ? "Bereit" : "Start"}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-2 line-clamp-2">
                        {sprint.description || sprint.targetGroup}
                      </p>
                      {sprint.percentage > 0 && (
                        <div className="w-full bg-paper-3 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-blue h-full transition-all" style={{ width: `${sprint.percentage}%` }}></div>
                        </div>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Standard course behavior
  const modules = await store.getModules(courseId);
  
  if (modules.length > 0) {
    redirect(`/learner/courses/${courseId}/modules/${modules[0].id}`);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-royal-blue/10 text-royal-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          🚀
        </div>
        <h3 className="text-xl font-heading font-bold text-slate-800 mb-2">{t("library.welcome_journey")}</h3>
        <p className="text-slate-500">
          {t("library.trainer_preparing")}
        </p>
      </div>
    </div>
  );
}
