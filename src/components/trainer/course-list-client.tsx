"use client";

import { useState } from "react";
import { Course } from "@/types";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCourseAction } from "@/app/actions/course";

export function CourseListClient({ 
  courses, 
  role, 
  currentUserId 
}: { 
  courses: Course[]; 
  role: "trainer" | "learner"; 
  currentUserId?: string; 
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(courses.map(c => c.category || "General"))).sort()];

  const filteredCourses = selectedCategory === "All" 
    ? courses 
    : courses.filter(c => (c.category || "General") === selectedCategory);

  return (
    <div className="flex flex-col gap-8">
      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="pad flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`chip ${selectedCategory === category ? "active" : ""}`}
              style={{
                background: selectedCategory === category ? "var(--ink)" : "var(--paper-2)",
                color: selectedCategory === category ? "var(--paper)" : "var(--ink-2)",
                border: "1.5px solid var(--line-soft)",
                borderRadius: "99px",
                padding: "8px 16px",
                fontSize: "13px",
                fontFamily: "var(--f-mono)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="pad">
          <div className="p-12 text-center bg-paper-2 border border-line-soft rounded-2xl">
            <h3 className="font-heading font-medium text-ink mb-1">Keine Lernpfade gefunden</h3>
            <p className="text-ink-2 text-sm">
              {selectedCategory === "All" 
                ? "Gestalte deinen ersten Lernpfad oben."
                : `Keine Kurse in der Kategorie "${selectedCategory}" gefunden.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="courses border-t border-b border-line">
          {filteredCourses.map((course, idx) => {
            const cardColor = idx % 3 === 0 ? "blue" : idx % 3 === 1 ? "ink" : "coral";
            const imageUrl = course.imageUrl;
            const linkHref = `/${role}/courses/${course.id}`;
            const displayIdx = String(idx + 1).padStart(2, "0");

            if (imageUrl) {
              return (
                <Link href={linkHref} className="poster photo" key={course.id}>
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
                    
                    <div className="pmeta mt-auto flex flex-col gap-2 items-start w-full">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 border border-white/40 uppercase">
                            {course.status === "published" ? "VERÖFFENTLICHT" : course.status === "coming_soon" ? "COMING SOON" : course.status === "pending_review" ? "IM REVIEW" : "ENTWURF"}
                          </span>
                          <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/30 border border-blue-400/50 uppercase">
                            {course.type === "sprint" ? "Sprint" : course.type === "track" ? "Track" : "Standard"}
                          </span>
                          {role === "trainer" && currentUserId && course.createdBy !== currentUserId && (
                            <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-coral/20 border border-coral/40 uppercase text-coral flex items-center gap-0.5">
                              🔒 NUR ANSICHT
                            </span>
                          )}
                        </div>
                        
                        {role === "trainer" && (!currentUserId || course.createdBy === currentUserId) && (
                          <button 
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm("Möchtest du diesen Kurs und alle zugehörigen Module wirklich löschen? Dies kann nicht rückgängig gemacht werden.")) {
                                const toastId = toast.loading("Lösche Kurs...");
                                try {
                                  await deleteCourseAction(course.id);
                                  toast.success("Kurs erfolgreich gelöscht!", { id: toastId });
                                } catch (err) {
                                  toast.error("Fehler beim Löschen des Kurses", { id: toastId });
                                }
                              }
                            }}
                            className="text-red-300 hover:text-white transition-all bg-black/40 hover:bg-red-600/80 p-1.5 rounded-md border border-white/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link href={linkHref} className={`poster ${cardColor}`} key={course.id}>
                <div className="top">
                  <span className="no">№ {displayIdx}</span>
                  <span className="tag">{course.category || "General"}</span>
                </div>
                <div className="ptitle">{course.title}</div>
                
                <div className="pmeta mt-auto flex flex-col gap-2 items-start w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-current/10 border border-current/30 uppercase">
                        {course.status === "published" ? "VERÖFFENTLICHT" : course.status === "coming_soon" ? "COMING SOON" : course.status === "pending_review" ? "IM REVIEW" : "ENTWURF"}
                      </span>
                      <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-current/20 border border-current/40 uppercase">
                        {course.type === "sprint" ? "Sprint" : course.type === "track" ? "Track" : "Standard"}
                      </span>
                    </div>
                    
                    {role === "trainer" && (
                      <button 
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm("Möchtest du diesen Kurs und alle zugehörigen Module wirklich löschen? Dies kann nicht rückgängig gemacht werden.")) {
                            const toastId = toast.loading("Lösche Kurs...");
                            try {
                              await deleteCourseAction(course.id);
                              toast.success("Kurs erfolgreich gelöscht!", { id: toastId });
                            } catch (err) {
                              toast.error("Fehler beim Löschen des Kurses", { id: toastId });
                            }
                          }
                        }}
                        className="text-ink-3 hover:text-red-500 transition-all bg-paper-2 hover:bg-red-50 p-1.5 rounded-md border border-line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

