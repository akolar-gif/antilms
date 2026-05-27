"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LearningBlock } from "@/types";

interface GenerateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (type: LearningBlock["type"], prompt: string) => Promise<void>;
  moduleObjective: string;
  contextPreview: string;
}

export function GenerateBlockModal({ 
  isOpen, 
  onClose, 
  onGenerate, 
  moduleObjective, 
  contextPreview 
}: GenerateBlockModalProps) {
  const [type, setType] = useState<LearningBlock["type"]>("text");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(type, prompt);
      onClose();
      setPrompt("");
      setType("text");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
        <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">Generate Learning Block</h2>
        <p className="text-sm text-slate-500 mb-6">Let AI create the next step in your learning journey.</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Block Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as LearningBlock["type"])}
              className="w-full p-2 border border-slate-200 rounded-md outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green bg-white"
            >
              <option value="text">Text / Theory</option>
              <option value="quiz">Quiz (Multiple Choice)</option>
              <option value="reflection">Reflection Prompt</option>
              <option value="video">Video Embed</option>
              <option value="code">Code Snippet</option>
              <option value="punk_game">Practical Challenge</option>
              <option value="project_task">Project Assignment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Custom Instructions (Optional)</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a difficult quiz about the 3 roles in Scrum..."
              rows={3}
              className="w-full p-2 border border-slate-200 rounded-md outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green resize-none text-sm"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Context</h4>
            <div className="space-y-2 text-xs text-slate-600">
              <p><span className="font-medium text-slate-700">Objective:</span> {moduleObjective}</p>
              {contextPreview && (
                <p className="line-clamp-2"><span className="font-medium text-slate-700">Previous Block:</span> {contextPreview}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose} disabled={isGenerating}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="bg-emerald-green hover:bg-emerald-green/90 text-white">
            {isGenerating ? "✨ Generating..." : "✨ Generate Block"}
          </Button>
        </div>
      </div>
    </div>
  );
}
