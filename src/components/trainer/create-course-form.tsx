"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourseAction, generateCurriculumAction } from "@/app/actions/course";
import { uploadImageAction } from "@/app/actions/upload";
import { ImagePicker } from "@/components/trainer/image-picker";
import { CurriculumWizard } from "./curriculum-wizard";
import { GeneratedCurriculumResult } from "@/lib/ai/provider";
import { Sparkles, X, BookOpen, FastForward, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/components/layout/language-context";
import { Course } from "@/types";

interface CreateCourseFormProps {
  initialOpen?: boolean;
  sprints?: Course[];
}

export function CreateCourseForm({ initialOpen, sprints = [] }: CreateCourseFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(initialOpen || false);
  const [isLoading, setIsLoading] = useState(false);
  const [generateWithAI, setGenerateWithAI] = useState(false);
  const [generatedCurriculum, setGeneratedCurriculum] = useState<GeneratedCurriculumResult | null>(null);
  const [tempCourseData, setTempCourseData] = useState<any>(null);
  const [courseType, setCourseType] = useState<"comprehensive" | "sprint" | "track">("comprehensive");
  const [selectedSprintIds, setSelectedSprintIds] = useState<string[]>([]);
  const { t } = useTranslation();

  const handleClose = () => {
    setIsOpen(false);
    // Remove ?create=true search parameter from URL
    router.replace("/trainer");
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <button onClick={handleOpen} className="btn blue" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Sparkles className="w-4 h-4" /> {t("library.create_btn")}
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (courseType === "track" && selectedSprintIds.length === 0) {
      toast.error("Bitte wähle mindestens einen Skill Sprint aus.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const stockImageUrl = formData.get("stockImageUrl") as string;
    const courseImage = formData.get("courseImage") as File | null;

    if (!title || !description) {
      toast.error(t("creator.toast_required"));
      return;
    }

    setIsLoading(true);
    const useAI = generateWithAI && courseType !== "track";
    const toastId = toast.loading(useAI ? t("creator.toast_generating") : t("creator.toast_creating"));

    try {
      let finalImageUrl: string | undefined = undefined;

      // Process uploaded file if present
      if (courseImage && courseImage.size > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", courseImage);
        finalImageUrl = await uploadImageAction(uploadFormData);
      } else if (stockImageUrl) {
        finalImageUrl = stockImageUrl;
      }

      if (useAI) {
        // Call server action to generate modules & blocks
        const curriculum = await generateCurriculumAction(title, description);
        setTempCourseData({ title, description, category, imageUrl: finalImageUrl, type: courseType });
        setGeneratedCurriculum(curriculum);
        toast.success(t("creator.toast_gen_success"), { id: toastId });
      } else {
        // Append type & sprint connections
        formData.append("type", courseType);
        formData.append("sprintCourseIds", JSON.stringify(selectedSprintIds));
        
        // Call server action to create a simple draft course
        await createCourseAction(formData);
        toast.success(t("creator.toast_create_success"), { id: toastId });
        setIsOpen(false);
        router.replace("/trainer");
      }
    } catch (err) {
      console.error(err);
      toast.error(useAI ? t("creator.toast_gen_failed") : t("creator.toast_create_failed"), { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <form 
          onSubmit={handleSubmit}
          className="bg-paper border border-line p-8 rounded-2xl w-full max-w-lg shadow-xl relative animate-in zoom-in-95 duration-200 flex flex-col gap-6"
        >
          {/* Close button */}
          <button 
            type="button" 
            onClick={handleClose} 
            className="absolute top-6 right-6 text-ink-3 hover:text-ink transition-colors"
            style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <span className="eyebrow" style={{ color: "var(--blue)" }}>{t("creator.new_path")}</span>
            <h3 className="display" style={{ fontSize: 24, marginTop: 4 }}>{t("creator.design_title")}</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="title" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">{t("creator.course_title")}</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                required 
                placeholder={t("creator.placeholder_title")}
                className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all"
                style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">{t("creator.category")}</label>
              <input 
                type="text" 
                id="category" 
                name="category" 
                placeholder={t("creator.placeholder_category")}
                className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all"
                style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-2">Kurstyp / Course Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setCourseType("comprehensive"); setGenerateWithAI(false); }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    courseType === "comprehensive"
                      ? "border-blue bg-blue/5 text-blue"
                      : "border-line bg-paper hover:bg-paper-2 text-ink-2"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Standard</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => { setCourseType("sprint"); setGenerateWithAI(false); }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    courseType === "sprint"
                      ? "border-blue bg-blue/5 text-blue"
                      : "border-line bg-paper hover:bg-paper-2 text-ink-2"
                  }`}
                >
                  <FastForward className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Sprint</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setCourseType("track"); setGenerateWithAI(false); }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    courseType === "track"
                      ? "border-blue bg-blue/5 text-blue"
                      : "border-line bg-paper hover:bg-paper-2 text-ink-2"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Track</span>
                </button>
              </div>
            </div>

            {courseType === "track" && (
              <div className="flex flex-col gap-2 p-4 border border-line rounded-2xl bg-paper-2 max-h-40 overflow-y-auto">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-3">Skill Sprints auswählen</label>
                {sprints.length === 0 ? (
                  <p className="text-[11px] text-ink-3 italic">Keine Skill Sprints vorhanden. Erstelle erst einen Skill Sprint.</p>
                ) : (
                  <div className="flex flex-col gap-2 mt-1">
                    {sprints.map(s => {
                      const isSelected = selectedSprintIds.includes(s.id);
                      return (
                        <label key={s.id} className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedSprintIds(prev => 
                                isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id]
                              );
                            }}
                            className="w-3.5 h-3.5 accent-blue"
                          />
                          <span>{s.title}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">{t("creator.description")}</label>
              <textarea 
                id="description" 
                name="description" 
                required 
                rows={3}
                placeholder={t("creator.placeholder_description")}
                className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all resize-none"
                style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              />
            </div>

            {/* AI Toggle Option */}
            {courseType !== "track" && (
              <div 
                className="flex items-center gap-3 p-4 border border-line rounded-2xl"
                style={{ background: "var(--paper-2)" }}
              >
                <input 
                  type="checkbox" 
                  id="generateWithAI" 
                  checked={generateWithAI}
                  onChange={(e) => setGenerateWithAI(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-blue"
                />
                <label htmlFor="generateWithAI" className="text-sm font-bold text-ink flex items-center gap-1.5 cursor-pointer select-none">
                  <Sparkles className="w-4 h-4 text-blue animate-pulse" />
                  {t("creator.co_design")}
                </label>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-2">{t("creator.cover_image")}</label>
              <ImagePicker />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" className="btn ghost" onClick={handleClose} disabled={isLoading}>
              {t("creator.cancel")}
            </button>
            <button type="submit" className="btn blue" disabled={isLoading}>
              {isLoading 
                ? (generateWithAI ? t("creator.generating") : t("creator.creating")) 
                : (generateWithAI ? t("creator.generate") : t("creator.create"))}
            </button>
          </div>
        </form>
      </div>

      {generatedCurriculum && tempCourseData && (
        <CurriculumWizard
          courseData={tempCourseData}
          initialCurriculum={generatedCurriculum}
          onCancel={() => {
            setGeneratedCurriculum(null);
            setTempCourseData(null);
          }}
        />
      )}
    </>
  );
}

