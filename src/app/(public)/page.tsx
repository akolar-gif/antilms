import { store } from "@/lib/store";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { cookies } from "next/headers";
import { translations } from "@/components/layout/translations";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const allCourses = await store.getCourses();
  const publishedCourses = allCourses.filter(c => c.status === "published");
  
  // Group by category
  const categories = Array.from(new Set(publishedCourses.map(c => c.category || "General"))).sort();

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
            <div className="eyebrow">{t("public.eyebrow")}</div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
              {t("public.welcome")}
            </div>
          </div>
        </div>
        <div className="tb-right" style={{ gap: 12 }}>
          <Link href="/login" className="btn ghost" style={{ textTransform: "uppercase", fontFamily: "var(--f-mono)", fontSize: 12, padding: "8px 16px" }}>
            {t("public.login")}
          </Link>
        </div>
      </header>

      {/* Hero Lattice Grid */}
      <div className="lattice" style={{ gridTemplateColumns: "1fr" }}>
        <div className="cell">
          <div className="eyebrow" style={{ marginBottom: 14, color: "var(--blue)" }}>
            {t("public.hero_eyebrow")}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 84px)" }}>
            {lang === "de" ? "Willkommen bei" : "Welcome to"} <span style={{ color: "var(--blue)" }}>Innoversity</span>
          </h1>
          <p className="lede" style={{ maxWidth: 560, marginTop: 18 }}>
            {t("public.hero_desc")}
          </p>
        </div>
      </div>

      {/* Portals Grid */}
      <div className="lattice" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {/* Trainer Portal */}
        <Link href="/trainer" className="cell flex flex-col gap-6 text-left group hover:bg-paper-2 transition-colors" style={{ textDecoration: "none" }}>
          <span className="corner-no">№ 01</span>
          <div>
            <span className="eyebrow" style={{ color: "var(--blue)" }}>TRAINER STUDIO</span>
            <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }} className="text-ink">
              {t("public.trainer_title")}
            </h3>
          </div>
          <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
            {t("public.trainer_desc")}
          </p>
          <div className="mt-auto flex items-center text-blue text-xs font-mono uppercase tracking-wider gap-1.5 group-hover:gap-2.5 transition-all">
            {t("public.trainer_btn")} <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Learner Portal */}
        <Link href="/learner" className="cell flex flex-col gap-6 text-left group hover:bg-paper-2 transition-colors" style={{ textDecoration: "none" }}>
          <span className="corner-no">№ 02</span>
          <div>
            <span className="eyebrow" style={{ color: "var(--coral-d)" }}>LEARNER PORTAL</span>
            <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }} className="text-ink">
              {t("public.learner_title")}
            </h3>
          </div>
          <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
            {t("public.learner_desc")}
          </p>
          <div className="mt-auto flex items-center text-coral-d text-xs font-mono uppercase tracking-wider gap-1.5 group-hover:gap-2.5 transition-all">
            {t("public.learner_btn")} <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Admin Portal */}
        <Link href="/admin" className="cell flex flex-col gap-6 text-left group hover:bg-paper-2 transition-colors" style={{ textDecoration: "none" }}>
          <span className="corner-no">№ 03</span>
          <div>
            <span className="eyebrow" style={{ color: "var(--ink-2)" }}>ADMIN PORTAL</span>
            <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }} className="text-ink">
              {t("public.admin_title")}
            </h3>
          </div>
          <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
            {t("public.admin_desc")}
          </p>
          <div className="mt-auto flex items-center text-ink text-xs font-mono uppercase tracking-wider gap-1.5 group-hover:gap-2.5 transition-all">
            {t("public.admin_btn")} <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Courses Catalog */}
      <div className="sec-head">
        <h2>{t("public.available_paths")}</h2>
        <span className="meta">{t("public.courses_count", { count: publishedCourses.length.toString() })}</span>
      </div>

      {publishedCourses.length === 0 ? (
        <div className="pad">
          <div className="p-12 text-center bg-paper-2 border border-line-soft rounded-2xl">
            <BookOpen className="w-10 h-10 text-ink-3 mx-auto mb-4" />
            <h3 className="font-heading font-medium text-ink mb-1">{t("public.no_courses")}</h3>
            <p className="text-ink-2 text-sm">{t("public.no_courses_desc")}</p>
          </div>
        </div>
      ) : (
        <div className="courses border-t border-b border-line">
          {publishedCourses.map((course, idx) => {
            const cardColor = idx % 3 === 0 ? "blue" : idx % 3 === 1 ? "ink" : "coral";
            const imageUrl = course.imageUrl;
            const displayIdx = String(idx + 1).padStart(2, "0");

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
                      <span>{t("public.start_journey")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
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
                <div className="pmeta mt-auto flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold">{t("public.start_journey")}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

