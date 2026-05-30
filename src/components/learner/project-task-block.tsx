"use client";

import { useState } from "react";
import { LearningBlock } from "@/types";
import { Button } from "@/components/ui/button";
import { Briefcase, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/components/layout/language-context";

export function ProjectTaskBlock({ block, onComplete }: { block: LearningBlock; onComplete?: () => void }) {
  const [solution, setSolution] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();

  let taskData = {
    title: "",
    scenario: "",
    task: "",
    deliverable: "",
    constraints: [],
    reflectionPrompt: ""
  };

  try {
    taskData = JSON.parse(block.content);
  } catch (e) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="font-heading font-semibold text-xl text-slate-800 mb-2">{block.title}</h3>
        <p className="text-slate-600 text-sm">{block.content}</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!solution.trim() || !reflection.trim()) return;
    setIsSubmitted(true);
    toast.success(t("project.toast_success"));
    if (onComplete) onComplete();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm my-8">
      {/* Header */}
      <div className="p-4 bg-royal-blue/5 border-b border-royal-blue/10 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-royal-blue">
          <Briefcase className="w-5 h-5" />
          <span className="font-semibold text-sm uppercase tracking-wider">{t("project.badge")}</span>
        </div>
        <span className="text-xs font-medium text-royal-blue/70 bg-royal-blue/10 px-2 py-1 rounded-full">
          {t("project.subbadge")}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <h3 className="font-heading font-bold text-slate-800 text-xl">
            {taskData.title || block.title || t("project.default_title")}
          </h3>
        </div>

        {/* Scenario & Task */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t("project.scenario")}</h4>
            <p className="text-slate-700 text-sm leading-relaxed">{taskData.scenario}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t("project.objective")}</h4>
            <p className="text-slate-800 font-medium text-sm leading-relaxed">{taskData.task}</p>
          </div>
        </div>

        {/* Deliverable & Constraints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("project.deliverable")}</h4>
            <p className="text-slate-700 text-sm font-semibold">{taskData.deliverable}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("project.constraints")}</h4>
            <ul className="space-y-1">
              {(taskData.constraints || []).map((constraint: string, idx: number) => (
                <li key={idx} className="flex items-start text-xs text-slate-600">
                  <span className="text-royal-blue mr-1.5">•</span>
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form */}
        {!isSubmitted ? (
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t("project.solution_label")}
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder={t("project.solution_placeholder")}
                rows={4}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm focus:border-royal-blue focus:ring-1 focus:ring-royal-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t("project.reflection_label", { prompt: taskData.reflectionPrompt })}
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder={t("project.reflection_placeholder")}
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm focus:border-royal-blue focus:ring-1 focus:ring-royal-blue"
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={!solution.trim() || !reflection.trim()}
                className="bg-royal-blue hover:bg-royal-blue/90 text-white font-semibold shadow-sm"
              >
                <Send className="w-4 h-4 mr-2" /> {t("project.submit_btn")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-green/10 text-emerald-green p-6 rounded-xl border border-emerald-green/20 text-center space-y-3 flex flex-col items-center">
            <ShieldCheck className="w-10 h-10 opacity-95" />
            <h4 className="font-heading font-bold text-lg">{t("project.submitted_title")}</h4>
            <p className="text-sm opacity-90 max-w-md">
              {t("project.submitted_desc")}
            </p>
            <div className="w-full bg-white p-4 rounded-lg text-left text-xs border border-emerald-green/15 text-slate-600 mt-2">
              <strong>{t("project.submitted_deliverable")}</strong>
              <p className="mt-1 font-mono text-slate-700">{solution}</p>
              <strong className="mt-3 block">{t("project.submitted_reflection")}</strong>
              <p className="mt-1 text-slate-700 italic">"{reflection}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
