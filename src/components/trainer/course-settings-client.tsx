"use client";

import { useState } from "react";
import { Course } from "@/types";
import { updateCourseSettingsAction } from "@/app/actions/course";
import { ImagePicker } from "@/components/trainer/image-picker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CourseSettingsClient({ course }: { course: Course }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <span className="eyebrow" style={{ color: "var(--blue)" }}>COURSE SETUP</span>
          <h2 className="display" style={{ fontSize: 32, marginTop: 4 }}>Kurseinstellungen</h2>
        </div>
        
        <form 
          action={async (formData) => {
            setIsLoading(true);
            const toastId = toast.loading("Speichere Einstellungen...");
            try {
              await updateCourseSettingsAction(formData);
              toast.success("Einstellungen erfolgreich gespeichert!", { id: toastId });
              router.refresh();
            } catch (e) {
              toast.error("Speichern fehlgeschlagen", { id: toastId });
            } finally {
              setIsLoading(false);
            }
          }}
          className="bg-paper border border-line p-8 rounded-2xl shadow-sm flex flex-col gap-6"
        >
          <input type="hidden" name="courseId" value={course.id} />
          
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="title" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">Kurs-Titel</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                required 
                defaultValue={course.title}
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
                defaultValue={course.category}
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
                rows={4}
                defaultValue={course.description}
                className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all resize-none"
                style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-2">Titelbild ändern</label>
              {course.imageUrl && (
                <div className="mb-4">
                  <p className="text-[11px] font-mono text-ink-3 mb-1.5 uppercase tracking-wider">Aktuelles Bild:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={course.imageUrl} alt="Current cover" className="w-48 h-32 object-cover rounded-xl border border-line" />
                </div>
              )}
              <ImagePicker />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn blue" disabled={isLoading}>
              {isLoading ? "Speichere..." : "Änderungen speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

