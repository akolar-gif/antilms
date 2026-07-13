"use client";

import { useState } from "react";
import { Course } from "@/types";
import { updateCourseSettingsAction } from "@/app/actions/course";
import { ImagePicker } from "@/components/trainer/image-picker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CourseSettingsClient({ course, readOnly }: { course: Course; readOnly?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <span className="eyebrow" style={{ color: "var(--blue)" }}>COURSE SETUP</span>
          <h2 className="display" style={{ fontSize: 32, marginTop: 4 }}>Kurseinstellungen</h2>
        </div>

        {readOnly && (
          <div className="p-4 bg-coral/5 border border-coral/10 rounded-xl text-coral text-xs font-mono leading-relaxed">
            🔒 Du siehst diesen Kurs im **schreibgeschützten Modus**. Nur der Ersteller dieses Kurses kann die Einstellungen und Kursinhalte bearbeiten.
          </div>
        )}
        
        <form 
          action={async (formData) => {
            if (readOnly) return;
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
                disabled={readOnly}
                defaultValue={course.title}
                className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">Kategorie / Rubrik</label>
              <input 
                type="text" 
                id="category" 
                name="category" 
                disabled={readOnly}
                defaultValue={course.category}
                className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">Kurs-Typ</label>
              <select
                id="type"
                name="type"
                disabled={readOnly}
                defaultValue={course.type === "sprint" ? "sprint" : "comprehensive"}
                className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all bg-paper text-ink disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              >
                <option value="comprehensive">Standard-Kurs (Umfangreiches Training)</option>
                <option value="sprint">Sprint-Kurs (Fokussiertes Modul)</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">Preis (in €)</label>
              <div className="relative">
                <input 
                  type="text" 
                  id="price" 
                  name="price" 
                  disabled={readOnly}
                  placeholder="z.B. 49,00 (Leer lassen für Standard-Preis)"
                  defaultValue={course.price !== undefined && course.price !== null ? course.price.toString().replace(".", ",") : ""}
                  className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all pr-12 disabled:opacity-75 disabled:cursor-not-allowed"
                  style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-ink-3">EUR</span>
              </div>
              <p className="text-[10px] text-ink-3 mt-1.5">
                Frei lassen, um den Standardpreis von 49,00 € anzuwenden. Setze 0 für einen kostenlosen Kurs.
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">Beschreibung</label>
              <textarea 
                id="description" 
                name="description" 
                required 
                rows={4}
                disabled={readOnly}
                defaultValue={course.description}
                className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-2">Titelbild</label>
              {course.imageUrl && (
                <div className="mb-4">
                  <p className="text-[11px] font-mono text-ink-3 mb-1.5 uppercase tracking-wider">Aktuelles Bild:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={course.imageUrl} alt="Current cover" className="w-48 h-32 object-cover rounded-xl border border-line" />
                </div>
              )}
              {!readOnly && <ImagePicker />}
            </div>
          </div>
          
          {!readOnly && (
            <div className="mt-4 flex justify-end">
              <button type="submit" className="btn blue" disabled={isLoading}>
                {isLoading ? "Speichere..." : "Änderungen speichern"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

