import { store } from "@/lib/store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SidebarModules } from "@/components/trainer/sidebar-modules";
import { SidebarModuleActions } from "@/components/trainer/sidebar-actions";
import { cookies } from "next/headers";
import { translations } from "@/components/layout/translations";

export const dynamic = 'force-dynamic';
import { publishCourseAction } from "@/app/actions/course";

export default async function CourseEditorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await store.getCourse(courseId);
  
  if (!course) {
    notFound();
  }

  const modules = await store.getModules(courseId);

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

  const statusLabel = 
    course.status === 'published' ? (lang === 'en' ? 'PUBLISHED' : 'VERÖFFENTLICHT') :
    course.status === 'pending_review' ? (lang === 'en' ? 'PENDING REVIEW' : 'WARTET AUF FREIGABE') :
    course.status === 'coming_soon' ? (lang === 'en' ? 'COMING SOON' : 'ANKÜNDIGUNG') :
    course.status === 'archived' ? (lang === 'en' ? 'ARCHIVED' : 'ARCHIVIERT') :
    (lang === 'en' ? 'DRAFT' : 'ENTWURF');

  const statusColor = 
    course.status === 'published' ? 'var(--blue)' :
    course.status === 'coming_soon' ? 'var(--blue)' :
    course.status === 'pending_review' ? 'var(--coral)' :
    'var(--ink-2)';

  return (
    <div className="flex h-[calc(100vh-4rem)]" style={{ background: "var(--paper)" }}>
      {/* Left Sidebar: Course Structure */}
      <aside className="w-64 flex flex-col h-full" style={{ background: "var(--paper-2)", borderRight: "1.5px solid var(--line)" }}>
        <div className="p-5" style={{ borderBottom: "1.5px solid var(--line)" }}>
          <Link href="/trainer" className="text-xs font-mono uppercase tracking-wider text-ink-3 hover:text-blue mb-4 inline-block">
            {t("trainer.back_to_overview")}
          </Link>
          <div className="flex justify-between items-start mb-3">
            <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 16, textTransform: "uppercase", lineHeight: 1.2 }} className="text-ink line-clamp-2 pr-2">
              {course.title}
            </h2>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-line-soft uppercase" style={{ color: statusColor, background: `color-mix(in oklab, ${statusColor} 12%, transparent)` }}>
                {statusLabel}
              </span>
              
              {course.status === "draft" && (
                <form action={publishCourseAction.bind(null, course.id)}>
                  <button type="submit" className="text-xs font-mono font-bold text-blue hover:underline bg-transparent border-none cursor-pointer">
                    {lang === 'en' ? 'Submit' : 'Freigeben'}
                  </button>
                </form>
              )}
            </div>
            {course.status === "pending_review" && (
              <span className="text-[10px] italic text-ink-3">
                {lang === 'en' ? 'Awaiting admin review' : 'Wartet auf Freigabe durch Admin'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Link 
            href={`/trainer/courses/${course.id}`}
            className="block p-3 rounded-xl border border-line text-xs font-mono uppercase tracking-wider text-center text-ink hover:bg-paper-3 transition-colors animate-fade-in"
            style={{ background: "var(--paper)" }}
          >
            {t("trainer.settings")}
          </Link>

          <Link 
            href={`/trainer/courses/${course.id}/analytics`}
            className="block p-3 rounded-xl border border-line text-xs font-mono uppercase tracking-wider text-center text-ink hover:bg-paper-3 transition-colors"
            style={{ background: "var(--paper)" }}
          >
            {lang === 'en' ? 'Analytics & Reflections' : 'Fortschritt & Analysen'}
          </Link>

          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-ink-3 mb-3">{t("trainer.modules_title")}</div>
            <SidebarModules courseId={course.id} modules={modules} />
            <SidebarModuleActions courseId={course.id} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden" style={{ background: "var(--paper)" }}>
        {children}
      </main>
    </div>
  );
}

