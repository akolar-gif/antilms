"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recommendation } from "@/lib/learning/adaptive-engine";
import { Sparkles, ArrowRight } from "lucide-react";
import { useTranslation } from "@/components/layout/language-context";

interface RecommendationCardProps {
  recommendation: Recommendation | null;
  onExecuteAction?: (type: Recommendation["type"]) => void;
}

export function RecommendationCard({ recommendation, onExecuteAction }: RecommendationCardProps) {
  const { t } = useTranslation();

  if (!recommendation) return null;

  const emojiMap = {
    review: "📚",
    practice: "🛠️",
    mentor: "💬",
    advance: "🚀",
    reflect: "💭"
  };

  const colorMap = {
    review: "border-royal-blue/20 bg-royal-blue/5 text-royal-blue",
    practice: "border-emerald-green/20 bg-emerald-green/5 text-emerald-green",
    mentor: "border-plum/20 bg-plum/5 text-plum",
    advance: "border-amber-500/20 bg-amber-500/5 text-amber-600",
    reflect: "border-indigo-500/20 bg-indigo-500/5 text-indigo-600"
  };

  const accentColorMap = {
    review: "bg-royal-blue",
    practice: "bg-emerald-green",
    mentor: "bg-plum",
    advance: "bg-amber-500",
    reflect: "bg-indigo-500"
  };

  const typeColor = colorMap[recommendation.type] || "border-slate-200 bg-slate-50 text-slate-700";
  const accentColor = accentColorMap[recommendation.type] || "bg-slate-500";
  const emoji = emojiMap[recommendation.type] || "🎯";

  return (
    <Card className={`relative overflow-hidden border shadow-sm transition-all duration-300 ${typeColor} mt-8`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full ${accentColor}`}></div>
      <CardContent className="pt-6 pb-6 pl-6 pr-6">
        <div className="flex items-start space-x-4">
          <div className="text-3xl p-2 bg-white rounded-xl shadow-sm border border-slate-100/50">
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-green fill-emerald-green" /> {t("recommendation.adaptive_signal")}
              </span>
            </div>
            <h4 className="font-heading font-bold text-slate-800 text-lg mb-1">
              {recommendation.title}
            </h4>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              {recommendation.description}
            </p>
            
            <div className="text-xs text-slate-400 italic mb-4 flex items-center gap-1.5 bg-white/40 p-2 rounded-lg border border-slate-100/20">
              <strong>{t("recommendation.why_this")}</strong> {recommendation.explanation}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={() => onExecuteAction?.(recommendation.type)}
                className={`text-white gap-1.5 hover:opacity-90 ${accentColor}`}
              >
                {recommendation.actionText} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
