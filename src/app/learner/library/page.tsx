import { store } from "@/lib/store";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { I, AIChip } from "@/components/layout/static-icons";
import { cookies } from "next/headers";
import { translations } from "@/components/layout/translations";

export const dynamic = 'force-dynamic';

export default async function LearnerLibraryPage() {
  const courses = await store.getCourses();
  const publishedCourses = courses.filter(c => c.status === "published");

  const cookieStore = await cookies();
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

  // Calculate progress for each published course
  const courseProgresses = [];
  for (const course of publishedCourses) {
    const userProgress = await store.getUserProgress("learner-1", course.id);
    const modules = await store.getModules(course.id);
    
    let totalBlocks = 0;
    let completedInCourse = 0;

    for (const mod of modules) {
      const blocks = await store.getBlocks(mod.id);
      totalBlocks += blocks.length;
      completedInCourse += blocks.filter(b => userProgress.completedBlocks.includes(b.id)).length;
    }

    const percentage = totalBlocks > 0 ? Math.round((completedInCourse / totalBlocks) * 100) : 0;
    courseProgresses.push({
      course,
      percentage,
      totalBlocks,
      completedInCourse
    });
  }

  const inProgress = courseProgresses.filter(p => p.percentage > 0 && p.percentage < 100);

  return (
    <div className="screen">
      {/* TopBar Header */}
      <header className="topbar">
        <div className="tb-left">
          <div>
            <div className="eyebrow">{t("library.eyebrow")}</div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
              {t("library.title")}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Lattice Grid */}
      <div className="lattice" style={{ gridTemplateColumns: "1fr" }}>
        <div className="cell">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {t("library.hero_meta", { count: publishedCourses.length.toString(), active: inProgress.length.toString() })}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 72px)" }}>{t("library.title_main")}</h1>
          <p className="lede" style={{ maxWidth: 520, marginTop: 18 }}>
            {t("library.hero_desc")}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
            <Link href="/trainer?create=true" className="btn blue">
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> {t("library.create_btn")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <>
          <div className="sec-head">
            <h2>{t("library.in_progress")}</h2>
            <span className="meta">IN PROGRESS</span>
          </div>
          <div className="courses border-t border-b border-line">
            {inProgress.map((p, idx) => {
              const course = p.course;
              const cardColor = idx % 3 === 0 ? "blue" : idx % 3 === 1 ? "ink" : "coral";
              const imageUrl = course.imageUrl;
              
              if (imageUrl) {
                return (
                  <Link href={`/learner/courses/${course.id}`} className="poster photo" key={course.id}>
                    <div 
                      className="absolute inset-0 bg-cover bg-center z-0" 
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    <div className="pinner">
                      <div className="top">
                        <span className="no">№ {String(idx + 1).padStart(2, '0')}</span>
                        <span className="tag">{course.category || "General"}</span>
                      </div>
                      <div className="ptitle">{course.title}</div>
                      <div className="pmeta">
                        <span>{p.totalBlocks} {lang === "de" ? "Blöcke" : "Blocks"}</span>
                        <span>{p.percentage}% {t("dashboard.completed")}</span>
                      </div>
                      <div className="pbar"><i style={{ width: `${p.percentage}%` }}></i></div>
                    </div>
                  </Link>
                );
              }

              return (
                <Link href={`/learner/courses/${course.id}`} className={`poster ${cardColor}`} key={course.id}>
                  <div className="top">
                    <span className="no">№ {String(idx + 1).padStart(2, '0')}</span>
                    <span className="tag">{course.category || "General"}</span>
                  </div>
                  <div className="ptitle">{course.title}</div>
                  <div className="pmeta mt-auto">
                    <span>{p.totalBlocks} {lang === "de" ? "Blöcke" : "Blocks"}</span>
                    <span>{p.percentage}% {t("dashboard.completed")}</span>
                  </div>
                  <div className="pbar"><i style={{ width: `${p.percentage}%` }}></i></div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* All Courses Section */}
      <div className="sec-head">
        <h2>{t("library.all_paths")}</h2>
        <span className="meta">№ {String(publishedCourses.length).padStart(2, "0")} {lang === "de" ? "KURSE" : "COURSES"}</span>
      </div>
      
      {publishedCourses.length === 0 ? (
        <div className="pad">
          <div className="p-8 text-center bg-paper-2 border border-line-soft rounded-2xl">
            <p className="text-sm text-ink-2">{t("library.no_published")}</p>
          </div>
        </div>
      ) : (
        <div className="courses border-t border-b border-line">
          {courseProgresses.map((p, idx) => {
            const course = p.course;
            const cardColor = idx % 3 === 0 ? "blue" : idx % 3 === 1 ? "ink" : "coral";
            const imageUrl = course.imageUrl;
            
            if (imageUrl) {
              return (
                <Link href={`/learner/courses/${course.id}`} className="poster photo" key={course.id}>
                  <div 
                    className="absolute inset-0 bg-cover bg-center z-0" 
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                  <div className="pinner">
                    <div className="top">
                      <span className="no">№ {String(idx + 1).padStart(2, '0')}</span>
                      <span className="tag">{course.category || "General"}</span>
                    </div>
                    <div className="ptitle">{course.title}</div>
                    <div className="pmeta">
                      <span>{p.totalBlocks} {lang === "de" ? "Blöcke" : "Blocks"}</span>
                      <span>{p.percentage}% {t("dashboard.completed")}</span>
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
                  <span className="no">№ {String(idx + 1).padStart(2, '0')}</span>
                  <span className="tag">{course.category || "General"}</span>
                </div>
                <div className="ptitle">{course.title}</div>
                <div className="pmeta mt-auto">
                  <span>{p.totalBlocks} {lang === "de" ? "Blöcke" : "Blocks"}</span>
                  <span>{p.percentage}% {t("dashboard.completed")}</span>
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
    </div>
  );
}
