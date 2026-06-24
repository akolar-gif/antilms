"use client";

import { useState, useTransition } from "react";
import { Course, Module, LearningBlock, Reflection } from "@/types";
import { getFrictionAnalysisAction } from "@/app/actions/analytics";
import { Sparkles, Users, Award, BarChart3, MessageSquare, AlertTriangle, CheckCircle2, Play, ChevronRight, Loader2 } from "lucide-react";

interface CourseAnalyticsClientProps {
  course: Course;
  modules: Module[];
  blocks: LearningBlock[];
  progressData: { userId: string; userName: string; completedBlocks: string[] }[];
  reflections: (Reflection & { userName: string; blockTitle: string })[];
}

export function CourseAnalyticsClient({
  course,
  modules,
  blocks,
  progressData,
  reflections,
}: CourseAnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "blocks" | "reflections" | "students">("ai");
  const [aiReport, setAiReport] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const totalBlocks = blocks.length;
  const totalStudents = progressData.length;

  // 1. Calculate average completion rate
  let avgCompletion = 0;
  if (totalStudents > 0 && totalBlocks > 0) {
    const totalCompleted = progressData.reduce((acc, curr) => {
      // only count completed blocks that are actually in this course
      const courseCompletedCount = curr.completedBlocks.filter(id => 
        blocks.some(b => b.id === id)
      ).length;
      return acc + (courseCompletedCount / totalBlocks);
    }, 0);
    avgCompletion = Math.round((totalCompleted / totalStudents) * 100);
  }

  // 2. Calculate friction metrics per block
  const blockFriction = blocks.map(block => {
    const blockReflections = reflections.filter(r => r.blockId === block.id);
    const count = blockReflections.length;
    
    let avgDifficulty = 0;
    let avgConfidence = 0;
    
    if (count > 0) {
      avgDifficulty = blockReflections.reduce((sum, r) => sum + r.difficulty, 0) / count;
      avgConfidence = blockReflections.reduce((sum, r) => sum + r.confidence, 0) / count;
    }

    const moduleTitle = modules.find(m => m.id === block.moduleId)?.title || "Unbekanntes Modul";

    return {
      blockId: block.id,
      title: block.title,
      type: block.type,
      moduleTitle,
      reflectionCount: count,
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      // High friction: Avg difficulty >= 3.5 OR Avg confidence <= 2.5
      isHighFriction: count > 0 && (avgDifficulty >= 3.5 || avgConfidence <= 2.5)
    };
  }).filter(b => b.reflectionCount > 0)
    .sort((a, b) => b.avgDifficulty - a.avgDifficulty); // Sort by difficulty descending

  const highFrictionCount = blockFriction.filter(b => b.isHighFriction).length;

  const triggerAIAnalysis = () => {
    startTransition(async () => {
      const res = await getFrictionAnalysisAction(course.id);
      setAiReport(res.content);
    });
  };

  // Helper to render Gemini's Markdown cleanly in our theme without external dependencies
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    const formatBoldText = (t: string) => {
      const parts = t.split(/\*\*(.*?)\*\*/g);
      if (parts.length === 1) return t;
      return parts.map((part, i) => 
        i % 2 === 1 ? <strong key={i} className="font-bold text-ink">{part}</strong> : part
      );
    };

    return text.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold mt-6 mb-3 text-ink uppercase tracking-wider font-mono flex items-center gap-2 border-b pb-2 border-line-soft">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="text-base font-bold mt-8 mb-4 text-ink flex items-center gap-2 border-b pb-2 border-line">
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h2 key={idx} className="text-lg font-extrabold mt-10 mb-4 text-blue uppercase tracking-tight">
            {line.replace("# ", "")}
          </h2>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-ink-2 mb-2 leading-relaxed">
            {formatBoldText(line.substring(2))}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-3" />;
      }
      return (
        <p key={idx} className="text-xs text-ink-2 mb-3 leading-relaxed">
          {formatBoldText(line)}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "var(--paper)" }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="eyebrow flex items-center gap-1" style={{ color: "var(--blue)" }}>
              <BarChart3 className="w-3.5 h-3.5" /> Analysen & Berichte
            </span>
            <h2 className="display" style={{ fontSize: 32, marginTop: 4 }}>Kurs-Fortschritt & Reflexionen</h2>
            <p className="text-xs text-ink-2 mt-1">Überwache den Fortschritt der Lernenden und erhalte KI-gestützte Vorschläge zur Kursverbesserung.</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-paper border border-line rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue/10 flex items-center justify-center text-blue">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-ink-3 uppercase block">Teilnehmer</span>
              <span className="text-2xl font-display font-extrabold text-ink">{totalStudents}</span>
            </div>
          </div>

          <div className="bg-paper border border-line rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-green/10 flex items-center justify-center text-emerald-green-d">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-ink-3 uppercase block">Ø Kursfortschritt</span>
              <span className="text-2xl font-display font-extrabold text-ink">{avgCompletion}%</span>
            </div>
          </div>

          <div className="bg-paper border border-line rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-ink-3 uppercase block">Aktive Reflexionen</span>
              <span className="text-2xl font-display font-extrabold text-ink">{reflections.length}</span>
            </div>
          </div>

          <div className="bg-paper border border-line rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-ink-3 uppercase block">Reibungspunkte</span>
              <span className="text-2xl font-display font-extrabold text-ink">
                {highFrictionCount} <span className="text-xs font-normal text-ink-3">/ {blockFriction.length} Blöcken</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-line gap-2">
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "ai"
                ? "border-blue text-blue"
                : "border-transparent text-ink-3 hover:text-ink hover:border-line"
            }`}
          >
            <Sparkles className="w-4 h-4" /> KI-Friction-Analysis
          </button>
          <button
            onClick={() => setActiveTab("blocks")}
            className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "blocks"
                ? "border-blue text-blue"
                : "border-transparent text-ink-3 hover:text-ink hover:border-line"
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Reibungspunkte ({highFrictionCount})
          </button>
          <button
            onClick={() => setActiveTab("reflections")}
            className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "reflections"
                ? "border-blue text-blue"
                : "border-transparent text-ink-3 hover:text-ink hover:border-line"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Alle Reflexionen ({reflections.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "students"
                ? "border-blue text-blue"
                : "border-transparent text-ink-3 hover:text-ink hover:border-line"
            }`}
          >
            <Users className="w-4 h-4" /> Lernerfortschritt ({totalStudents})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[400px]">
          
          {/* TAB 1: AI Friction Analysis */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm flex flex-col gap-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-ink">KI-Feedback-Zusammenfassung</h3>
                    <p className="text-xs text-ink-2 mt-1">Die KI aggregiert alle studentischen Kommentare, analysiert Frustrationen und gibt Empfehlungen.</p>
                  </div>
                  <button 
                    onClick={triggerAIAnalysis}
                    disabled={isPending}
                    className="btn solid flex items-center gap-2 text-xs py-2 px-4 rounded-xl"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {aiReport ? "Erneut analysieren" : "Analyse generieren"}
                  </button>
                </div>

                <div className="border-t border-line pt-6">
                  {isPending ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-blue" />
                      <p className="text-xs font-mono uppercase text-ink-2">Gemini analysiert Schüler-Reflexionen...</p>
                    </div>
                  ) : aiReport ? (
                    <div className="prose max-w-none bg-paper-2 rounded-2xl p-6 border border-line-soft">
                      {renderMarkdown(aiReport)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Sparkles className="w-12 h-12 text-blue/30 mb-3" />
                      <p className="text-sm font-semibold text-ink">Klicke oben auf den Button, um die KI-gestützte Analyse zu starten.</p>
                      <p className="text-xs text-ink-3 mt-1 max-w-sm">Dafür wertet Gemini die Stimmung und Schwierigkeitsgrade aller abgegebenen Reflexionen aus.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Friction Points by Block */}
          {activeTab === "blocks" && (
            <div className="space-y-4">
              {blockFriction.length === 0 ? (
                <div className="bg-paper border border-line rounded-2xl p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-green-d/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-ink">Keine Reibungspunkte verzeichnet!</p>
                  <p className="text-xs text-ink-3 mt-1">Sobald Lernende Reflexionen abgeben, bewertet die App hier die Schwierigkeiten.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {blockFriction.map(block => (
                    <div 
                      key={block.blockId} 
                      className={`bg-paper border rounded-2xl p-5 shadow-sm transition-all flex justify-between items-center ${
                        block.isHighFriction 
                          ? "border-red-200 bg-red-50/10 hover:border-red-300" 
                          : "border-line hover:border-line-soft"
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-paper-2 border border-line-soft text-ink-2">
                            {block.moduleTitle}
                          </span>
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue/10 text-blue">
                            {block.type}
                          </span>
                          {block.isHighFriction && (
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Hohe Reibung
                            </span>
                          )}
                        </div>
                        <h4 className="font-display font-extrabold text-md text-ink mt-2">{block.title}</h4>
                        <p className="text-[11px] text-ink-3">{block.reflectionCount} Reflexionen abgegeben</p>
                      </div>

                      <div className="flex gap-4 items-center">
                        <div className="text-center bg-paper-2 p-3 rounded-xl border border-line-soft min-w-[70px]">
                          <span className="text-[9px] font-mono text-ink-3 uppercase block">Schwierig.</span>
                          <span className={`text-md font-display font-extrabold block ${block.avgDifficulty >= 3.5 ? "text-red-500" : "text-ink"}`}>
                            {block.avgDifficulty} <span className="text-[10px] text-ink-3">/5</span>
                          </span>
                        </div>
                        <div className="text-center bg-paper-2 p-3 rounded-xl border border-line-soft min-w-[70px]">
                          <span className="text-[9px] font-mono text-ink-3 uppercase block">Zuversicht</span>
                          <span className={`text-md font-display font-extrabold block ${block.avgConfidence <= 2.5 ? "text-red-500" : "text-emerald-green-d"}`}>
                            {block.avgConfidence} <span className="text-[10px] text-ink-3">/5</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: All Reflections Log */}
          {activeTab === "reflections" && (
            <div className="space-y-4">
              {reflections.length === 0 ? (
                <div className="bg-paper border border-line rounded-2xl p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-ink-3/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-ink">Bislang keine Reflexionen vorliegend</p>
                  <p className="text-xs text-ink-3 mt-1">Lernende geben am Ende von Abschnitten Feedback ab, welches hier aufgelistet wird.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reflections.map(r => (
                    <div key={r.id} className="bg-paper border border-line rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start flex-wrap gap-2 border-b border-line-soft pb-3">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue">{r.blockTitle}</span>
                          <h4 className="text-sm font-bold text-ink mt-0.5">{r.userName}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-ink-3">
                          {new Date(r.createdAt).toLocaleDateString("de-DE", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-xs text-ink-2 italic bg-paper-2 p-3.5 rounded-xl border border-line-soft">
                        &quot;{r.content}&quot;
                      </p>

                      <div className="flex gap-4 mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-ink-3 uppercase">Schwierigkeit:</span>
                          <span className="text-xs font-bold text-ink">{r.difficulty}/5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-ink-3 uppercase">Zuversicht:</span>
                          <span className="text-xs font-bold text-ink">{r.confidence}/5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Learner Progress List */}
          {activeTab === "students" && (
            <div className="bg-paper border border-line rounded-2xl overflow-hidden shadow-sm">
              {progressData.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-ink-3/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-ink">Bislang keine Teilnehmer registriert</p>
                  <p className="text-xs text-ink-3 mt-1">Schüler müssen diesen Kurs erst aufrufen, um registriert zu werden.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-paper-2 border-b border-line text-[10px] font-mono uppercase tracking-wider text-ink-3">
                      <th className="p-4 pl-6">Lerner-Name</th>
                      <th className="p-4">Fortschritt (Blöcke)</th>
                      <th className="p-4 text-right pr-6">Abschlussrate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressData.map(student => {
                      const completedCount = student.completedBlocks.filter(id => 
                        blocks.some(b => b.id === id)
                      ).length;
                      const pct = totalBlocks > 0 ? Math.round((completedCount / totalBlocks) * 100) : 0;
                      
                      return (
                        <tr key={student.userId} className="border-b border-line-soft hover:bg-paper-2 transition-colors text-xs">
                          <td className="p-4 pl-6 font-bold text-ink">{student.userName}</td>
                          <td className="p-4 text-ink-2 font-mono">
                            {completedCount} <span className="text-ink-3">/ {totalBlocks} Blöcken</span>
                          </td>
                          <td className="p-4 text-right pr-6 font-bold">
                            <div className="flex items-center justify-end gap-3">
                              <span className={pct === 100 ? "text-emerald-green-d" : "text-ink"}>{pct}%</span>
                              <div className="w-24 bg-paper-3 h-1.5 rounded-full overflow-hidden border border-line-soft hidden sm:block">
                                <div 
                                  className="h-full bg-blue" 
                                  style={{ width: `${pct}%`, background: pct === 100 ? "var(--emerald-green-d)" : "var(--blue)" }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
