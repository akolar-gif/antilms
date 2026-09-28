"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AIglyph, I } from "@/components/layout/icons";
import { useTranslation } from "@/components/layout/language-context";

interface QuizQuestion {
  id: string;
  q: string;
  opts: string[];
  correct: number;
  fb: string;
  fbWrong: string;
}

function getRandomSessionQuizzes(pool: QuizQuestion[], count = 3): QuizQuestion[] {
  if (!pool || pool.length === 0) return [];
  if (pool.length <= count) return pool;
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function renderFormattedText(text: string) {
  if (!text) return null;
  const parts = text.split(/(<b>.*?<\/b>|\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("<b>") && part.endsWith("</b>")) {
          return <strong key={i} className="font-bold text-ink">{part.slice(3, -4)}</strong>;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-bold text-ink">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </span>
  );
}

export function LearnerPracticeClient({
  initialQuizzes
}: {
  initialQuizzes: QuizQuestion[];
}) {
  const router = useRouter();
  const [sessionQuizzes, setSessionQuizzes] = useState<QuizQuestion[]>(() =>
    getRandomSessionQuizzes(initialQuizzes, 3)
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const { language, t } = useTranslation();

  const q = sessionQuizzes[idx] || sessionQuizzes[0];
  const total = sessionQuizzes.length || 3;
  const isCorrect = q && picked === q.correct;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setAnsweredCount(prev => prev + 1);
    if (q && i === q.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= total) {
      setDone(true);
      return;
    }
    setIdx(idx + 1);
    setPicked(null);
  };

  const reset = () => {
    setSessionQuizzes(getRandomSessionQuizzes(initialQuizzes, 3));
    setIdx(0);
    setPicked(null);
    setDone(false);
    setScore(0);
    setAnsweredCount(0);
  };

  if (!q) {
    return (
      <div className="screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Keine Trainingsfragen gefunden.</p>
          <button className="btn solid" onClick={() => router.push("/learner")}>Zurück zum Studio</button>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="screen">
        {/* Topbar Header */}
        <header className="topbar">
          <div className="tb-left">
            <div>
              <div className="eyebrow">
                {language === "de" ? "TÄGLICHES TRAINING · BEENDET" : "DAILY PRACTICE · COMPLETE"}
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
                {t("nav.train")}
              </div>
            </div>
          </div>
        </header>

        <div className="quiz px-6 py-12 max-w-2xl mx-auto">
          <div className="eyebrow text-slate-500 font-mono">
            {language === "de" ? "Drei-Fragen-Sitzung beendet" : "Three-Question Session Completed"}
          </div>
          <h1 className="display big font-black text-slate-800 text-6xl mt-2 mb-6">
            {score} / {total}
          </h1>

          <div className="feedback border border-line rounded-2xl overflow-hidden mt-0 bg-paper-2 shadow-sm">
            <div className="fh flex items-center gap-2.5 px-4 py-3 bg-ink text-paper text-sm font-semibold uppercase font-display tracking-wider">
              <AIglyph size={18} />
              <span>AI Coach Auswertung</span>
            </div>
            <div className="fb p-5 text-sm text-ink-2 leading-relaxed">
              {pct >= 66 ? (
                language === "de" ? (
                  <span>
                    <b>Hervorragende Leistung!</b> Du hast {score} von {total} Fragen richtig beantwortet ({pct}%). 
                    Deine Kenntnisse in diesen Kernkonzepten sind sehr gut verankert.
                  </span>
                ) : (
                  <span>
                    <b>Excellent performance!</b> You answered {score} out of {total} questions correctly ({pct}%). 
                    Your understanding of these core concepts is strong.
                  </span>
                )
              ) : (
                language === "de" ? (
                  <span>
                    <b>Guter Durchlauf!</b> Du hast {score} von {total} Fragen richtig beantwortet ({pct}%). 
                    Wiederhole gerne ein weiteres 3-Fragen-Paket, um die Grundlagen noch weiter zu festigen.
                  </span>
                ) : (
                  <span>
                    <b>Good effort!</b> You answered {score} out of {total} questions correctly ({pct}%). 
                    Feel free to start another 3-question set to strengthen your understanding.
                  </span>
                )
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button className="btn solid" onClick={reset}>
              {language === "de" ? "Weiteres 3-Fragen-Training starten" : "Start Another 3-Question Practice"}
            </button>
            <button className="btn ghost" onClick={() => router.push("/learner")}>
              {language === "de" ? "Zurück zum Studio" : "Back to Studio"} <I.arrow className="arrow" style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      {/* Topbar Header */}
      <header className="topbar">
        <div className="tb-left">
          <div>
            <div className="eyebrow">
              {language === "de" ? "TÄGLICHES TRAINING · KI-COACHED" : "DAILY PRACTICE · AI-COACHED"}
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
              {t("nav.train")}
            </div>
          </div>
        </div>
      </header>

      <div className="quiz px-6 py-12 max-w-2xl mx-auto">
        <div className="qtop flex justify-between items-center mb-8">
          <div className="eyebrow font-mono text-xs text-ink-2">
            {language === "de" ? "FRAGE" : "QUESTION"} {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>
          <div className="qprog flex gap-1.5 items-center">
            {sessionQuizzes.map((_, i) => (
              <span 
                key={i} 
                className={`seg w-8 h-1.5 rounded-full transition-all duration-300 ${
                  i < idx ? "bg-ink" : i === idx ? "bg-coral" : "bg-paper-3"
                }`}
              ></span>
            ))}
          </div>
        </div>

        <h2 className="q text-3xl font-display font-extrabold text-slate-800 leading-tight mb-8">
          {q.q}
        </h2>

        <div className="opts flex flex-col gap-3">
          {q.opts.map((option, i) => {
            let cls = "opt flex items-center gap-4 text-left border border-line rounded-2xl p-5 bg-paper text-base font-medium transition-all w-full cursor-pointer hover:border-ink hover:translate-x-1";
            if (picked !== null) {
              if (i === q.correct) {
                cls = "opt flex items-center gap-4 text-left border border-blue bg-blue/10 text-blue-800 rounded-2xl p-5 text-base font-semibold w-full";
              } else if (i === picked) {
                cls = "opt flex items-center gap-4 text-left border border-coral-d bg-coral/10 text-coral-d rounded-2xl p-5 text-base font-semibold w-full";
              } else {
                cls = "opt flex items-center gap-4 text-left border border-line rounded-2xl p-5 bg-paper text-base font-medium transition-all w-full opacity-40 cursor-default";
              }
            }

            return (
              <button
                key={i}
                className={cls}
                disabled={picked !== null}
                onClick={() => pick(i)}
              >
                <span className={`key font-mono font-bold w-7 h-7 rounded-lg border border-line flex items-center justify-center text-xs ${
                  picked !== null && i === q.correct 
                    ? "bg-blue text-paper border-blue" 
                    : picked !== null && i === picked 
                    ? "bg-coral-d text-white border-coral-d" 
                    : "bg-paper text-ink"
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="feedback border border-line rounded-2xl overflow-hidden mt-6 shadow-xs bg-paper-2"
            >
              <div className="fh flex items-center gap-2.5 px-4 py-3 bg-ink text-paper text-xs font-semibold uppercase font-display tracking-wider">
                <AIglyph size={16} />
                <span>
                  {(isCorrect ? t("practice.feedback_correct") : t("practice.feedback_wrong"))} · AI Feedback
                </span>
              </div>
              <div className="fb p-5 text-sm leading-relaxed text-ink-2">
                {renderFormattedText(isCorrect ? q.fb : q.fbWrong)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {picked !== null && (
          <div className="flex items-center justify-between mt-6">
            <button
              className="text-xs font-mono text-ink-3 hover:text-ink underline transition-colors cursor-pointer"
              onClick={() => setDone(true)}
            >
              {language === "de" ? "Auswertung jetzt anzeigen" : "Show evaluation now"}
            </button>
            
            <button className="btn solid flex items-center gap-2" onClick={next}>
              {idx + 1 >= total ? (language === "de" ? "Ergebnisse ansehen" : "View results") : t("practice.next")} 
              <I.arrow className="arrow" style={{ width: 18, height: 18 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
