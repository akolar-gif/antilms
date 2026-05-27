"use client";

import { useState } from "react";
import { LearningBlock, Reflection } from "@/types";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Award } from "lucide-react";

interface ReflectionBlockProps {
  block: LearningBlock;
  initialReflection?: Reflection;
  onSave?: (content: string, confidence: number, difficulty: number) => Promise<void>;
}

export function ReflectionBlock({ block, initialReflection, onSave }: ReflectionBlockProps) {
  const [reflectionText, setReflectionText] = useState(initialReflection?.content || "");
  const [confidence, setConfidence] = useState(initialReflection?.confidence || 3);
  const [difficulty, setDifficulty] = useState(initialReflection?.difficulty || 3);
  const [isSubmitted, setIsSubmitted] = useState(!!initialReflection);
  const [isSaving, setIsSaving] = useState(false);

  let reflectionData = null;
  try {
    reflectionData = JSON.parse(block.content);
  } catch (e) {
    return <div className="text-red-500">Failed to load reflection content.</div>;
  }

  const handleSubmit = async () => {
    if (!reflectionText.trim()) return;
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(reflectionText, confidence, difficulty);
      }
      setIsSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-plum/5 rounded-xl border border-plum/20 p-8 my-8 shadow-sm transition-all hover:shadow-md">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-plum/10 text-plum rounded-full text-xs font-bold tracking-wider mb-6">
        <Brain className="w-3.5 h-3.5" /> Reflection Prompt
      </div>
      
      <h3 className="text-xl font-heading font-semibold text-slate-800 mb-4">
        {reflectionData.reflectionPrompt}
      </h3>
      
      {reflectionData.followUpQuestions && reflectionData.followUpQuestions.length > 0 && (
        <ul className="list-disc pl-5 space-y-2 mb-6 text-slate-700 text-sm">
          {reflectionData.followUpQuestions.map((q: string, idx: number) => (
            <li key={idx}>{q}</li>
          ))}
        </ul>
      )}

      {!isSubmitted ? (
        <div className="space-y-6">
          <textarea
            className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:border-plum focus:ring-1 focus:ring-plum outline-none resize-y text-slate-700 text-sm shadow-inner transition-all"
            rows={5}
            placeholder="Write your reflection here..."
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
          />

          {/* Dynamic Sliders / Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/50 p-4 rounded-xl border border-slate-100/50">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Self-Assessed Confidence (1 - 5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setConfidence(val)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${
                      confidence === val
                        ? "bg-plum text-white border-plum shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">1 = Low Confidence, 5 = Ready to coach others</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Perceived Difficulty (1 - 5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDifficulty(val)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${
                      difficulty === val
                        ? "bg-plum/20 text-plum border-plum/30 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">1 = Very Simple, 5 = Highly Complex</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!reflectionText.trim() || isSaving}
              className="bg-plum hover:bg-plum/90 text-white font-semibold"
            >
              {isSaving ? "Saving..." : "Submit Reflection"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-plum/20 mt-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-plum uppercase tracking-wider flex items-center gap-1">
              <Award className="w-4 h-4" /> Your Reflection
            </h4>
            <div className="flex gap-4 text-xs font-medium text-slate-500">
              <span>Confidence: <strong className="text-plum">{confidence}/5</strong></span>
              <span>Difficulty: <strong className="text-plum">{difficulty}/5</strong></span>
            </div>
          </div>
          <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{reflectionText}</p>
          <div className="pt-2 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsSubmitted(false)} 
              className="text-xs text-slate-500 hover:text-plum hover:bg-plum/5"
            >
              Edit Reflection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
