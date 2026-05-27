import { useState } from "react";
import { LearningBlock } from "@/types";
import { Button } from "@/components/ui/button";

interface BlockEditorProps {
  block: LearningBlock;
  onSave: (id: string, content: string, title: string) => void;
  onCancel: () => void;
}

export function BlockEditor({ block, onSave, onCancel }: BlockEditorProps) {
  const [titleContent, setTitleContent] = useState(block.title);
  const [textContent, setTextContent] = useState(block.content);
  
  // For structured blocks, we attempt to parse their JSON
  const [structuredData, setStructuredData] = useState<any>(() => {
    if (block.type === 'quiz' || block.type === 'reflection' || block.type === 'punk_game') {
      try {
        return JSON.parse(block.content);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleSave = () => {
    if (structuredData) {
      onSave(block.id, JSON.stringify(structuredData, null, 2), titleContent);
    } else {
      onSave(block.id, textContent, titleContent);
    }
  };

  return (
    <div className="mt-4 p-4 border border-slate-200 rounded-md bg-slate-50">
      <h4 className="text-sm font-semibold mb-4 text-slate-700">Edit {block.type} Block</h4>
      
      <div className="mb-4">
        <label className="text-xs text-slate-500 font-bold uppercase">Block Title</label>
        <input 
          type="text"
          className="w-full p-2 mt-1 border border-slate-300 rounded text-sm font-semibold"
          value={titleContent}
          onChange={e => setTitleContent(e.target.value)}
        />
      </div>

      {block.type === 'quiz' && structuredData ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase">Question</label>
            <textarea 
              className="w-full p-2 mt-1 border border-slate-300 rounded text-sm"
              value={structuredData.question || ''}
              onChange={e => setStructuredData({...structuredData, question: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase">Options</label>
            {(structuredData.options || []).map((opt: string, i: number) => (
              <input 
                key={i}
                className="w-full p-2 mt-1 border border-slate-300 rounded text-sm"
                value={opt}
                onChange={e => {
                  const newOptions = [...structuredData.options];
                  newOptions[i] = e.target.value;
                  setStructuredData({...structuredData, options: newOptions});
                }}
              />
            ))}
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase">Correct Answer</label>
            <input 
              className="w-full p-2 mt-1 border border-slate-300 rounded text-sm"
              value={structuredData.correctAnswer || ''}
              onChange={e => setStructuredData({...structuredData, correctAnswer: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase">Explanation</label>
            <textarea 
              className="w-full p-2 mt-1 border border-slate-300 rounded text-sm"
              value={structuredData.explanation || ''}
              onChange={e => setStructuredData({...structuredData, explanation: e.target.value})}
            />
          </div>
        </div>
      ) : block.type === 'reflection' && structuredData ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase">Reflection Prompt</label>
            <textarea 
              className="w-full p-2 mt-1 border border-slate-300 rounded text-sm"
              rows={3}
              value={structuredData.reflectionPrompt || ''}
              onChange={e => setStructuredData({...structuredData, reflectionPrompt: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase">Follow-up Questions</label>
            <textarea 
              className="w-full p-2 mt-1 border border-slate-300 rounded text-sm"
              rows={3}
              placeholder="One question per line"
              value={(structuredData.followUpQuestions || []).join('\\n')}
              onChange={e => setStructuredData({
                ...structuredData, 
                followUpQuestions: e.target.value.split('\\n').filter(Boolean)
              })}
            />
          </div>
        </div>
      ) : block.type === 'punk_game' && structuredData ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase">Scenario</label>
            <textarea 
              className="w-full p-2 mt-1 border border-slate-300 rounded text-sm"
              rows={2}
              value={structuredData.scenario || ''}
              onChange={e => setStructuredData({...structuredData, scenario: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase">Task</label>
            <textarea 
              className="w-full p-2 mt-1 border border-slate-300 rounded text-sm"
              rows={2}
              value={structuredData.task || ''}
              onChange={e => setStructuredData({...structuredData, task: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase">Timebox (Minutes)</label>
            <input 
              type="number"
              min="1"
              max="60"
              className="w-full p-2 mt-1 border border-slate-300 rounded text-sm"
              value={structuredData.timeboxMinutes || ''}
              onChange={e => setStructuredData({...structuredData, timeboxMinutes: parseInt(e.target.value) || 5})}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase">Evaluation Criteria (3 points)</label>
            {(structuredData.evaluationCriteria || ['', '', '']).map((opt: string, i: number) => (
              <input 
                key={i}
                className="w-full p-2 mt-1 border border-slate-300 rounded text-sm"
                value={opt}
                onChange={e => {
                  const newOptions = [...(structuredData.evaluationCriteria || ['', '', ''])];
                  newOptions[i] = e.target.value;
                  setStructuredData({...structuredData, evaluationCriteria: newOptions});
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        // Generic Text / Fallback Editor
        <textarea 
          className="w-full p-3 border border-slate-300 rounded text-sm font-mono"
          rows={8}
          value={textContent}
          onChange={e => setTextContent(e.target.value)}
        />
      )}

      <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-200">
        <Button size="sm" onClick={handleSave}>Save Changes</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
