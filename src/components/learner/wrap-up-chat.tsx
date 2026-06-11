"use client";

import { useState, useRef, useEffect } from "react";
import { askWrapUpAction } from "@/app/actions/ai";
import { AIglyph, I } from "@/components/layout/icons";
import { useTranslation } from "@/components/layout/language-context";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function WrapUpChat({
  courseId,
  moduleId,
  moduleTitle,
  onChatComplete,
}: {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  onChatComplete: () => void;
}) {
  const { t, language } = useTranslation();
  const totalTurns = 3;

  const initialGreeting = language === "en"
    ? "Hello! Let's have a quick chat about what you've learned. What was the most important takeaway for you in this module?"
    : "Hallo! Lass uns kurz über das Gelernte sprechen. Was war für dich die wichtigste Erkenntnis in diesem Modul?";

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: initialGreeting }
  ]);
  const [userInput, setUserInput] = useState("");
  const [currentTurn, setCurrentTurn] = useState(0); // number of user messages sent
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);

  // Sync greeting language if user switches language before chatting
  useEffect(() => {
    if (currentTurn === 0) {
      setMessages([{ role: "assistant", content: initialGreeting }]);
    }
  }, [language, initialGreeting, currentTurn]);

  // Auto-scroll to bottom of chat feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || isFinished) return;

    const messageToSend = userInput.trim();
    setUserInput("");
    setIsLoading(true);

    // Optimistically add user message
    const updatedMessages = [
      ...messages,
      { role: "user", content: messageToSend }
    ];
    setMessages(updatedMessages);
    
    const nextTurn = currentTurn + 1;
    setCurrentTurn(nextTurn);

    try {
      // Map history format to server action expectation
      const historyForApi = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const result = await askWrapUpAction({
        courseId,
        moduleId,
        messageHistory: historyForApi,
        userMessage: messageToSend,
        currentTurn: nextTurn,
        totalTurns
      });

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: result.reply }
      ]);

      if (result.finished || nextTurn >= totalTurns) {
        setIsFinished(true);
        onChatComplete();
        toast.success(t("wrapup.completed") || "Reflection completed!");
      }
    } catch (error) {
      console.error("Wrap up conversation failed:", error);
      toast.error("Failed to connect to Anka AI. Please try again.");
      // Rollback turn count on error
      setCurrentTurn(prev => prev - 1);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cell border border-line rounded-2xl bg-paper-2 p-6 flex flex-col gap-4 shadow-inner relative my-8">
      {/* Dialogue Header */}
      <div className="flex items-center justify-between border-b border-line-soft pb-4">
        <div className="flex items-center gap-3">
          <AIglyph size={20} color="var(--blue)" className="animate-pulse" />
          <div>
            <h4 className="font-display font-extrabold text-sm text-ink uppercase tracking-wider">
              {t("wrapup.title") || "ANKA AI WRAP-UP"}
            </h4>
            <p className="text-[10px] text-ink-2 leading-relaxed">
              {t("wrapup.desc") || "Brief dialogue to reflect on the module concepts"}
            </p>
          </div>
        </div>
        
        {/* Turn indicator */}
        <div className="px-2.5 py-1 bg-paper border border-line rounded-lg font-mono text-[9px] font-bold text-ink uppercase">
          {isFinished ? (
            <span className="text-emerald-green">✓ {language === "en" ? "COMPLETE" : "ERLEDIGT"}</span>
          ) : (
            <span>
              {t("wrapup.turn", { current: Math.min(currentTurn + 1, totalTurns).toString(), total: totalTurns.toString() }) || `${Math.min(currentTurn + 1, totalTurns)} / ${totalTurns}`}
            </span>
          )}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div 
        ref={feedRef} 
        className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-2 py-2"
        style={{ minHeight: "150px" }}
      >
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col max-w-[85%] ${m.role === "assistant" ? "self-start items-start" : "self-end items-end"}`}
            >
              <span className="font-mono text-[8px] text-ink-3 uppercase tracking-wider mb-1">
                {m.role === "assistant" ? "Anka AI" : (language === "en" ? "Me" : "Ich")}
              </span>
              <div
                className={`p-3.5 text-xs leading-relaxed ${
                  m.role === "assistant"
                    ? "bg-paper border border-line rounded-2xl rounded-tl-none text-ink"
                    : "bg-ink text-paper rounded-2xl rounded-tr-none"
                }`}
                style={{ whiteSpace: "pre-line" }}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex flex-col max-w-[85%] self-start items-start">
            <span className="font-mono text-[8px] text-ink-3 uppercase tracking-wider mb-1">Anka AI</span>
            <div className="bg-paper border border-line rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
              <i className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-bounce"></i>
              <i className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-bounce delay-150"></i>
              <i className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-bounce delay-300"></i>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      {!isFinished ? (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-line-soft bg-transparent">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading}
            placeholder={t("wrapup.placeholder") || "Ask Anka..."}
            className="flex-1 border border-line rounded-xl px-4 py-3 outline-none bg-paper text-xs text-ink focus:border-ink placeholder-ink-3 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="w-11 h-11 border-none rounded-xl bg-blue text-paper flex items-center justify-center transition-transform hover:-translate-y-[1px] disabled:opacity-50"
          >
            <I.send style={{ width: 18, height: 18 }} />
          </button>
        </form>
      ) : (
        <div className="p-3 bg-emerald-green/10 border border-emerald-green/20 rounded-xl text-center text-xs font-medium text-emerald-green-d animate-pulse">
          🎉 {t("wrapup.completed") || "Module Wrap-up completed!"}
        </div>
      )}
    </div>
  );
}
