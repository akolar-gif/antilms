"use client";

import { useState, useRef, useEffect } from "react";
import { askMentorAction } from "@/app/actions/ai";
import { AIglyph, I } from "@/components/layout/icons";
import { useTranslation } from "@/components/layout/language-context";

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
  const { t, language } = useTranslation();

  const initialGreeting = moduleTitle 
    ? t("tutor.greeting_module", { moduleTitle })
    : t("tutor.greeting_default");

  const [messages, setMessages] = useState<{role: 'user'|'mentor', text: string}[]>([]);

  // Initialize messages once on client side to match the translation hook
  useEffect(() => {
    setMessages([
      {
        role: 'mentor',
        text: initialGreeting
      }
    ]);
  }, []);

  // Update greeting text if language changes and we haven't started chatting yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'mentor') {
        return [{ role: 'mentor', text: initialGreeting }];
      }
      return prev;
    });
  }, [language, initialGreeting]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const tools = [
    { id: "sum", name: t("tutor.sum_name"), desc: t("tutor.sum_desc") },
    { id: "explain", name: t("tutor.explain_name"), desc: t("tutor.explain_desc") },
    { id: "quiz", name: t("tutor.quiz_name"), desc: t("tutor.quiz_desc") },
    { id: "deeper", name: t("tutor.deeper_name"), desc: t("tutor.deeper_desc") },
  ];

  // Auto scroll to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
      const response = await askMentorAction({
        learnerMessage: text,
        courseContext: courseId,
        moduleContext: moduleId + (activeContext ? `\n\nAktueller aktiver Block:\n${activeContext}` : ''),
        language
      });

      const formattedAnswer = `${response.answer}${response.question ? `\n\n${response.question}` : ''}${response.nextStep ? `\n\n${response.nextStep}` : ''}`;
      setMessages(prev => [...prev, { 
        role: 'mentor', 
        text: formattedAnswer
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'mentor', text: t("tutor.connection_error") }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToolClick = (toolId: string) => {
    let prompt = "";
    if (toolId === "sum") prompt = language === "en" ? "Summarize this module in 3 short points." : "Fasse dieses Modul in 3 kurzen Punkten zusammen.";
    else if (toolId === "explain") prompt = language === "en" ? "Explain the content of this module simpler, using a clear analogy." : "Erkläre mir den Inhalt dieses Moduls einfacher und benutze eine verständliche Analogie.";
    else if (toolId === "quiz") prompt = language === "en" ? "Ask me a short understanding question about the current topic." : "Stelle mir eine kurze Verständnisfrage zum aktuellen Thema.";
    else if (toolId === "deeper") prompt = language === "en" ? "Go deeper into the topic of the module and explain an advanced aspect." : "Gehe tiefer in das Thema des Moduls ein und erkläre mir einen fortgeschrittenen Aspekt.";
    
    sendMessage(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    sendMessage(text);
  };

  return (
    <aside className="assistant w-full lg:w-auto border-l border-line bg-paper-2 flex flex-col hidden lg:flex h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.03)] z-10">
      {/* Assistant Head */}
      <div className="asst-head p-5 border-b border-line flex items-center gap-3">
        <AIglyph size={20} color="var(--blue)" />
        <div>
          <div className="ttl font-display font-extrabold text-sm text-ink uppercase tracking-wide">Anka AI</div>
          <div className="sub font-mono text-[9px] text-ink-3">{t("tutor.context")}</div>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="asst-tools grid grid-cols-2 gap-2 p-4 border-b border-line">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => handleToolClick(t.id)}
            disabled={isLoading}
            className="tool border border-line rounded-xl p-3 bg-paper text-left transition-all hover:border-ink hover:-translate-y-[1px] disabled:opacity-40"
          >
            <span className="tname block font-display font-bold text-xs text-ink">{t.name}</span>
            <span className="tdesc block font-mono text-[9px] text-ink-3 mt-1 leading-tight">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="asst-feed flex-1 overflow-y-auto p-4 flex flex-col gap-4" ref={feedRef}>
        {messages.map((m, i) => (
          <div key={i} className={`msg max-w-[88%] ${m.role === 'mentor' ? 'ai self-start' : 'me self-end'}`}>
            <div className="who font-mono text-[9px] text-ink-3 mb-1.5 uppercase tracking-wider">
              {m.role === 'mentor' ? 'ANKA AI' : (language === 'en' ? 'ME' : 'ICH')}
            </div>
            <div 
              className={`bubble p-4 text-xs leading-relaxed ${
                m.role === 'mentor' 
                  ? 'bg-paper border border-line rounded-2xl rounded-tl-none text-ink' 
                  : 'bg-ink text-paper rounded-2xl rounded-tr-none'
              }`}
              style={{ whiteSpace: "pre-line" }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="msg ai self-start">
            <div className="who font-mono text-[9px] text-ink-3 mb-1.5 uppercase tracking-wider">ANKA AI</div>
            <div className="bubble bg-paper border border-line rounded-2xl rounded-tl-none p-4">
              <span className="thinking inline-flex gap-1.5 items-center">
                <i className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-bounce"></i>
                <i className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-bounce delay-150"></i>
                <i className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-bounce delay-300"></i>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input Field */}
      <form onSubmit={handleSubmit} className="asst-input p-4 border-t border-line flex gap-2.5 items-center bg-paper">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          disabled={isLoading}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={t("tutor.placeholder")}
          className="flex-1 border border-line rounded-xl px-4 py-3 outline-none bg-paper text-xs text-ink focus:border-ink placeholder-ink-3 transition-colors"
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="send w-11 h-11 border-none rounded-xl bg-blue text-paper flex items-center justify-center transition-transform hover:-translate-y-[1px] disabled:opacity-50"
        >
          <I.send style={{ width: 18, height: 18 }} />
        </button>
      </form>
    </aside>
  );
}
