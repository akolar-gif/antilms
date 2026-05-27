"use client";

import { useState } from "react";
import { askMentorAction } from "@/app/actions/ai";

export function MentorChat({ 
  courseId, 
  moduleId, 
  activeContext,
  moduleTitle
}: { 
  courseId: string; 
  moduleId: string; 
  activeContext?: string;
  moduleTitle?: string;
}) {
  const [messages, setMessages] = useState<{role: 'user'|'mentor', text: string}[]>([
    {
      role: 'mentor',
      text: moduleTitle 
        ? `Hi! I'm Anka, your learning companion. I'm here to support you in the module "${moduleTitle}". I can see the current block you are working on, so feel free to ask me anything!`
        : "Hi! I'm here to support your learning journey. I can see the block you are currently looking at, so feel free to ask me questions if you get stuck!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askMentorAction({
        learnerMessage: userText,
        courseContext: courseId,
        moduleContext: moduleId + (activeContext ? `\n\nCurrent Active Block Context:\n${activeContext}` : ''),
      });

      setMessages(prev => [...prev, { 
        role: 'mentor', 
        text: `${response.answer}\n\n${response.question || ''}\n\n${response.nextStep || ''}` 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'mentor', text: "Sorry, I'm having trouble thinking right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <aside className="w-80 border-l border-slate-200 bg-white flex flex-col hidden lg:flex shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 h-full">
      <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-royal-blue to-plum rounded-full flex items-center justify-center text-white font-bold shadow-inner">
          A
        </div>
        <div>
          <h3 className="font-heading font-semibold text-slate-800 leading-tight">Anka AI</h3>
          <p className="text-xs text-slate-500">Learning Companion</p>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-4 rounded-xl shadow-sm border ${msg.role === 'mentor' ? 'bg-white border-slate-100 rounded-tl-none' : 'bg-royal-blue/10 border-royal-blue/20 text-slate-800 rounded-tr-none ml-8'}`}>
            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 rounded-tl-none mr-8">
            <p className="text-sm text-slate-400 animate-pulse">Thinking...</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleSubmit} className="relative">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 pr-10 border border-slate-200 rounded-xl text-sm resize-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-royal-blue focus:border-transparent outline-none transition-all"
            rows={2}
            placeholder="Ask a question or share a thought..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-3 bottom-3 text-royal-blue hover:text-royal-blue/80 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </form>
      </div>
    </aside>
  );
}
