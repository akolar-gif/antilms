"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AIglyph, I } from "@/components/layout/icons";

interface QuizQuestion {
  id: string;
  q: string;
  opts: string[];
  correct: number;
  fb: string;
  fbWrong: string;
}

export function LearnerPracticeClient({
  initialQuizzes
}: {
  initialQuizzes: QuizQuestion[];
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const q = initialQuizzes[idx];
  const total = initialQuizzes.length;
  const isCorrect = picked === q.correct;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
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
    setIdx(0);
    setPicked(null);
    setDone(false);
    setScore(0);
  };

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="screen">
        {/* Topbar Header */}
        <header className="topbar">
          <div className="tb-left">
            <div>
              <div className="eyebrow">DAILY PRACTICE · COMPLETE</div>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
                Training
              </div>
            </div>
          </div>
        </header>

        <div className="quiz px-6 py-12 max-w-2xl mx-auto">
          <div className="eyebrow text-slate-500 font-mono">Sitzung Beendet</div>
          <h1 className="display big font-black text-slate-800 text-6xl mt-2 mb-6">
            {score} / {total}
          </h1>

          <div className="feedback border border-line rounded-2xl overflow-hidden mt-0 bg-paper-2 shadow-sm">
            <div className="fh flex items-center gap-2.5 px-4 py-3 bg-ink text-paper text-sm font-semibold uppercase font-display tracking-wider">
              <AIglyph size={18} />
              <span>AI Coach</span>
            </div>
            <div className="fb p-5 text-sm text-ink-2 leading-relaxed">
              {pct >= 66 ? (
                <span>
                  Hervorragende Sitzung! Du hast die Kernkonzepte zum <b>kombinatorischen Lernen</b> gut verinnerlicht. 
                  Als nächsten Schritt empfehle ich dir, dein Wissen in den Projektarbeiten praktisch anzuwenden. Ein kurzes Refresher-Element wurde in deinen Pfad eingereiht.
                </span>
              ) : (
                <span>
                  Guter Versuch! Konzentriere dich beim nächsten Durchlauf darauf, dass <b>neue Ideen oft Rekombinationen bestehender Konzepte</b> sind.
                  Ich habe dir ein kurzes Erklärvideo vorbereitet und werde diese Fragen in deiner nächsten Übungseinheit in zwei Tagen wieder einstreuen.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button className="btn solid" onClick={reset}>Noch einmal</button>
            <button className="btn ghost" onClick={() => router.push("/learner")}>
              Zurück zum Studio <I.arrow className="arrow" style={{ width: 18, height: 18 }} />
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
            <div className="eyebrow">DAILY PRACTICE · AI-COACHED</div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
              Training
            </div>
          </div>
        </div>
      </header>

      <div className="quiz px-6 py-12 max-w-2xl mx-auto">
        <div className="qtop flex justify-between items-center mb-8">
          <div className="eyebrow font-mono text-xs text-ink-2">
            FRAGE {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>
          <div className="qprog flex gap-1.5">
            {initialQuizzes.map((_, i) => (
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
                  {isCorrect ? "Richtig" : "Nicht ganz"} · AI Feedback
                </span>
              </div>
              <div 
                className="fb p-5 text-sm leading-relaxed text-ink-2"
                dangerouslySetInnerHTML={{ __html: isCorrect ? q.fb : q.fbWrong }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {picked !== null && (
          <div className="flex justify-end mt-6">
            <button className="btn solid flex items-center gap-2" onClick={next}>
              {idx + 1 >= total ? "Ergebnisse ansehen" : "Nächste Frage"} 
              <I.arrow className="arrow" style={{ width: 18, height: 18 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
