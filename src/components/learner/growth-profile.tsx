"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Search, Calendar, BookOpen, Quote, ShieldAlert } from "lucide-react";
import { translations } from "@/components/layout/translations";

interface GrowthProfileProps {
  reflections: any[];
  completedBlocksTotal: number;
  courseProgresses: any[];
  userId: string;
  lang?: "de" | "en";
}

export function GrowthProfile({
  reflections,
  completedBlocksTotal,
  courseProgresses,
  userId,
  lang = "de"
}: GrowthProfileProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [milestoneNote, setMilestoneNote] = useState<string | null>(null);
  const [isLoadingMilestone, setIsLoadingMilestone] = useState(true);

  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerateWeeklyReport = async () => {
    setIsModalOpen(true);
    setIsLoadingReport(true);
    try {
      const res = await fetch("/api/ai-weekly-report");
      if (res.ok) {
        const data = await res.json();
        setWeeklyReport(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Switch translations
  const t = (key: string) => {
    const deDict: Record<string, string> = {
      growth_title: "DEIN WACHSTUMS-RADAR",
      growth_desc: "Visualisierung deiner Zukunftskompetenzen und deiner intellektuellen Entwicklung.",
      insights_timeline: "DEIN GEDANKEN-LOGBUCH",
      insights_desc: "Chronologisches Archiv deiner geschriebenen Reflexionen.",
      search_placeholder: "Reflexionen durchsuchen...",
      no_reflections: "Noch keine Gedanken im Logbuch verzeichnet.",
      no_reflections_sub: "Reflektiere über Abschnitte in deinen Kursen, um hier deine Erkenntnisse festzuhalten.",
      ai_milestone_title: "KI-WEGBEGLEITER-NOTIZ",
      ai_milestone_desc: "Persönliche Einschätzung deines aktuellen Lernstils durch Gemini.",
      points_lbl: "Punkte",
      level_lbl: "Level",
      radar_agile: "Agile Mindset & Leadership",
      radar_ai: "AI & Technology",
      radar_creativity: "Creativity & Innovation",
      radar_human: "Human Skills",
      reflection_bonus: "Reflexions-Bonus",
      completed_blocks: "Erledigte Blöcke",
    };
    const enDict: Record<string, string> = {
      growth_title: "YOUR GROWTH RADAR",
      growth_desc: "Visualization of your future skills and intellectual development.",
      insights_timeline: "YOUR INSIGHTS LOGBOOK",
      insights_desc: "Chronological archive of your written reflections.",
      search_placeholder: "Search reflections...",
      no_reflections: "No insights logged yet.",
      no_reflections_sub: "Reflect on sections in your courses to log your thoughts here.",
      ai_milestone_title: "AI COMPANION NOTE",
      ai_milestone_desc: "Personalized assessment of your current learning style by Gemini.",
      points_lbl: "Points",
      level_lbl: "Level",
      radar_agile: "Agile Mindset & Leadership",
      radar_ai: "AI & Technology",
      radar_creativity: "Creativity & Innovation",
      radar_human: "Human Skills",
      reflection_bonus: "Reflection Bonus",
      completed_blocks: "Completed Blocks",
    };
    const dict = lang === "en" ? enDict : deDict;
    return dict[key] || key;
  };

  // Fetch AI milestone note on mount
  useEffect(() => {
    async function fetchMilestone() {
      try {
        const res = await fetch("/api/ai-milestone");
        if (res.ok) {
          const data = await res.json();
          setMilestoneNote(data.milestoneNote);
        } else {
          setMilestoneNote("Deine Lernreise hat begonnen! Jede Reflexion bringt dich einen Schritt näher an deine Ziele.");
        }
      } catch (e) {
        setMilestoneNote("Deine Lernreise hat begonnen! Jede Reflexion bringt dich einen Schritt näher an deine Ziele.");
      } finally {
        setIsLoadingMilestone(false);
      }
    }
    fetchMilestone();
  }, [userId]);

  // Compute points for the 4 pillars
  let agilePoints = 0;
  let aiPoints = 0;
  let creativityPoints = 0;
  let humanPoints = 0;

  let agileReflections = 0;
  let aiReflections = 0;
  let creativityReflections = 0;
  let humanReflections = 0;

  // 1. Calculate from course progress
  courseProgresses.forEach(cp => {
    const category = (cp.course.category || "").toLowerCase();
    const completedBlocks = Math.round((cp.percentage / 100) * cp.totalBlocks);
    
    let pillar: "agile" | "ai" | "creativity" | "human" = "human";
    if (category.includes("agile") || category.includes("leadership")) {
      pillar = "agile";
    } else if (category.includes("technology") || category.includes("ai") || category.includes("coding") || category.includes("dev")) {
      pillar = "ai";
    } else if (category.includes("creativity") || category.includes("innovation") || category.includes("design")) {
      pillar = "creativity";
    }

    if (pillar === "agile") agilePoints += completedBlocks;
    else if (pillar === "ai") aiPoints += completedBlocks;
    else if (pillar === "creativity") creativityPoints += completedBlocks;
    else humanPoints += completedBlocks;
  });

  // 2. Calculate reflection bonuses
  reflections.forEach(ref => {
    // Find course of this reflection to determine category
    const course = courseProgresses.find(cp => cp.course.id === ref.courseId)?.course;
    const category = (course?.category || "").toLowerCase();

    let pillar: "agile" | "ai" | "creativity" | "human" = "human";
    if (category.includes("agile") || category.includes("leadership")) {
      pillar = "agile";
      agileReflections++;
    } else if (category.includes("technology") || category.includes("ai") || category.includes("coding") || category.includes("dev")) {
      pillar = "ai";
      aiReflections++;
    } else if (category.includes("creativity") || category.includes("innovation") || category.includes("design")) {
      pillar = "creativity";
      creativityReflections++;
    } else {
      humanReflections++;
    }

    // Add +2 points for writing a reflection (reflects deep competence and thinking)
    if (pillar === "agile") agilePoints += 2;
    else if (pillar === "ai") aiPoints += 2;
    else if (pillar === "creativity") creativityPoints += 2;
    else humanPoints += 2;
  });

  const maxPointsPerPillar = 50; // Cap visual fächer scale
  const agileScore = Math.min(100, Math.round((agilePoints / maxPointsPerPillar) * 100));
  const aiScore = Math.min(100, Math.round((aiPoints / maxPointsPerPillar) * 100));
  const creativityScore = Math.min(100, Math.round((creativityPoints / maxPointsPerPillar) * 100));
  const humanScore = Math.min(100, Math.round((humanPoints / maxPointsPerPillar) * 100));

  const pillars = [
    { name: t("radar_agile"), score: agileScore, points: agilePoints, reflections: agileReflections, color: "var(--coral)", strokeClass: "stroke-coral", bgClass: "bg-coral/10 text-coral" },
    { name: t("radar_ai"), score: aiScore, points: aiPoints, reflections: aiReflections, color: "var(--blue)", strokeClass: "stroke-blue", bgClass: "bg-blue/10 text-blue" },
    { name: t("radar_creativity"), score: creativityScore, points: creativityPoints, reflections: creativityReflections, color: "rgb(245, 158, 11)", strokeClass: "stroke-amber-500", bgClass: "bg-amber-500/10 text-amber-600" },
    { name: t("radar_human"), score: humanScore, points: humanPoints, reflections: humanReflections, color: "rgb(168, 85, 247)", strokeClass: "stroke-purple-500", bgClass: "bg-purple-500/10 text-purple-600" },
  ];

  // Filters reflections based on timeline search query
  const filteredReflections = reflections.filter(ref => {
    const textMatch = ref.content.toLowerCase().includes(searchQuery.toLowerCase());
    return textMatch;
  });

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Kompetenz-Profil Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth Radar Arcs Card */}
        <div className="lg:col-span-2 cell border border-line bg-paper p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <span className="eyebrow text-blue">{t("growth_title")}</span>
                <h3 className="h-lg mt-1 font-heading font-extrabold uppercase tracking-tight text-ink">{t("growth_title")}</h3>
              </div>
              <button 
                onClick={handleGenerateWeeklyReport}
                className="btn blue text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center gap-1.5"
                style={{ background: "var(--blue)", color: "var(--on-blue)", border: "none" }}
              >
                <Sparkles className="w-3.5 h-3.5" /> {lang === "de" ? "KI-Wochenbericht" : "AI Weekly Report"}
              </button>
            </div>
            <p className="text-xs text-ink-3 max-w-md leading-relaxed mb-6">
              {t("growth_desc")}
            </p>

            {/* SVG Arcs Fächer Visualisation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center mt-6">
              <div className="flex justify-center">
                <svg width="220" height="220" viewBox="0 0 120 120" className="transform -rotate-90">
                  {/* Outer Rings */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--line-soft)" strokeWidth="0.5" />
                  <circle cx="60" cy="60" r="38" fill="none" stroke="var(--line-soft)" strokeWidth="0.5" strokeDasharray="2 2" />
                  <circle cx="60" cy="60" r="26" fill="none" stroke="var(--line-soft)" strokeWidth="0.5" strokeDasharray="2 2" />

                  {/* Arcs */}
                  {/* Pillar 1: Agile */}
                  <circle 
                    cx="60" cy="60" r="50" 
                    fill="none" 
                    stroke="var(--line-soft)" 
                    strokeWidth="4" 
                  />
                  <circle 
                    cx="60" cy="60" r="50" 
                    fill="none" 
                    className="stroke-coral"
                    strokeWidth="4.5" 
                    strokeDasharray="314" 
                    strokeDashoffset={314 - (314 * (agileScore * 0.95)) / 100}
                    strokeLinecap="round"
                  />

                  {/* Pillar 2: AI */}
                  <circle 
                    cx="60" cy="60" r="38" 
                    fill="none" 
                    stroke="var(--line-soft)" 
                    strokeWidth="4" 
                  />
                  <circle 
                    cx="60" cy="60" r="38" 
                    fill="none" 
                    className="stroke-blue"
                    strokeWidth="4.5" 
                    strokeDasharray="238" 
                    strokeDashoffset={238 - (238 * (aiScore * 0.95)) / 100}
                    strokeLinecap="round"
                  />

                  {/* Pillar 3: Creativity */}
                  <circle 
                    cx="60" cy="60" r="26" 
                    fill="none" 
                    stroke="var(--line-soft)" 
                    strokeWidth="4" 
                  />
                  <circle 
                    cx="60" cy="60" r="26" 
                    fill="none" 
                    stroke="rgb(245, 158, 11)"
                    strokeWidth="4.5" 
                    strokeDasharray="163" 
                    strokeDashoffset={163 - (163 * (creativityScore * 0.95)) / 100}
                    strokeLinecap="round"
                  />

                  {/* Center Dot */}
                  <circle cx="60" cy="60" r="6" fill="var(--paper-3)" />
                </svg>
              </div>

              {/* Legend with Scores */}
              <div className="space-y-4">
                {pillars.map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                        {p.name}
                      </span>
                      <span className="font-mono text-slate-500 font-bold">{p.points} {t("points_lbl")}</span>
                    </div>
                    <div className="flex gap-2 text-[9px] font-mono text-slate-400">
                      <span>{p.reflections} {t("reflection_bonus")}</span>
                      <span>•</span>
                      <span>{Math.max(0, p.points - p.reflections * 2)} {t("completed_blocks")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-line mt-6 pt-4 flex justify-between text-[10px] font-mono text-slate-400">
            <span>MAX SCALE: {maxPointsPerPillar} PTS</span>
            <span>INTELLIGENT INTEGRATION MATRIX</span>
          </div>
        </div>

        {/* AI Companion Review Card */}
        <div className="cell border border-line bg-paper p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-green mb-3">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold">{t("ai_milestone_title")}</span>
            </div>
            <h4 className="font-heading font-extrabold uppercase text-lg mb-1">{t("ai_milestone_title")}</h4>
            <p className="text-xs text-ink-3 leading-relaxed mb-4">
              {t("ai_milestone_desc")}
            </p>

            {isLoadingMilestone ? (
              <div className="space-y-2.5 py-6">
                <div className="h-3.5 bg-slate-100 rounded animate-pulse w-full"></div>
                <div className="h-3.5 bg-slate-100 rounded animate-pulse w-5/6"></div>
                <div className="h-3.5 bg-slate-100 rounded animate-pulse w-11/12"></div>
                <div className="h-3.5 bg-slate-100 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <div className="relative bg-slate-50 border border-slate-200/50 p-4 rounded-xl mt-4">
                <Quote className="w-8 h-8 text-slate-200 absolute -top-3 -left-2 rotate-180 z-0" />
                <p className="text-xs text-slate-700 leading-relaxed font-mono relative z-1 italic">
                  {milestoneNote}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-line mt-6 pt-4 text-[9px] font-mono text-slate-400 uppercase">
            Gemini 2.5 Active Coaching Sync
          </div>
        </div>
      </div>

      {/* 2. Insights Logbook Section (Timeline) */}
      <div className="space-y-6">
        <div className="sec-head">
          <div>
            <h2>{t("insights_timeline")}</h2>
            <span className="meta">{t("insights_desc").toUpperCase()}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pad">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-line rounded-xl outline-none focus:border-blue bg-paper text-slate-800 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Reflections timeline */}
        <div className="pad">
          {filteredReflections.length === 0 ? (
            <div className="cell border border-line bg-paper p-8 text-center rounded-xl">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h5 className="font-heading font-bold text-slate-700">{t("no_reflections")}</h5>
              <p className="text-xs text-slate-400 mt-1">{t("no_reflections_sub")}</p>
            </div>
          ) : (
            <div className="relative border-l border-line-soft ml-3 pl-6 space-y-6 py-2">
              {filteredReflections.map((ref, idx) => {
                const date = new Date(ref.createdAt);
                const formattedDate = date.toLocaleDateString(lang === "de" ? 'de-DE' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div key={ref.id || idx} className="relative group">
                    {/* Circle Node */}
                    <span className="w-3.5 h-3.5 rounded-full border border-blue bg-paper absolute -left-[32px] top-1 transition-transform group-hover:scale-110 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue"></span>
                    </span>

                    {/* Content Card */}
                    <div className="cell bg-paper border border-line p-5 rounded-xl transition-all group-hover:border-line-hover shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> {formattedDate}
                        </span>
                        {ref.courseId && (
                          <span className="tag text-[9px] uppercase tracking-wide font-mono px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                            {courseProgresses.find(cp => cp.course.id === ref.courseId)?.course.title || "Skill Sprint"}
                          </span>
                        )}
                      </div>
                      
                      {/* Thoughtful citation layout */}
                      <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium mb-3">
                        {ref.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Report Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)", position: "fixed" }}
        >
          <div 
            className="bg-paper border border-line rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col gap-6"
            style={{ 
              backgroundColor: "var(--paper)", 
              borderColor: "var(--line)", 
              maxHeight: "85vh", 
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer font-bold text-lg"
              style={{ fontSize: 18 }}
            >
              ✕
            </button>

            {isLoadingReport ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue" style={{ color: "var(--blue)" }} />
                <p className="text-xs text-ink-3 font-mono">KI analysiert deine Lernwoche...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-emerald-green">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-wider font-bold">Wöchentliches Lern-Review</span>
                </div>
                
                <div>
                  <h3 className="h-lg font-heading font-extrabold uppercase tracking-tight text-ink animate-reveal" style={{ fontSize: 24 }}>
                    Dein Kompetenz-Bericht
                  </h3>
                  <div className="text-[10px] font-mono text-slate-400 uppercase mt-1">
                    Zeitraum: Letzte 7 Tage
                  </div>
                </div>

                <div className="space-y-5 divide-y divide-line pt-2">
                  
                  {/* Summary */}
                  <div className="space-y-2">
                    <h5 className="text-xs uppercase font-mono font-bold text-blue tracking-wider">Didaktische Übersicht</h5>
                    <p className="text-xs text-slate-700 leading-relaxed font-mono">
                      {weeklyReport?.summary}
                    </p>
                  </div>

                  {/* Cognitive Depth */}
                  <div className="space-y-2 pt-4">
                    <h5 className="text-xs uppercase font-mono font-bold text-coral tracking-wider">Reflexions-Tiefe & Haltung</h5>
                    <p className="text-xs text-slate-700 leading-relaxed font-mono">
                      {weeklyReport?.cognitiveDepth}
                    </p>
                  </div>

                  {/* Competency Focus */}
                  <div className="space-y-2 pt-4">
                    <h5 className="text-xs uppercase font-mono font-bold text-amber-500 tracking-wider">Fokus-Zukunftskompetenz</h5>
                    <p className="text-xs text-slate-700 leading-relaxed font-mono">
                      {weeklyReport?.competencyFocus}
                    </p>
                  </div>

                  {/* Transfer Challenge */}
                  <div className="space-y-2 pt-4">
                    <h5 className="text-xs uppercase font-mono font-bold text-purple-500 tracking-wider">Praktische Transferaufgabe</h5>
                    <div className="p-4 bg-emerald-green/5 border border-emerald-green/20 rounded-xl">
                      <p className="text-xs text-slate-800 leading-relaxed font-mono font-medium">
                        {weeklyReport?.transferChallenge}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reality Check Quote */}
                {weeklyReport?.closingQuote && (
                  <div className="relative bg-slate-50 border border-slate-200/50 p-4 rounded-xl mt-4">
                    <Quote className="w-8 h-8 text-slate-200 absolute -top-3 -left-2 rotate-180 z-0" />
                    <p className="text-xs text-slate-600 leading-relaxed font-mono relative z-1 italic">
                      "{weeklyReport.closingQuote}"
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="btn blue text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl border-none cursor-pointer"
                    style={{ background: "var(--blue)", color: "var(--on-blue)" }}
                  >
                    Schließen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
