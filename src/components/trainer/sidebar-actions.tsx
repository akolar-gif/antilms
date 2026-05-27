"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addModuleAction, generateModuleAction } from "@/app/actions/course";
import { Sparkles, Plus, X, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function SidebarModuleActions({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const handleAddManual = async () => {
    const toastId = toast.loading("Adding empty module...");
    try {
      await addModuleAction(courseId);
      toast.success("Module added!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to add module", { id: toastId });
    }
  };

  const handleGenerateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !description) {
      toast.error("Topic and Description are required.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Anka AI is designing your module and blocks...");

    try {
      const result = await generateModuleAction(courseId, topic, description);
      toast.success("Module generated successfully!", { id: toastId });
      setIsOpen(false);
      setTopic("");
      setDescription("");
      router.push(`/trainer/courses/${courseId}/modules/${result.moduleId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate module. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
      <Button 
        variant="outline" 
        onClick={handleAddManual}
        className="w-full text-xs font-semibold py-2.5 px-3 border border-slate-200 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Empty Module
      </Button>

      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full text-xs font-semibold py-2.5 px-3 bg-emerald-green hover:bg-emerald-green/90 text-white rounded-md flex items-center justify-center gap-1.5"
      >
        <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
        Generate Module with AI
      </Button>

      {/* Generation Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-green animate-pulse" />
                  <h3 className="text-lg font-heading font-bold text-slate-800">Generate Module</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  disabled={isLoading}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateModule} className="space-y-4">
                <div>
                  <label htmlFor="modal-topic" className="block text-xs uppercase font-bold text-slate-500 mb-1.5">
                    Module Topic / Title
                  </label>
                  <input
                    type="text"
                    id="modal-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="e.g. Scrum Roles: Product Owner"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="modal-desc" className="block text-xs uppercase font-bold text-slate-500 mb-1.5">
                    Focus & Goals
                  </label>
                  <textarea
                    id="modal-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isLoading}
                    rows={3}
                    placeholder="Describe what learners should learn or achieve in this module..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green transition-all resize-none font-light"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsOpen(false)} 
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="gap-2 bg-emerald-green hover:bg-emerald-green/90 text-white"
                  >
                    <Wand2 className="w-4 h-4" />
                    {isLoading ? "Designing Module..." : "Generate Module"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
