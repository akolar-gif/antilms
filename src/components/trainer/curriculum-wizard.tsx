"use client";

import { useState } from "react";
import { GeneratedCurriculumResult, GeneratedModule, GeneratedBlock } from "@/lib/ai/provider";
import { Button } from "@/components/ui/button";
import { saveCurriculumAction } from "@/app/actions/course";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Sparkles, ChevronDown, ChevronUp, BookOpen, AlertCircle, FileText, CheckSquare, HelpCircle, Gamepad2, PenTool, Headphones } from "lucide-react";

interface CurriculumWizardProps {
  courseData: {
    title: string;
    category?: string;
    description: string;
    imageUrl?: string;
  };
  initialCurriculum: GeneratedCurriculumResult;
  onCancel: () => void;
}

export function CurriculumWizard({ courseData, initialCurriculum, onCancel }: CurriculumWizardProps) {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<GeneratedCurriculumResult>(initialCurriculum);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateModule = (modIdx: number, fields: Partial<GeneratedModule>) => {
    setCurriculum(prev => {
      const newModules = [...prev.modules];
      newModules[modIdx] = { ...newModules[modIdx], ...fields };
      return { modules: newModules };
    });
  };

  const handleUpdateBlock = (modIdx: number, blockIdx: number, fields: Partial<GeneratedBlock>) => {
    setCurriculum(prev => {
      const newModules = [...prev.modules];
      const newBlocks = [...newModules[modIdx].blocks];
      newBlocks[blockIdx] = { ...newBlocks[blockIdx], ...fields };
      newModules[modIdx] = { ...newModules[modIdx], blocks: newBlocks };
      return { modules: newModules };
    });
  };

  const handleDeleteModule = (modIdx: number) => {
    if (curriculum.modules.length <= 1) {
      toast.error("Your course must have at least one module.");
      return;
    }
    setCurriculum(prev => {
      const newModules = prev.modules.filter((_, idx) => idx !== modIdx);
      return { modules: newModules };
    });
    setActiveModuleIndex(0);
  };

  const handleDeleteBlock = (modIdx: number, blockIdx: number) => {
    setCurriculum(prev => {
      const newModules = [...prev.modules];
      const newBlocks = newModules[modIdx].blocks.filter((_, idx) => idx !== blockIdx);
      newModules[modIdx] = { ...newModules[modIdx], blocks: newBlocks };
      return { modules: newModules };
    });
  };

  const handleAddBlock = (modIdx: number, type: GeneratedBlock["type"]) => {
    const defaultContent = type === "quiz" 
      ? JSON.stringify({ question: "Sample Question?", options: ["A", "B", "C"], correctAnswer: "A", explanation: "Why A is correct" })
      : type === "reflection"
      ? JSON.stringify({ reflectionPrompt: "Reflect on this module.", followUpQuestions: [] })
      : type === "punk_game"
      ? JSON.stringify({ scenario: "Brief setup...", task: "Action plan...", timeboxMinutes: 10, evaluationCriteria: ["Criteria 1"] })
      : type === "project_task"
      ? JSON.stringify({ title: "Project Assignment", scenario: "Write a case study...", task: "Deliver a mockup...", deliverable: "Mockup file", constraints: [], reflectionPrompt: "How did it go?" })
      : type === "audio"
      ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      : "Write your reading content here...";

    const newBlock: GeneratedBlock = {
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Block`,
      content: defaultContent,
      learningMode: type === "quiz" ? "test" : type === "reflection" ? "reflect" : type === "project_task" ? "apply" : type === "punk_game" ? "challenge" : "understand"
    };

    setCurriculum(prev => {
      const newModules = [...prev.modules];
      newModules[modIdx] = {
        ...newModules[modIdx],
        blocks: [...newModules[modIdx].blocks, newBlock]
      };
      return { modules: newModules };
    });
  };

  const handleAddModule = () => {
    const newModule: GeneratedModule = {
      title: `Module ${curriculum.modules.length + 1}: Title`,
      description: "Brief description of the learning goals in this module.",
      learningObjectives: ["Understand core concepts"],
      blocks: [
        {
          type: "text",
          title: "Introduction",
          content: "Welcome to this module.",
          learningMode: "understand"
        }
      ]
    };
    setCurriculum(prev => ({
      modules: [...prev.modules, newModule]
    }));
    setActiveModuleIndex(curriculum.modules.length);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving and generating course...");
    try {
      const result = await saveCurriculumAction(courseData, curriculum);
      toast.success("Course created successfully!", { id: toastId });
      router.push(`/trainer/courses/${result.courseId}`);
    } catch (error) {
      setIsSaving(false);
      toast.error("Failed to save course", { id: toastId });
    }
  };

  const getBlockIcon = (type: GeneratedBlock["type"]) => {
    switch (type) {
      case "quiz": return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case "reflection": return <Brain className="w-4 h-4 text-purple-500" />;
      case "punk_game": return <Gamepad2 className="w-4 h-4 text-emerald-green" />;
      case "project_task": return <PenTool className="w-4 h-4 text-royal-blue" />;
      case "video": return <BookOpen className="w-4 h-4 text-red-500" />;
      case "code": return <FileText className="w-4 h-4 text-blue-500" />;
      case "audio": return <Headphones className="w-4 h-4 text-coral" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const Brain = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925-3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 1-.495-7.467 5.99 5.99 0 0 1 1.925-3.546 5.974 5.974 0 0 0 2.133-1A3.75 3.75 0 0 1 12 18Z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Wizard Header */}
        <div className="bg-gradient-to-r from-emerald-green to-royal-blue p-6 text-white flex items-center justify-between">
          <div>
            <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider mb-2 inline-block">
              AI Co-Designed Curriculum
            </span>
            <h2 className="text-2xl font-heading font-bold">{courseData.title}</h2>
            <p className="text-white/80 text-xs mt-1 font-light italic">{courseData.category || "Uncategorized"} • Preview and edit the structure before saving</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-sm font-medium">Anka AI Draft Ready</span>
          </div>
        </div>

        {/* Wizard Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation: Modules */}
          <aside className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Modules</span>
              <Button size="xs" variant="outline" onClick={handleAddModule} className="gap-1 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Module
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {curriculum.modules.map((mod, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveModuleIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between group cursor-pointer select-none ${
                    activeModuleIndex === idx
                      ? "bg-white border-royal-blue shadow-sm ring-1 ring-royal-blue/30 text-royal-blue font-medium"
                      : "border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex-1 mr-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${activeModuleIndex === idx ? 'text-royal-blue/70' : 'text-slate-400'}`}>
                      Module {idx + 1}
                    </span>
                    <span className="text-sm line-clamp-1">{mod.title || "Untitled Module"}</span>
                    <span className="text-xs text-slate-400 block mt-0.5 font-light">{mod.blocks.length} blocks</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModule(idx);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 w-7 h-7 -mr-1 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </aside>

          {/* Right Area: Module Editor */}
          <main className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {curriculum.modules[activeModuleIndex] && (
                <motion.div
                  key={activeModuleIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Module Details Form */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5">Module Title</label>
                      <input
                        type="text"
                        value={curriculum.modules[activeModuleIndex].title}
                        onChange={(e) => handleUpdateModule(activeModuleIndex, { title: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-royal-blue focus:ring-1 focus:ring-royal-blue transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5">Module Description</label>
                      <textarea
                        value={curriculum.modules[activeModuleIndex].description}
                        onChange={(e) => handleUpdateModule(activeModuleIndex, { description: e.target.value })}
                        rows={2}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-royal-blue focus:ring-1 focus:ring-royal-blue transition-all resize-none font-light"
                      />
                    </div>
                  </div>

                  {/* Blocks Curriculum inside active module */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-sm font-semibold text-slate-800">Learning Blocks Curriculum</h4>
                      
                      {/* Block insertion quick menu */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs text-slate-400 mr-2">Add block:</span>
                        <Button size="xs" variant="outline" className="text-[10px] px-2 py-1" onClick={() => handleAddBlock(activeModuleIndex, "text")}>+ Text</Button>
                        <Button size="xs" variant="outline" className="text-[10px] px-2 py-1" onClick={() => handleAddBlock(activeModuleIndex, "quiz")}>+ Quiz</Button>
                        <Button size="xs" variant="outline" className="text-[10px] px-2 py-1" onClick={() => handleAddBlock(activeModuleIndex, "reflection")}>+ Reflection</Button>
                        <Button size="xs" variant="outline" className="text-[10px] px-2 py-1" onClick={() => handleAddBlock(activeModuleIndex, "project_task")}>+ Project</Button>
                        <Button size="xs" variant="outline" className="text-[10px] px-2 py-1" onClick={() => handleAddBlock(activeModuleIndex, "punk_game")}>+ Challenge</Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {curriculum.modules[activeModuleIndex].blocks.map((block, bIdx) => (
                        <div 
                          key={bIdx}
                          className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-all hover:shadow-sm"
                        >
                          <div className="flex items-center space-x-3 flex-1 mr-4">
                            <div className="p-2 bg-slate-100 rounded-lg">
                              {getBlockIcon(block.type)}
                            </div>
                            <div className="flex-1">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">{block.type}</span>
                              <input
                                type="text"
                                value={block.title}
                                onChange={(e) => handleUpdateBlock(activeModuleIndex, bIdx, { title: e.target.value })}
                                className="w-full py-0.5 font-medium text-slate-800 text-sm bg-transparent border-b border-transparent hover:border-slate-200 focus:border-royal-blue focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteBlock(activeModuleIndex, bIdx)}
                            className="hover:bg-red-50 hover:text-red-600 rounded-lg w-8 h-8 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* Wizard Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
            Back & Change Request
          </Button>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-light mr-2">
              All generated blocks contain matching core curriculum contents.
            </span>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-emerald-green hover:bg-emerald-green/90 text-white px-6">
              {isSaving ? (
                <>Saving & Building...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Save & Construct Course
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
