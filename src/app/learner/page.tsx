import { store } from "@/lib/store";
import Link from "next/link";
import { Brain, Star, Clock, Trophy, Target, Sparkles, LogOut, ArrowRight } from "lucide-react";
import { GDPRControls } from "@/components/learner/gdpr-controls";
import { I, Mark, AIChip } from "@/components/layout/static-icons";
import { cookies } from "next/headers";
import { translations } from "@/components/layout/translations";
import { getAiImpulseAction } from "@/app/actions/ai-impulse";
import { verifySession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export default async function LearnerDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;
  const userId = user?.id || "learner-1";

  const courses = await store.getCourses();
  const reflections = await store.getReflections(userId);
  const visibleCourses = courses.filter(c => 
    (c.status === "published" || c.status === "coming_soon") &&
    (!c.isCustom || c.learnerId === userId)
  );

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

  // Format current date based on language
  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === "de" ? 'de-DE' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).toUpperCase();

  const reflectionTexts = reflections.map(r => r.content);
  const aiImpulse = await getAiImpulseAction(reflectionTexts, lang);

  // Calculate course progress percentages
  const courseProgresses = [];
  let completedBlocksTotal = 0;
  let totalPunkGamesCompleted = 0;
  let totalQuizzesCompleted = 0;

  for (const course of visibleCourses) {
    if (course.status === "coming_soon") {
      courseProgresses.push({
        course,
        percentage: 0,
        totalBlocks: 0
      });
      continue;
    }

    if (course.type === "track") {
      // Skill Track progress calculation
      const sprintIds = course.sprintCourseIds || [];
      let totalBlocks = 0;
      let completedInCourse = 0;
      
      for (const sprintId of sprintIds) {
        const sprint = courses.find(c => c.id === sprintId);
        if (!sprint || sprint.status !== "published") continue;
        
        const userProgress = await store.getUserProgress(userId, sprint.id);
        const modules = await store.getModules(sprint.id);
        
        for (const mod of modules) {
          const blocks = await store.getBlocks(mod.id);
          totalBlocks += blocks.length;
          
          for (const block of blocks) {
            if (userProgress.completedBlocks.includes(block.id)) {
              completedInCourse++;
              completedBlocksTotal++;
              if (block.type === 'punk_game') totalPunkGamesCompleted++;
              if (block.type === 'quiz') totalQuizzesCompleted++;
            }
          }
        }
      }
      
      const percentage = totalBlocks > 0 ? Math.round((completedInCourse / totalBlocks) * 100) : 0;
      courseProgresses.push({
        course,
        percentage,
        totalBlocks
      });
    } else {
      const userProgress = await store.getUserProgress(userId, course.id);
      const modules = await store.getModules(course.id);
      
      let totalBlocks = 0;
      let completedInCourse = 0;

      for (const mod of modules) {
        const blocks = await store.getBlocks(mod.id);
        totalBlocks += blocks.length;
        
        for (const block of blocks) {
          if (userProgress.completedBlocks.includes(block.id)) {
            completedInCourse++;
            completedBlocksTotal++;
            if (block.type === 'punk_game') totalPunkGamesCompleted++;
            if (block.type === 'quiz') totalQuizzesCompleted++;
          }
        }
      }

      const percentage = totalBlocks > 0 ? Math.round((completedInCourse / totalBlocks) * 100) : 0;
      courseProgresses.push({
        course,
        percentage,
        totalBlocks
      });
    }
  }

  const bookedProgresses = courseProgresses.filter(p => p.course.isCustom || p.percentage > 0);

  // Active course progress is the first in-progress course, or first published booked course
  const playableProgresses = bookedProgresses.filter(p => p.course.status === "published");
  const activeCourseProgress = playableProgresses.find(p => p.percentage > 0 && p.percentage < 100) 
    || playableProgresses.find(p => p.percentage === 0) 
    || playableProgresses[0];

  // Find next uncompleted block to resume
  let resumeModuleTitle = t("dashboard.no_active_course");
  let resumeBlockTitle = t("dashboard.no_courses_sub");
  let resumeLink = "/learner/library";
  let resumeProgress = 0;

  if (activeCourseProgress) {
    const courseId = activeCourseProgress.course.id;
    const userProgress = await store.getUserProgress(userId, courseId);
    const modules = await store.getModules(courseId);
    
    let foundResume = false;
    for (const mod of modules) {
      const blocks = await store.getBlocks(mod.id);
      for (const block of blocks) {
        if (!userProgress.completedBlocks.includes(block.id)) {
          resumeModuleTitle = mod.title;
          resumeBlockTitle = block.title;
          resumeLink = `/learner/courses/${courseId}/modules/${mod.id}`;
          foundResume = true;
          break;
        }
      }
      if (foundResume) break;
    }
    resumeProgress = activeCourseProgress.percentage;
  }

  // Adaptive future skills calculation based on completed blocks
  const criticalThinking = Math.min(100, Math.round(totalQuizzesCompleted * 25));
  const complexProblemSolving = Math.min(100, Math.round(totalPunkGamesCompleted * 35));
  const aiLiteracy = Math.min(100, Math.round(completedBlocksTotal * 8));
  const agileMindset = Math.min(100, Math.round(reflections.length * 20));

  const futureSkills = [
    { name: lang === "de" ? "Kritisches Denken" : "Critical Thinking", score: criticalThinking, color: "var(--ink-2)", strokeColor: "bg-plum" },
    { name: lang === "de" ? "Komplexe Problemlösung" : "Complex Problem Solving", score: complexProblemSolving, color: "var(--ink-2)", strokeColor: "bg-emerald-green" },
    { name: "AI Literacy", score: aiLiteracy, color: "var(--ink-2)", strokeColor: "bg-royal-blue" },
    { name: lang === "de" ? "Agiles Mindset" : "Agile Mindset", score: agileMindset, color: "var(--ink-2)", strokeColor: "bg-amber-500" }
  ];

  return (
    <div className="screen">
      {/* TopBar Header */}
      <header className="topbar">
        <div className="tb-left">
          <div>
            <div className="eyebrow">{dateStr}</div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
              {t("nav.home")} Dashboard
            </div>
          </div>
        </div>
        <div className="tb-right">
          <div className="streak">
            <span className="dot"></span>
            <span className="num">{completedBlocksTotal}</span>
            <span className="lbl" style={{ color: "var(--ink-2)", fontWeight: 400 }}>{t("dashboard.activities")}</span>
          </div>
        </div>
      </header>

      {/* Grid Layout (Lattice & Cells) */}
      <div className="lattice hero-grid">
        {/* Left Welcome Cell */}
        <div className="cell">
          <div className="eyebrow" style={{ marginBottom: 18 }}>{t("dashboard.welcome_back")}</div>
          <h1 className="display hero-display">
            {lang === "de" ? (
              <>Was wirst du<br/>heute <span className="stroke">erschaffen</span>?</>
            ) : (
              <>What will you<br/>create <span className="stroke">today</span>?</>
            )}
          </h1>
          <p className="lede" style={{ marginTop: 22, maxWidth: 520 }}>
            {t("dashboard.hero_desc")}
          </p>
        </div>

        {/* Right Continue Card */}
        <div className="cell blue">
          <span className="corner-no" style={{ color: "color-mix(in oklab, var(--on-blue) 70%, transparent)" }}>{t("dashboard.current")}</span>
          
          <div className="continue">
            <div className="meta">
              <span className="eyebrow" style={{ color: "color-mix(in oklab, var(--on-blue) 70%, transparent)" }}>
                {t("dashboard.resume")} · {activeCourseProgress?.course.title || t("dashboard.no_active_course")}
              </span>
            </div>
            <div>
              <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--on-blue) 70%, transparent)", marginBottom: 8 }}>
                {resumeModuleTitle}
              </div>
              <div className="title truncate max-w-xs">{resumeBlockTitle}</div>
            </div>
            <div>
              <div className="progress-line">
                <i style={{ width: `${resumeProgress}%` }}></i>
              </div>
              <div className="num" style={{ fontSize: 12, marginTop: 8, opacity: .8 }}>
                {resumeProgress}% {t("dashboard.completed")}
              </div>
            </div>
            
            {activeCourseProgress ? (
              <Link href={resumeLink} className="resume">
                {t("dashboard.continue")} <I.arrow className="arrow" style={{ width: 22, height: 22 }} />
              </Link>
            ) : (
              <Link href="/learner/library" className="resume">
                {t("dashboard.library_btn")} <I.arrow className="arrow" style={{ width: 22, height: 22 }} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Future Skills Competence Signals */}
      <div className="sec-head">
        <h2>{t("dashboard.skills_title")}</h2>
        <span className="meta">{t("dashboard.skills_signals")}</span>
      </div>
      <div className="pad">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 bg-line border border-line">
          {futureSkills.map((skill) => (
            <div key={skill.name} className="cell tight bg-paper flex flex-col justify-between min-h-[140px] p-5">
              <div className="flex justify-between items-start w-full">
                <span className="eyebrow font-mono text-[10px] text-ink-3">{skill.name}</span>
                <span className="num font-bold text-lg">{skill.score}%</span>
              </div>
              <div className="w-full space-y-2 mt-4">
                <div className="progress-line bg-paper-3 h-1 rounded-full overflow-hidden">
                  <div className={`h-full ${skill.strokeColor}`} style={{ width: `${skill.score}%` }}></div>
                </div>
                <div className="text-[9px] text-ink-3 font-mono tracking-wide uppercase">{t("dashboard.skills_strength")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lern-Impulse & Reality Check */}
      <div className="sec-head animate-reveal">
        <h2>{lang === "de" ? "Lern-Impulse & Reality Check" : "Learning Insights & Reality Check"}</h2>
        <span className="meta">POWERED BY INNOVERSITY AI</span>
      </div>
      <div className="pad animate-reveal" style={{ marginBottom: 30 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 bg-line border border-line">
          {/* Card 1: AI Didaktischer Rückblick */}
          <div className="cell bg-paper p-5 flex flex-col justify-between min-h-[140px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow font-mono text-[9px] text-blue font-bold tracking-wider uppercase">
                  {lang === "de" ? "Didaktischer Rückblick" : "Didactic Review"}
                </span>
                <Sparkles className="w-4 h-4 text-blue/40" style={{ color: "var(--blue)" }} />
              </div>
              <p className="text-xs text-ink leading-relaxed font-mono">
                "{aiImpulse.reminder}"
              </p>
            </div>
            <div className="text-[8px] text-ink-3 font-mono tracking-wide uppercase mt-4">
              {lang === "de" ? "Fokus auf deine Lernschwerpunkte" : "Focus on your learning key points"}
            </div>
          </div>

          {/* Card 2: Reality Check / Anti-Motivation */}
          <div className="cell bg-paper p-5 flex flex-col justify-between min-h-[140px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow font-mono text-[9px] text-coral font-bold tracking-wider uppercase">
                  Reality Check
                </span>
                <Brain className="w-4 h-4 text-coral/40" style={{ color: "var(--coral)" }} />
              </div>
              <p className="text-xs text-ink-2 leading-relaxed italic">
                "{aiImpulse.antiMotivation}"
              </p>
            </div>
            <div className="text-[8px] text-ink-3 font-mono tracking-wide uppercase mt-4">
              {lang === "de" ? "Humor ist der beste Lernbegleiter" : "Humor is the best learning companion"}
            </div>
          </div>
        </div>
      </div>

      {/* Library Preview */}
      <div className="sec-head">
        <h2>{lang === "de" ? "Meine Lernpfade" : "My Learning Paths"}</h2>
        <span className="meta">{lang === "de" ? "AKTIVE KURSE & KETTEN" : "ACTIVE COURSES & TRACKS"} · {bookedProgresses.length}</span>
      </div>
      
      {bookedProgresses.length === 0 ? (
        <div className="pad">
          <div className="p-8 text-center bg-paper-2 border border-line-soft rounded-2xl flex flex-col items-center gap-3">
            <p className="text-xs text-ink-2 max-w-sm">
              {lang === "de" 
                ? "Du hast noch keine Lernpfade gestartet. Gehe in die Bibliothek, um einen Kurs zu beginnen oder einen eigenen Skill Track zu erstellen!" 
                : "You haven't started any learning paths yet. Visit the library to start a course or build your own custom Skill Track!"}
            </p>
            <Link href="/learner/library" className="btn blue text-[11px] font-mono font-bold uppercase tracking-wider py-2 px-4 rounded-xl mt-2 inline-flex">
              {lang === "de" ? "Zur Bibliothek" : "Go to Library"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="courses border-t border-b border-line">
          {bookedProgresses.map((p, idx) => {
            const course = p.course;
            const cardColor = idx % 3 === 0 ? "blue" : idx % 3 === 1 ? "ink" : "coral";
            const imageUrl = course.imageUrl;
            const isComingSoon = course.status === "coming_soon";
            const displayIdx = String(idx + 1).padStart(2, '0');

            if (isComingSoon) {
              if (imageUrl) {
                return (
                  <div className="poster photo cursor-not-allowed opacity-80" key={course.id}>
                    <div 
                      className="absolute inset-0 bg-cover bg-center z-0 filter grayscale-[40%]" 
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-black/45 z-10 flex items-center justify-center backdrop-blur-[2px] rounded-2xl">
                      <span className="text-white font-mono font-bold tracking-widest text-[11px] uppercase bg-black/60 px-4 py-2 border border-white/20 rounded-xl">
                        COMING SOON
                      </span>
                    </div>
                    <div className="pinner relative z-20">
                      <div className="top">
                        <span className="no">№ {displayIdx}</span>
                        <span className="tag">{course.category || "General"}</span>
                      </div>
                      <div className="ptitle text-white/95">{course.title}</div>
                      <div className="pmeta mt-auto flex flex-wrap gap-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 border border-white/40">
                          {course.type === "sprint" ? "Sprint" : course.type === "track" ? "Track" : "Standard"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className={`poster ${cardColor} cursor-not-allowed opacity-85 relative`} key={course.id}>
                  <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-2xl">
                    <span className="text-white font-mono font-bold tracking-widest text-[10px] uppercase bg-black/60 px-3 py-1.5 border border-white/10 rounded-xl">
                      COMING SOON
                    </span>
                  </div>
                  <div className="top relative z-20">
                    <span className="no">№ {displayIdx}</span>
                    <span className="tag">{course.category || "General"}</span>
                  </div>
                  <div className="ptitle relative z-20">{course.title}</div>
                  <div className="pmeta mt-auto relative z-20 flex flex-wrap gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-current/10 border border-current/30">
                      {course.type === "sprint" ? "Sprint" : course.type === "track" ? "Track" : "Standard"}
                    </span>
                  </div>
                </div>
              );
            }

            if (imageUrl) {
              return (
                <Link href={`/learner/courses/${course.id}`} className="poster photo" key={course.id}>
                  <div 
                    className="absolute inset-0 bg-cover bg-center z-0" 
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                  <div className="pinner">
                    <div className="top">
                      <span className="no">№ {displayIdx}</span>
                      <span className="tag">{course.category || "General"}</span>
                    </div>
                    <div className="ptitle">{course.title}</div>
                    <div className="pmeta">
                      <span>{t("dashboard.paths_blocks", { count: p.totalBlocks.toString() })}</span>
                      <span>{t("dashboard.paths_done", { percentage: p.percentage.toString() })}</span>
                    </div>
                    {p.percentage > 0 && (
                      <div className="pbar"><i style={{ width: `${p.percentage}%` }}></i></div>
                    )}
                  </div>
                </Link>
              );
            }

            return (
              <Link href={`/learner/courses/${course.id}`} className={`poster ${cardColor}`} key={course.id}>
                <div className="top">
                  <span className="no">№ {displayIdx}</span>
                  <span className="tag">{course.category || "General"}</span>
                </div>
                <div className="ptitle">{course.title}</div>
                <div className="pmeta mt-auto">
                  <span>{t("dashboard.paths_blocks", { count: p.totalBlocks.toString() })}</span>
                  <span>{t("dashboard.paths_done", { percentage: p.percentage.toString() })}</span>
                </div>
                {p.percentage > 0 ? (
                  <div className="pbar"><i style={{ width: `${p.percentage}%` }}></i></div>
                ) : (
                  <div className="pmeta" style={{ marginTop: 14, opacity: .7 }}>
                    <span>{course.targetGroup}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Daily Training Teaser */}
      <div className="sec-head">
        <h2>{t("dashboard.practice_title")}</h2>
        <span className="meta">{t("dashboard.practice_title").toUpperCase()}</span>
      </div>
      
      <div className="pad">
        <div className="lattice teaser-grid border border-line">
          <div className="cell ink flex flex-col justify-between gap-6 p-6 min-h-[220px]">
            <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--paper) 70%, transparent)" }}>TRAINING WORKSHOP</div>
            <h2 className="h-lg" style={{ fontSize: "clamp(24px, 3.4vw, 40px)", textTransform: "uppercase", lineHeight: 0.95 }}>
              {t("dashboard.train_teaser_title")}
            </h2>
            <Link href="/learner/practice" className="btn coral self-start">
              {t("dashboard.practice_btn")} <I.arrow className="arrow" style={{ width: 18, height: 18 }} />
            </Link>
          </div>
          
          <div className="cell flex flex-col justify-center gap-4 p-6 bg-paper">
            <div className="eyebrow">{t("dashboard.train_teaser_weekly")}</div>
            <div className="flex gap-2.5 items-end h-24">
              {[40, 65, 30, 80, 55, 90, 20].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded ${i === 5 ? "bg-coral" : "bg-paper-3"}`} 
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
            <div className="num" style={{ fontSize: 12, color: "var(--ink-2)" }}>{t("dashboard.train_teaser_active", { activeCount: "6", totalCount: "7" })}</div>
          </div>
        </div>
      </div>

      {/* GDPR Data Controls Panel */}
      <div className="sec-head">
        <h2>{t("dashboard.privacy_title")}</h2>
        <span className="meta">{t("dashboard.privacy_meta")}</span>
      </div>
      <div className="pad">
        <div className="cell border border-line bg-paper p-6">
          <GDPRControls userId={userId} reflections={reflections} completedBlocksCount={completedBlocksTotal} />
        </div>
      </div>
    </div>
  );
}
