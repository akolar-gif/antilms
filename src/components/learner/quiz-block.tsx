"use client";

import { useState } from "react";
import { LearningBlock } from "@/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export function QuizBlock({ block }: { block: LearningBlock }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  let quizData = null;
  try {
    quizData = JSON.parse(block.content);
  } catch (e) {
    return <div className="text-red-500">Failed to load quiz content.</div>;
  }

  const handleSelect = (option: string) => {
    if (!isSubmitted) setSelectedOption(option);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const isCorrect = selectedOption === quizData.correctAnswer;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 my-8">
      <div className="inline-block px-3 py-1 bg-royal-blue/10 text-royal-blue rounded-full text-xs font-bold tracking-wider mb-6">
        Knowledge Check
      </div>
      
      <h3 className="text-xl font-heading font-semibold text-slate-800 mb-6">
        {quizData.question}
      </h3>

      <div className="space-y-3 mb-6">
        {quizData.options.map((option: string, idx: number) => {
          let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
          
          if (!isSubmitted) {
            buttonClass += selectedOption === option 
              ? "border-royal-blue bg-royal-blue/5 text-royal-blue" 
              : "border-slate-100 hover:border-slate-300 bg-slate-50 text-slate-700";
          } else {
            if (option === quizData.correctAnswer) {
              buttonClass += "border-emerald-green bg-emerald-green/10 text-emerald-green";
            } else if (option === selectedOption && option !== quizData.correctAnswer) {
              buttonClass += "border-red-500 bg-red-50 text-red-600";
            } else {
              buttonClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              className={buttonClass}
              onClick={() => handleSelect(option)}
              disabled={isSubmitted}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isSubmitted && option === quizData.correctAnswer && <CheckCircle2 size={20} />}
                {isSubmitted && option === selectedOption && option !== quizData.correctAnswer && <XCircle size={20} />}
              </div>
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedOption}
          className="w-full bg-royal-blue hover:bg-royal-blue/90 text-white"
        >
          Check Answer
        </Button>
      ) : (
        <div className={`p-4 rounded-lg ${isCorrect ? 'bg-emerald-green/10' : 'bg-red-50'} mt-6`}>
          <h4 className={`font-bold mb-2 ${isCorrect ? 'text-emerald-green' : 'text-red-600'}`}>
            {isCorrect ? "Correct!" : "Not quite right."}
          </h4>
          <p className="text-slate-700 text-sm">
            {quizData.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
