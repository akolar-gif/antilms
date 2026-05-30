"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourseAction, generateCurriculumAction } from "@/app/actions/course";
import { uploadImageAction } from "@/app/actions/upload";
import { ImagePicker } from "@/components/trainer/image-picker";
import { CurriculumWizard } from "./curriculum-wizard";
import { GeneratedCurriculumResult } from "@/lib/ai/provider";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/components/layout/language-context";

interface CreateCourseFormProps {
  initialOpen?: boolean;
}

export function CreateCourseForm({ initialOpen }: CreateCourseFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(initialOpen || false);
  const [isLoading, setIsLoading] = useState(false);
  const [generateWithAI, setGenerateWithAI] = useState(false);
  const [generatedCurriculum, setGeneratedCurriculum] = useState<GeneratedCurriculumResult | null>(null);
  const [tempCourseData, setTempCourseData] = useState<any>(null);
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
    const toastId = toast.loading(generateWithAI ? t("creator.toast_generating") : t("creator.toast_creating"));

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

      if (generateWithAI) {
        // Call server action to generate modules & blocks
        const curriculum = await generateCurriculumAction(title, description);
        setTempCourseData({ title, description, category, imageUrl: finalImageUrl });
        setGeneratedCurriculum(curriculum);
        toast.success(t("creator.toast_gen_success"), { id: toastId });
      } else {
        // Call server action to create a simple draft course
        await createCourseAction(formData);
        toast.success(t("creator.toast_create_success"), { id: toastId });
        setIsOpen(false);
        router.replace("/trainer");
      }
    } catch (err) {
      console.error(err);
      toast.error(generateWithAI ? t("creator.toast_gen_failed") : t("creator.toast_create_failed"), { id: toastId });
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

