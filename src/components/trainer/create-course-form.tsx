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
        <Sparkles className="w-4 h-4" /> Neuen Kurs gestalten
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
      toast.error("Titel und Beschreibung sind erforderlich.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(generateWithAI ? "Generiere AI-Curriculum..." : "Erstelle Kurs...");

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
        toast.success("AI-Curriculum generiert! Öffne Wizard...", { id: toastId });
      } else {
        // Call server action to create a simple draft course
        await createCourseAction(formData);
        toast.success("Kurs erfolgreich erstellt!", { id: toastId });
        setIsOpen(false);
        router.replace("/trainer");
      }
    } catch (err) {
      console.error(err);
      toast.error(generateWithAI ? "AI-Generierung fehlgeschlagen. Bitte erneut versuchen." : "Erstellung fehlgeschlagen", { id: toastId });
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
            <span className="eyebrow" style={{ color: "var(--blue)" }}>NEUER LERNPFAD</span>
            <h3 className="display" style={{ fontSize: 24, marginTop: 4 }}>Kurs entwerfen</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="title" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">Kurs-Titel</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                required 
                placeholder="z.B. Agile Führungskompetenzen"
                className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all"
                style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">Kategorie / Rubrik</label>
              <input 
                type="text" 
                id="category" 
                name="category" 
                placeholder="z.B. Leadership, Technologie, Soft Skills..."
                className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all"
                style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">Beschreibung</label>
              <textarea 
                id="description" 
                name="description" 
                required 
                rows={3}
                placeholder="Kurze Übersicht über die Lernziele und Zielgruppen..."
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
                Co-Design Curriculum mit Anka AI
              </label>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-2">Titelbild</label>
              <ImagePicker />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" className="btn ghost" onClick={handleClose} disabled={isLoading}>
              Abbrechen
            </button>
            <button type="submit" className="btn blue" disabled={isLoading}>
              {isLoading ? (generateWithAI ? "Generiere..." : "Erstelle...") : (generateWithAI ? "Pfad generieren" : "Kurs erstellen")}
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

