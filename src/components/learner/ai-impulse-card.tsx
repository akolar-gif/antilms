"use client";

import { useState, useEffect } from "react";
import { Sparkles, Quote, Brain } from "lucide-react";

interface AIImpulseCardProps {
  lang: "de" | "en";
  reflectionsCount: number;
}

export function AIImpulseCard({ lang, reflectionsCount }: AIImpulseCardProps) {
  const [data, setData] = useState<{ reminder: string; quote: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchImpulse() {
      try {
        const res = await fetch("/api/ai-impulse");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchImpulse();
  }, [reflectionsCount]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 bg-line border border-line">
        <div className="cell bg-paper p-5 flex flex-col justify-between min-h-[140px] animate-pulse">
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 rounded w-1/3"></div>
            <div className="h-3.5 bg-slate-100 rounded w-full"></div>
            <div className="h-3.5 bg-slate-100 rounded w-5/6"></div>
          </div>
          <div className="h-2.5 bg-slate-100 rounded w-1/4 mt-4"></div>
        </div>
        <div className="cell bg-paper p-5 flex flex-col justify-between min-h-[140px] animate-pulse">
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 rounded w-1/3"></div>
            <div className="h-3.5 bg-slate-100 rounded w-full"></div>
            <div className="h-3.5 bg-slate-100 rounded w-4/5"></div>
          </div>
          <div className="h-2.5 bg-slate-100 rounded w-1/4 mt-4"></div>
        </div>
      </div>
    );
  }

  const reminder = data?.reminder || (lang === "de" ? "Konzentriere dich auf deine aktuellen Lernschwerpunkte." : "Focus on your current learning objectives.");
  const quote = data?.quote || (lang === "de" ? "Agilität bedeutet, Fehler in kürzeren Sprints zu wiederholen." : "Agility means repeating errors in shorter sprints.");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 bg-line border border-line">
      {/* Card 1: AI Didaktischer Rückblick */}
      <div className="cell bg-paper p-5 flex flex-col justify-between min-h-[140px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow font-mono text-[9px] text-blue font-bold tracking-wider uppercase">
              {lang === "de" ? "Didaktischer Rückblick" : "Didactic Review"}
            </span>
            <Sparkles className="w-4 h-4 text-blue" style={{ opacity: 0.6 }} />
          </div>
          <p className="text-xs text-ink leading-relaxed font-mono">
            "{reminder}"
          </p>
        </div>
        <div className="text-[8px] text-ink-3 font-mono tracking-wide uppercase mt-4">
          {lang === "de" ? "Fokus auf deine Lernschwerpunkte" : "Focus on your learning key points"}
        </div>
      </div>

      {/* Card 2: AI Reality Check / Satirischer Spruch */}
      <div className="cell bg-paper p-5 flex flex-col justify-between min-h-[140px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow font-mono text-[9px] text-coral font-bold tracking-wider uppercase">
              Reality Check
            </span>
            <Quote className="w-4 h-4 text-coral" style={{ opacity: 0.6 }} />
          </div>
          <p className="text-xs text-ink leading-relaxed font-mono italic">
            "{quote}"
          </p>
        </div>
        <div className="text-[8px] text-ink-3 font-mono tracking-wide uppercase mt-4">
          {lang === "de" ? "Ironische innoversity weisheit" : "Ironic innoversity wisdom"}
        </div>
      </div>
    </div>
  );
}
