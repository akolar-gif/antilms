import { store } from "@/lib/store";
import { cookies } from "next/headers";
import { translations } from "@/components/layout/translations";
import { verifySession } from "@/lib/session";
import { LearnerDashboardClient } from "@/components/learner/learner-dashboard-client";

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

  // Format current date based on language
  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === "de" ? 'de-DE' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).toUpperCase();

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

  // Filter booked courses
  const bookedProgresses = courseProgresses.filter(p => p.course.isCustom || p.percentage > 0);

  // Active course progress
  const playableProgresses = bookedProgresses.filter(p => p.course.status === "published");
  const activeCourseProgress = playableProgresses.find(p => p.percentage > 0 && p.percentage < 100) 
    || playableProgresses.find(p => p.percentage === 0) 
    || playableProgresses[0];

  // Find next uncompleted block to resume
  let resumeModuleTitle = dict["dashboard.no_active_course"] || "Kein aktiver Kurs";
  let resumeBlockTitle = dict["dashboard.no_courses_sub"] || "Gehe in die Bibliothek, um einen Kurs zu starten.";
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

  // Adaptive future skills calculation
  const criticalThinking = Math.min(100, Math.round(totalQuizzesCompleted * 25));
  const complexProblemSolving = Math.min(100, Math.round(totalPunkGamesCompleted * 35));
  const aiLiteracy = Math.min(100, Math.round(completedBlocksTotal * 8));
  const agileMindset = Math.min(100, Math.round(reflections.length * 20));

  return (
    <LearnerDashboardClient
      user={user}
      reflections={reflections}
      completedBlocksTotal={completedBlocksTotal}
      courseProgresses={courseProgresses}
      bookedProgresses={bookedProgresses}
      activeCourseProgress={activeCourseProgress}
      resumeModuleTitle={resumeModuleTitle}
      resumeBlockTitle={resumeBlockTitle}
      resumeLink={resumeLink}
      resumeProgress={resumeProgress}
      criticalThinking={criticalThinking}
      complexProblemSolving={complexProblemSolving}
      aiLiteracy={aiLiteracy}
      agileMindset={agileMindset}
      dateStr={dateStr}
      lang={lang}
      translationsDict={dict}
    />
  );
}
