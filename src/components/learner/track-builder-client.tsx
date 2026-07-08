"use client";

import React, { useState, useEffect } from "react";
import { Course } from "@/types";
import { Sparkles, ArrowUp, ArrowDown, ChevronRight, Check, Loader2, Award, Zap, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { optimizeTrackOrderAction, createCustomTrackAction } from "@/app/actions/course";

interface TrackBuilderClientProps {
  sprints: Course[];
}

export function TrackBuilderClient({ sprints }: TrackBuilderClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [orderedSprints, setOrderedSprints] = useState<Course[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Group sprints by category
  const categoriesMap: Record<string, Course[]> = {};
  sprints.forEach(s => {
    const cat = s.category || "General";
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = [];
    }
    categoriesMap[cat].push(s);
  });

  const categories = Object.keys(categoriesMap).sort();

  // Sync ordered list when selection changes
  useEffect(() => {
    // Keep already ordered items, append newly selected, remove unselected
    const currentOrdered = [...orderedSprints];
    const newOrdered = currentOrdered.filter(s => selectedIds.includes(s.id));
    
    selectedIds.forEach(id => {
      if (!newOrdered.some(s => s.id === id)) {
        const found = sprints.find(s => s.id === id);
        if (found) newOrdered.push(found);
      }
    });

    setOrderedSprints(newOrdered);
  }, [selectedIds, sprints]);

  // Default track title if empty
  const handleDefaultTitle = () => {
    if (!title && selectedIds.length > 0) {
      const selected = sprints.filter(s => selectedIds.includes(s.id));
      const categoryNames = Array.from(new Set(selected.map(s => s.category || "General")));
      setTitle(`Mein ${categoryNames.join(" & ")} Track`);
    }
  };

  const handleToggleSprint = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= orderedSprints.length) return;

    const newList = [...orderedSprints];
    const temp = newList[index];
    newList[index] = newList[nextIndex];
    newList[nextIndex] = temp;
    setOrderedSprints(newList);
  };

  const handleAiOptimize = async () => {
    if (selectedIds.length <= 1) {
      toast.info("Bitte wähle mindestens 2 Sprints aus, um die Reihenfolge zu optimieren.");
      return;
    }

    setIsOptimizing(true);
    const toastId = toast.loading("KI analysiert didaktischen Aufbau...");
    
    try {
      const res = await optimizeTrackOrderAction(selectedIds);
      if (res.success && res.orderedIds) {
        // Re-order our state array according to the AI recommendations
        const newOrdered: Course[] = [];
        res.orderedIds.forEach(id => {
          const found = sprints.find(s => s.id === id);
          if (found) newOrdered.push(found);
        });
        setOrderedSprints(newOrdered);
        toast.success("Reihenfolge didaktisch durch KI optimiert!", { id: toastId });
      } else {
        toast.error(res.error || "Fehler bei der KI-Optimierung", { id: toastId });
      }
    } catch (err) {
      toast.error("Verbindung fehlgeschlagen.", { id: toastId });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleActivateTrack = async () => {
    if (selectedIds.length < 2) {
      toast.error("Wähle mindestens 2 Sprints für deinen Track aus.");
      return;
    }

    const trackTitle = title.trim() || `Mein Custom Track (${new Date().toLocaleDateString()})`;
    setIsSaving(true);
    const toastId = toast.loading("Erstelle deinen persönlichen Skill Track...");

    try {
      const res = await createCustomTrackAction(trackTitle, orderedSprints.map(s => s.id));
      if (res.success && res.courseId) {
        toast.success("Skill Track erfolgreich aktiviert!", { id: toastId });
        router.push(`/learner/courses/${res.courseId}`);
      } else {
        toast.error(res.error || "Fehler beim Aktivieren", { id: toastId });
      }
    } catch (err) {
      toast.error("Verbindung fehlgeschlagen.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Pricing calculations
  const sprintCount = selectedIds.length;
  const pricePerSprint = 49;
  const totalRegularPrice = sprintCount * pricePerSprint;
  const discountPercent = sprintCount >= 3 ? 35 : sprintCount === 2 ? 20 : 0;
  const finalPrice = Math.round(totalRegularPrice * (1 - discountPercent / 100));
  const savings = totalRegularPrice - finalPrice;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 py-4 animate-reveal">
      {/* Title & Introduction */}
      <div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-500/20 text-blue bg-blue-500/5 uppercase tracking-wider">
          Personal Track Builder
        </span>
        <h1 className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-ink mt-2">
          Dein eigener Skill Track
        </h1>
        <p className="text-sm text-ink-2 max-w-xl leading-relaxed mt-2">
          Stelle dir aus unseren Skill Sprints deinen persönlichen Lernpfad zusammen. Die KI hilft dir, die didaktisch wertvollste Reihenfolge festzulegen, und du sparst beim Kombinieren!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Selection (2/3 width on wide screens) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-paper border border-line rounded-2xl p-6 flex flex-col gap-6">
            <h2 className="text-lg font-display font-extrabold uppercase text-ink flex items-center gap-2">
              <Award className="w-5 h-5 text-blue" />
              1. Skill Sprints auswählen
            </h2>

            <div className="flex flex-col gap-6">
              {categories.map(category => {
                const categorySprints = categoriesMap[category];
                const hasCombinationBonus = categorySprints.length >= 2;
                
                return (
                  <div key={category} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-line-soft pb-1">
                      <span className="font-mono text-xs font-bold text-ink-3 uppercase">{category}</span>
                      {hasCombinationBonus && (
                        <span className="text-[9px] font-mono text-emerald bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                          Kombinations-Empfehlung
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categorySprints.map(sprint => {
                        const isChecked = selectedIds.includes(sprint.id);
                        return (
                          <button
                            key={sprint.id}
                            onClick={() => handleToggleSprint(sprint.id)}
                            type="button"
                            className={`flex items-start text-left gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                              isChecked 
                                ? "bg-blue/5 border-blue/40 shadow-soft" 
                                : "bg-paper-2 hover:bg-paper-3 border-line-soft hover:border-line"
                            }`}
                          >
                            <div className={`mt-0.5 w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                              isChecked 
                                ? "bg-blue border-blue text-paper" 
                                : "border-line text-transparent"
                            }`}>
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs text-ink line-clamp-1">{sprint.title}</div>
                              <div className="text-[10px] text-ink-2 mt-1 line-clamp-2 leading-relaxed">
                                {sprint.description || sprint.targetGroup}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordering Section */}
          {sprintCount >= 2 && (
            <div className="bg-paper border border-line rounded-2xl p-6 flex flex-col gap-6 animate-reveal">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-display font-extrabold uppercase text-ink flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue" />
                    2. Reihenfolge optimieren
                  </h2>
                  <p className="text-xs text-ink-3 mt-1">
                    Bringe die Sprints per Hand in Reihenfolge oder lass die KI den didaktischen Pfad bestimmen.
                  </p>
                </div>

                <button
                  onClick={handleAiOptimize}
                  disabled={isOptimizing}
                  type="button"
                  className="btn ghost flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 bg-blue-500/5 hover:bg-blue-500/10 text-blue border border-blue/20 rounded-xl"
                >
                  {isOptimizing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  KI-Optimierung
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {orderedSprints.map((sprint, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === orderedSprints.length - 1;

                  return (
                    <div 
                      key={sprint.id}
                      className="flex items-center gap-4 p-3 bg-paper-2 border border-line-soft rounded-xl"
                    >
                      <div className="w-6 h-6 rounded-full bg-paper border border-line flex items-center justify-center font-mono text-xs font-bold text-ink-2">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-ink truncate">{sprint.title}</div>
                        <div className="text-[9px] text-ink-3 uppercase font-mono mt-0.5">{sprint.category || "General"}</div>
                      </div>

                      {/* Manual sorting buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMove(idx, "up")}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isFirst 
                              ? "opacity-30 cursor-not-allowed border-transparent text-ink-3" 
                              : "hover:bg-paper border-line-soft hover:border-line text-ink"
                          }`}
                          title="Nach oben verschieben"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMove(idx, "down")}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isLast 
                              ? "opacity-30 cursor-not-allowed border-transparent text-ink-3" 
                              : "hover:bg-paper border-line-soft hover:border-line text-ink"
                          }`}
                          title="Nach unten verschieben"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Title input, Pricing Mockup & Activation (1/3 width) */}
        <div className="flex flex-col gap-6">
          <div className="bg-paper border border-line rounded-2xl p-6 flex flex-col gap-6 sticky top-6">
            <div>
              <h2 className="text-lg font-display font-extrabold uppercase text-ink flex items-center gap-2">
                <Check className="w-5 h-5 text-blue" />
                3. Aktivierung
              </h2>
            </div>

            {/* Track Title Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-ink-3 uppercase">
                Name deines Skill Tracks
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleDefaultTitle}
                placeholder="z.B. Mein Agile-Mastery Pfad"
                className="w-full bg-paper-2 border border-line rounded-xl px-4 py-3 text-xs text-ink focus:outline-none focus:border-blue transition-colors"
              />
            </div>

            {/* Price Preview Card */}
            <div className="bg-paper-2 border border-line-soft rounded-xl p-4 flex flex-col gap-4">
              <span className="text-[9px] font-mono text-ink-3 uppercase font-bold tracking-wider">PREISVORTEIL</span>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-ink-2">
                  <span>Sprints ({sprintCount})</span>
                  <span>{sprintCount} × {pricePerSprint} €</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="flex justify-between items-center text-xs text-emerald-green">
                    <span>Kombivorteil ({discountPercent}%)</span>
                    <span>-{savings} €</span>
                  </div>
                )}
                
                <div className="border-t border-line-soft my-1"></div>
                
                <div className="flex justify-between items-end">
                  <span className="font-bold text-xs text-ink">Gesamtpreis</span>
                  <div className="text-right">
                    {discountPercent > 0 && (
                      <span className="text-[10px] text-ink-3 line-through mr-1.5">{totalRegularPrice} €</span>
                    )}
                    <span className="text-lg font-display font-extrabold text-ink">{finalPrice} €</span>
                  </div>
                </div>
              </div>

              {discountPercent > 0 ? (
                <div className="text-[10px] text-emerald bg-emerald/5 border border-emerald/10 p-2.5 rounded-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Kombipreis aktiv! Du sparst <strong>{savings} €</strong>.</span>
                </div>
              ) : (
                <div className="text-[10px] text-ink-3 bg-paper-3 p-2.5 rounded-lg flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Wähle 2 oder mehr Sprints aus, um den Kombipreis freizuschalten.</span>
                </div>
              )}
            </div>

            {/* Activate Button */}
            <button
              onClick={handleActivateTrack}
              disabled={isSaving || sprintCount < 2}
              type="button"
              className={`w-full py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                sprintCount >= 2
                  ? "bg-blue hover:bg-blue-d text-white border border-blue/10 shadow-soft"
                  : "bg-paper-2 border border-line-soft text-ink-3 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Track jetzt aktivieren</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
