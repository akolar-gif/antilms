import { store } from "@/lib/store";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { translations } from "@/components/layout/translations";

export default async function LearnerCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const modules = await store.getModules(courseId);
  
  if (modules.length > 0) {
    // Automatically start with the first module
    redirect(`/learner/courses/${courseId}/modules/${modules[0].id}`);
  }

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
