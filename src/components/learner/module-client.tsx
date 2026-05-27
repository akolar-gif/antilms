"use client";

import { useState } from "react";
import { LearningBlock, Reflection } from "@/types";
import { QuizBlock } from "./quiz-block";
import { ReflectionBlock } from "./reflection-block";
import { PunkGameBlock } from "./punk-game-block";
import { ProjectTaskBlock } from "./project-task-block";
import { MentorChat } from "@/components/ai/mentor-chat";
import { RecommendationCard } from "@/components/learning/recommendation-card";
import { generateRecommendation } from "@/lib/learning/adaptive-engine";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { markBlockCompletedAction, saveReflectionAction } from "@/app/actions/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleComplete = async (blockId: string) => {
    if (completed.includes(blockId)) return;
    
    // Optimistic UI update
    setCompleted(prev => {
      const newCompleted = [...prev, blockId];
      if (newCompleted.length === blocks.length) {
        toast.success("Module completed! 🎉", {
          description: "You've finished all the blocks in this module."
        });
      } else {
        toast.success("Block completed!");
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

  const moduleBlockIds = blocks.map(b => b.id);
  const completedSet = new Set(completed);
  const completedInModule = blocks.filter(b => completedSet.has(b.id));
  const progressPercentage = blocks.length > 0 ? Math.min(100, Math.round((completedInModule.length / blocks.length) * 100)) : 0;
  
  // Calculate recommendation dynamically
  const recommendation = generateRecommendation(completedInModule.map(b => b.id), blocks, reflections);

  const handleRecommendationAction = (type: string) => {
    if (type === "mentor") {
      const textarea = document.querySelector("aside textarea");
      if (textarea) {
        (textarea as HTMLTextAreaElement).focus();
        textarea.scrollIntoView({ behavior: "smooth" });
        toast.info("Anka AI is waiting in the side panel!");
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
    <>
      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h1 className="text-3xl font-heading font-bold text-slate-800">{moduleTitle}</h1>
            <p className="text-slate-600 mt-3 font-light mb-6 text-sm">{moduleDescription}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
              <div 
                className="bg-royal-blue h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-4">{progressPercentage}% Completed</p>

            {/* Dynamic Adaptive Recommendation Card */}
            <RecommendationCard 
              recommendation={recommendation} 
              onExecuteAction={handleRecommendationAction}
            />
          </div>

          <div className="space-y-12">
            <AnimatePresence>
              {blocks.map((block, index) => (
                <motion.div 
                  key={block.id}
                  id={`block-card-${block.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: activeBlock && activeBlock.id !== block.id ? 0.6 : 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative cursor-pointer"
                  onClick={() => setActiveBlock(block)}
                >
                  {/* Block Content Rendered Sequentially */}
                  {block.type !== 'quiz' && block.type !== 'reflection' && block.type !== 'video' && block.type !== 'code' && block.type !== 'punk_game' && block.type !== 'project_task' && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-heading font-semibold text-xl text-slate-800 mb-4">{block.title}</h3>
                      <div className="text-slate-700 leading-relaxed font-sans text-base whitespace-pre-wrap">
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
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
                      <h3 className="font-heading font-semibold text-xl text-slate-800 mb-4">{block.title}</h3>
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-md">
                        <iframe 
                          src={block.content.includes("youtube.com") ? block.content : "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {block.type === 'code' && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
                      <h3 className="font-heading font-semibold text-xl text-slate-800 mb-4">{block.title}</h3>
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] text-[#c9d1d9] p-4 text-sm font-mono overflow-x-auto shadow-inner">
                        <pre><code>{block.content}</code></pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Completion UI for standard non-interactive blocks */}
                  {block.type !== 'reflection' && block.type !== 'project_task' && block.type !== 'punk_game' && (
                    <div className="mt-4 flex justify-end">
                      {completed.includes(block.id) ? (
                        <span className="text-green-600 font-medium flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplete(block.id);
                          }}
                          className="hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors text-xs"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Progress Connection Line (except last) */}
                  {index < blocks.length - 1 && (
                    <div className="absolute -bottom-8 left-1/2 w-px h-8 bg-slate-200"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            <div className="pt-12 border-t border-slate-200 flex flex-col items-center">
              <h4 className="font-heading font-semibold text-lg text-slate-800 mb-4">Module Complete</h4>
              <p className="text-slate-600 text-center mb-6 text-sm">Take a moment to review before moving to the next challenge.</p>
              <div className="flex space-x-4">
                <Button variant="outline">Review Notes</Button>
                <Button>Next Module</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MentorChat 
        courseId={courseId} 
        moduleId={moduleId} 
        activeContext={(() => {
          const currentBlock = activeBlock || blocks.find(b => !completed.includes(b.id)) || blocks[0];
          return currentBlock ? `Block Title: ${currentBlock.title}\nBlock Content: ${currentBlock.content}` : undefined;
        })()}
        moduleTitle={moduleTitle}
      />
    </>
  );
}
