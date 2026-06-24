"use client";

import { useState } from "react";
import Link from "next/link";
import { LearningBlock, Reflection } from "@/types";
import { QuizBlock } from "./quiz-block";
import { ReflectionBlock } from "./reflection-block";
import { PunkGameBlock } from "./punk-game-block";
import { ProjectTaskBlock } from "./project-task-block";
import { AudioBlock } from "./audio-block";
import { WrapUpChat } from "./wrap-up-chat";
import { MentorChat } from "@/components/ai/mentor-chat";
import { RecommendationCard } from "@/components/learning/recommendation-card";
import { generateRecommendation } from "@/lib/learning/adaptive-engine";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play, Check } from "lucide-react";
import { markBlockCompletedAction, saveReflectionAction } from "@/app/actions/progress";
import { TopBar, I, AIglyph } from "@/components/layout/icons";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/components/layout/language-context";

export function LearnerModuleClient({
  moduleTitle,
  moduleDescription,
  courseId,
  moduleId,
  blocks,
  completedBlocks,
  initialReflections = []
}: {
  moduleTitle: string;
  moduleDescription: string;
  courseId: string;
  moduleId: string;
  blocks: LearningBlock[];
  completedBlocks: string[];
  initialReflections?: Reflection[];
}) {
  const [activeBlock, setActiveBlock] = useState<LearningBlock | null>(null);
  const [completed, setCompleted] = useState<string[]>(completedBlocks);
  const [reflections, setReflections] = useState<Reflection[]>(initialReflections);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [wrapUpCompleted, setWrapUpCompleted] = useState(false);
  const { language, t } = useTranslation();

  const handleComplete = async (blockId: string) => {
    if (completed.includes(blockId)) return;
    
    // Optimistic UI update
    setCompleted(prev => {
      const newCompleted = [...prev, blockId];
      if (newCompleted.length === blocks.length) {
        toast.success(t("module.toast_module_completed"), {
          description: t("module.toast_module_completed_desc")
        });
      } else {
        toast.success(t("module.toast_block_completed"));
      }
      return newCompleted;
    });
    
    // Server action
    await markBlockCompletedAction(courseId, blockId, moduleId);
  };

  const handleSaveReflection = async (blockId: string, content: string, confidence: number, difficulty: number) => {
    const saved = await saveReflectionAction(blockId, content, confidence, difficulty);
    setReflections(prev => {
      const filtered = prev.filter(r => r.blockId !== blockId);
      return [...filtered, saved];
    });
    
    // Also auto-complete the reflection block
    await handleComplete(blockId);
  };

  const completedSet = new Set(completed);
  const completedInModule = blocks.filter(b => completedSet.has(b.id));
  const progressPercentage = blocks.length > 0 ? Math.min(100, Math.round((completedInModule.length / blocks.length) * 100)) : 0;
  
  // Calculate recommendation dynamically
  const recommendation = generateRecommendation(completedInModule.map(b => b.id), blocks, reflections, {}, language);

  const handleRecommendationAction = (type: string) => {
    if (type === "mentor") {
      setTutorOpen(true);
      const textarea = document.querySelector("aside input");
      if (textarea) {
        (textarea as HTMLInputElement).focus();
        toast.info(t("module.toast_tutor_ready"));
      }
    } else {
      const nextBlock = blocks.find(b => !completed.includes(b.id));
      if (nextBlock) {
        const element = document.getElementById(`block-card-${nextBlock.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* TopBar Header */}
      <TopBar title={moduleTitle} sub={language === "de" ? "LERNPFAD MODUL" : "LEARNING PATH MODULE"} />

      {/* Reader Wrap: split reader / assistant */}
      <div className={`reader-wrap flex-1 overflow-hidden relative ${tutorOpen ? "tutor-open" : ""}`}>
        {/* Left Side: Scrollable Document Reader */}
        <article className="reader flex-1 overflow-y-auto px-6 py-12 md:px-16 md:py-16">
          <div className="w-full max-w-[820px] mx-auto">
            {/* Header Description Cover Card */}
          <div className="cell p2 border border-line rounded-2xl mb-12 flex flex-col gap-5">
            <span className="eyebrow text-ink-3">{t("reader.intro")}</span>
            <h1 className="h-lg text-ink font-display font-extrabold text-3xl leading-tight">
              {moduleTitle}
            </h1>
            <p className="text-sm text-ink-2 font-light leading-relaxed">
              {moduleDescription}
            </p>
            
            <div className="w-full mt-2">
              <div className="progress-line bg-paper-3 h-1.5 rounded-full overflow-hidden">
                <i style={{ width: `${progressPercentage}%` }}></i>
              </div>
              <p className="text-[10px] font-mono text-ink-3 uppercase mt-2">{progressPercentage}% {t("dashboard.completed")}</p>
            </div>

            {/* Dynamic Adaptive Recommendation Card */}
            <RecommendationCard 
              recommendation={recommendation} 
              onExecuteAction={handleRecommendationAction}
            />
          </div>

          {/* Sequential Block Outline */}
          <div className="space-y-12 pb-24 relative">
            <AnimatePresence>
              {blocks.map((block, index) => {
                const isBlockDone = completed.includes(block.id);
                return (
                  <motion.div 
                    key={block.id}
                    id={`block-card-${block.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: activeBlock && activeBlock.id !== block.id ? 0.6 : 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative"
                    onClick={() => setActiveBlock(block)}
                  >
                    {/* Content blocks rendered in Atelier cell sheets */}
                    {block.type !== 'quiz' && block.type !== 'reflection' && block.type !== 'video' && block.type !== 'code' && block.type !== 'punk_game' && block.type !== 'project_task' && block.type !== 'audio' && (
                      <div className="cell border border-line rounded-2xl bg-paper p-6 flex flex-col gap-4">
                        <span className="corner-no">0{index + 1}</span>
                        <h3 className="font-display font-extrabold text-xl text-ink leading-tight pr-8">{block.title}</h3>
                        <div className="text-ink-2 leading-relaxed text-sm whitespace-pre-wrap font-sans">
                          {block.content}
                        </div>
                      </div>
                    )}
                    
                    {block.type === 'quiz' && (
                      <QuizBlock block={block} />
                    )}
                    
                    {block.type === 'reflection' && (
                      <ReflectionBlock 
                        block={block} 
                        initialReflection={reflections.find(r => r.blockId === block.id)}
                        onSave={(content, confidence, difficulty) => handleSaveReflection(block.id, content, confidence, difficulty)}
                      />
                    )}

                    {block.type === 'punk_game' && (
                      <PunkGameBlock block={block} />
                    )}

                    {block.type === 'project_task' && (
                      <ProjectTaskBlock block={block} onComplete={() => handleComplete(block.id)} />
                    )}

                    {block.type === 'video' && (
                      <div className="cell border border-line rounded-2xl bg-paper p-6 flex flex-col gap-4">
                        <span className="corner-no">0{index + 1}</span>
                        <h3 className="font-display font-extrabold text-xl text-ink leading-tight pr-8">{block.title}</h3>
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-md">
                          {block.content && (block.content.includes("youtube.com") || block.content.includes("youtu.be") || block.content.includes("vimeo.com") || block.content.includes("embed")) ? (
                            <iframe 
                              src={block.content} 
                              className="w-full h-full border-none"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video 
                              src={block.content || undefined} 
                              controls 
                              className="w-full h-full object-contain bg-black"
                              preload="metadata"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {block.type === 'audio' && (
                      <AudioBlock 
                        block={block} 
                        onComplete={() => handleComplete(block.id)}
                      />
                    )}

                    {block.type === 'code' && (
                      <div className="cell border border-line rounded-2xl bg-paper p-6 flex flex-col gap-4">
                        <span className="corner-no">0{index + 1}</span>
                        <h3 className="font-display font-extrabold text-xl text-ink leading-tight pr-8">{block.title}</h3>
                        <div className="rounded-xl overflow-hidden border border-line bg-ink text-paper p-4 text-xs font-mono overflow-x-auto">
                          <pre><code>{block.content}</code></pre>
                        </div>
                      </div>
                    )}
                    
                    {/* Completion action for standard non-interactive blocks */}
                    {block.type !== 'reflection' && block.type !== 'project_task' && block.type !== 'punk_game' && block.type !== 'audio' && (
                      <div className="mt-4 flex justify-end">
                        {isBlockDone ? (
                          <span className="inline-flex items-center gap-1 text-xs font-mono uppercase text-blue-d bg-blue/10 border border-blue px-3 py-1 rounded-full">
                            <Check className="w-3.5 h-3.5" /> {t("reader.done")}
                          </span>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(block.id);
                            }}
                            className="btn sm solid flex items-center gap-1.5"
                          >
                            <Play className="w-3 h-3 fill-current" /> {t("reader.complete")}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Progress Connecting Line */}
                    {index < blocks.length - 1 && (
                      <div className="absolute -bottom-8 left-1/2 w-px h-8 bg-line-soft"></div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Fixed End-of-Module Wrap-Up Conversation */}
            <WrapUpChat 
              courseId={courseId} 
              moduleId={moduleId} 
              moduleTitle={moduleTitle}
              onChatComplete={() => setWrapUpCompleted(true)}
            />
            
            {/* End of Module panel */}
            <div className="pt-12 border-t border-line flex flex-col items-center gap-4 text-center">
              <h4 className="font-display font-extrabold text-xl text-ink">{t("reader.module_done")}</h4>
              <p className="text-ink-2 max-w-sm text-xs leading-relaxed">
                {t("reader.reflection_text")}
              </p>
              <div className="flex gap-3">
                <button className="btn sm ghost border border-line" onClick={() => setTutorOpen(true)}>{t("reader.ask_tutor")}</button>
                {wrapUpCompleted ? (
                  <Link href="/learner" className="btn sm solid bg-emerald-green hover:bg-emerald-green-d text-white">{t("wrapup.complete_btn") || "Complete Module"}</Link>
                ) : (
                  <button className="btn sm solid opacity-50 cursor-not-allowed" disabled>{t("wrapup.complete_btn") || "Complete Module"}</button>
                )}
              </div>
            </div>
          </div>
          </div>
        </article>

        {/* Right Side: AI Assistant Side Panel */}
        <MentorChat 
          courseId={courseId} 
          moduleId={moduleId} 
          activeContext={(() => {
            const currentBlock = activeBlock || blocks.find(b => !completed.includes(b.id)) || blocks[0];
            return currentBlock ? `Titel: ${currentBlock.title}\nInhalt: ${currentBlock.content}` : undefined;
          })()}
          moduleTitle={moduleTitle}
        />
      </div>

      {/* Floating AI tutor trigger button for mobile viewports */}
      <button 
        onClick={() => setTutorOpen(!tutorOpen)}
        className="tutor-fab border-none flex items-center justify-center cursor-pointer shadow-lg"
        aria-label="AI Tutor"
      >
        <AIglyph size={22} color="var(--on-blue)" />
        <span className="ml-2">{t("reader.tutor_fab")}</span>
      </button>
    </div>
  );
}
