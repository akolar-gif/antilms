import { store } from "@/lib/store";
import { CreateCourseForm } from "@/components/trainer/create-course-form";
import { CourseListClient } from "@/components/trainer/course-list-client";
import { cookies } from "next/headers";
import { translations } from "@/components/layout/translations";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TrainerDashboard({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const autoCreate = resolvedSearchParams?.create === "true";
  const courses = await store.getCourses();

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

  return (
    <div className="screen">
      {/* TopBar Header */}
      <header className="topbar">
        <div className="tb-left">
          <div>
            <div className="eyebrow">{t("trainer.subtitle")}</div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
              {t("trainer.workspace")}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Lattice Grid */}
      <div className="lattice" style={{ gridTemplateColumns: "1fr" }}>
        <div className="cell">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {t("trainer.courses_total", { count: courses.length.toString() })}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 72px)" }}>{t("trainer.title")}</h1>
          <p className="lede" style={{ maxWidth: 560, marginTop: 18 }}>
            {t("trainer.hero_desc")}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap", alignItems: "center" }}>
            <CreateCourseForm 
              initialOpen={autoCreate} 
              sprints={courses.filter(c => c.type === "sprint")} 
            />
          </div>
        </div>
      </div>

      {/* Course List Section */}
      <div className="sec-head">
        <h2>{t("trainer.paths_title")}</h2>
        <span className="meta">{t("trainer.paths_meta", { count: String(courses.length).padStart(2, "0") })}</span>
      </div>

      <CourseListClient courses={courses} role="trainer" />
    </div>
  );
}

