"use client";

import { useState, useEffect } from "react";
import { LearningBlock } from "@/types";
import { Button } from "@/components/ui/button";
import { Send, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTranslation } from "@/components/layout/language-context";

export function PunkGameBlock({ block }: { block: LearningBlock }) {
  const [solution, setSolution] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { t } = useTranslation();

  let data = { scenario: "", task: "", timeboxMinutes: 0, evaluationCriteria: [] };
  try {
    data = JSON.parse(block.content);
  } catch (e) {}

  // Initialize timer
  useEffect(() => {
    if (data.timeboxMinutes > 0 && !isSubmitted && timeLeft === null) {
      setTimeLeft(data.timeboxMinutes * 60);
    }
  }, [data.timeboxMinutes, isSubmitted, timeLeft]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const handleSubmit = () => {
    if (!solution.trim()) return;
    setIsSubmitted(true);
    toast.success(t("punk.toast_success"));
  };

  const isTimeUp = timeLeft === 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-8">
      <h3 className="font-heading font-semibold text-xl text-slate-800 mb-4">{block.title}</h3>
      
      <div className="bg-white border-2 border-emerald-green/20 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-emerald-green/5 border-b border-emerald-green/10 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-green">
            <Users className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wider">{t("punk.badge")}</span>
          </div>
          <span className="text-xs font-medium text-emerald-green/70 bg-emerald-green/10 px-2 py-1 rounded-full">{t("punk.subbadge")}</span>
        </div>
        
        <div className="p-6">
          {timeLeft !== null && (
            <div className={`mb-4 inline-flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-full border ${
              isTimeUp 
                ? 'text-red-500 bg-red-50 border-red-100' 
                : timeLeft < 60 
                  ? 'text-red-500 bg-red-50 border-red-100 animate-pulse'
                  : 'text-orange-500 bg-orange-50 border-orange-100'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{t("punk.time_left", { time: formatTime(timeLeft) })}</span>
            </div>
          )}

          <div className="mb-6 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t("punk.scenario")}</h4>
              <p className="text-slate-700 text-sm">{data.scenario}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t("punk.task")}</h4>
              <p className="text-slate-900 font-medium">{data.task}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t("punk.criteria")}</h4>
            <ul className="space-y-2">
              {(data.evaluationCriteria || []).map((criteria: string, idx: number) => (
                <li key={idx} className="flex items-start text-sm text-slate-600">
                  <span className="text-emerald-green mr-2">•</span>
                  {criteria}
                </li>
              ))}
            </ul>
          </div>

          {!isSubmitted ? (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">{t("punk.solution_label")}</label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder={isTimeUp ? t("punk.time_up_placeholder") : t("punk.solution_placeholder")}
                disabled={isTimeUp}
                rows={4}
                className={`w-full p-3 border rounded-xl outline-none text-sm resize-y transition-colors ${
                  isTimeUp 
                    ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" 
                    : "border-slate-300 focus:border-emerald-green focus:ring-1 focus:ring-emerald-green"
                }`}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  disabled={!solution.trim() || isTimeUp}
                  className={`shadow-sm ${
                    isTimeUp 
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300" 
                      : "bg-emerald-green hover:bg-emerald-green/90 text-white"
                  }`}
                >
                  <Send className="w-4 h-4 mr-2" /> {isTimeUp ? t("punk.time_up_btn") : t("punk.submit_btn")}
                </Button>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-green/10 text-emerald-green p-4 rounded-xl border border-emerald-green/20 flex flex-col items-center justify-center text-center space-y-2"
            >
              <Users className="w-8 h-8 opacity-80" />
              <h4 className="font-semibold">{t("punk.submitted_title")}</h4>
              <p className="text-sm opacity-90">{t("punk.submitted_desc")}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
