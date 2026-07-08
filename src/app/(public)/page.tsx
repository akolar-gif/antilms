import { store } from "@/lib/store";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { cookies } from "next/headers";
import { translations } from "@/components/layout/translations";
import { verifySession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const allCourses = await store.getCourses();
  const visibleCourses = allCourses.filter(c => c.status === "published" || c.status === "coming_soon");
  
  // Group by category
  const categories = Array.from(new Set(visibleCourses.map(c => c.category || "General"))).sort();

  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;
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
        <div className="tb-right flex items-center gap-2">
          {user ? (
            <>
              <span className="text-xs text-ink-3 mr-2 font-mono hidden md:inline">
                {lang === "de" ? "Hallo, " : "Hi, "}{user.name}
              </span>
              
              {/* Quick links for Admin */}
              {user.role === "admin" && (
                <div className="flex gap-2">
                  <Link href="/admin" className="btn ghost text-[11px] font-mono uppercase tracking-wider py-1 px-3 border border-line-soft rounded-lg">
                    Admin
                  </Link>
                  <Link href="/trainer" className="btn ghost text-[11px] font-mono uppercase tracking-wider py-1 px-3 border border-line-soft rounded-lg">
                    Trainer
                  </Link>
                  <Link href="/learner" className="btn ghost text-[11px] font-mono uppercase tracking-wider py-1 px-3 border border-line-soft rounded-lg">
                    Lerner
                  </Link>
                </div>
              )}

              {/* Quick links for Trainer */}
              {user.role === "trainer" && (
                <div className="flex gap-2">
                  <Link href="/trainer" className="btn ghost text-[11px] font-mono uppercase tracking-wider py-1 px-3 border border-line-soft rounded-lg">
                    Trainer
                  </Link>
                  <Link href="/learner" className="btn ghost text-[11px] font-mono uppercase tracking-wider py-1 px-3 border border-line-soft rounded-lg">
                    Lerner
                  </Link>
                </div>
              )}

              {/* Quick links for Learner */}
              {user.role === "learner" && (
                <Link href="/learner" className="btn ghost text-[11px] font-mono uppercase tracking-wider py-1 px-3 border border-line-soft rounded-lg">
                  {lang === "de" ? "Mein Portal" : "My Dashboard"}
                </Link>
              )}
            </>
          ) : (
            <Link href="/login" className="btn ghost" style={{ textTransform: "uppercase", fontFamily: "var(--f-mono)", fontSize: 12, padding: "8px 16px" }}>
              {t("public.login")}
            </Link>
          )}
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
        <span className="meta">{t("public.courses_count", { count: visibleCourses.filter(c => c.status === "published").length.toString() })}</span>
      </div>

      {visibleCourses.length === 0 ? (
        <div className="pad">
          <div className="p-12 text-center bg-paper-2 border border-line-soft rounded-2xl">
            <BookOpen className="w-10 h-10 text-ink-3 mx-auto mb-4" />
            <h3 className="font-heading font-medium text-ink mb-1">{t("public.no_courses")}</h3>
            <p className="text-ink-2 text-sm">{t("public.no_courses_desc")}</p>
          </div>
        </div>
      ) : (
        <div className="courses border-t border-b border-line">
          {visibleCourses.map((course, idx) => {
            const cardColor = idx % 3 === 0 ? "blue" : idx % 3 === 1 ? "ink" : "coral";
            const imageUrl = course.imageUrl;
            const isComingSoon = course.status === "coming_soon";
            const displayIdx = String(idx + 1).padStart(2, "0");

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
                    <div className="pmeta flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-bold">{t("public.start_journey")}</span>
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

