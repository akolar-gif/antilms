"use client";

import { useState } from "react";
import { Course, Module, LearningBlock } from "@/types";
import { CourseBuilder } from "@/components/trainer/course-builder";
import { AICoDesigner } from "@/components/trainer/ai-co-designer";
import { createBlockAction } from "@/app/actions/store";
import { updateModuleAction } from "@/app/actions/course";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ModuleEditorClient({
  course,
  module,
  initialBlocks
}: {
  course: Course;
  module: Module;
  initialBlocks: LearningBlock[];
}) {
  const [blocks, setBlocks] = useState<LearningBlock[]>(initialBlocks);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState(module.title);
  const [moduleDesc, setModuleDesc] = useState(module.description);

  const handleSaveModule = async () => {
    const toastId = toast.loading("Saving module settings...");
    try {
      await updateModuleAction(course.id, module.id, { title: moduleTitle, description: moduleDesc });
      setIsEditingModule(false);
      toast.success("Module settings saved", { id: toastId });
    } catch (error) {
      toast.error("Failed to save module settings", { id: toastId });
    }
  };

  const handleAddProposedBlock = async (proposedBlock: {
    type: LearningBlock["type"];
    title: string;
    content: string;
    learningMode: LearningBlock["learningMode"];
  }) => {
    const toastId = toast.loading("Adding block...");
    try {
      const newBlock = await createBlockAction(course.id, {
        moduleId: module.id,
        type: proposedBlock.type,
        title: proposedBlock.title,
        content: proposedBlock.content,
        learningMode: proposedBlock.learningMode,
        source: 'ai_assisted',
      });
      setBlocks(prev => [...prev, newBlock]);
      toast.success("Block added from Co-Designer!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to add block", { id: toastId });
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            {isEditingModule ? (
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4">
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Module Title</label>
                  <input 
                    type="text" 
                    value={moduleTitle} 
                    onChange={e => setModuleTitle(e.target.value)} 
                    className="w-full font-heading font-bold text-xl text-slate-800 p-2 border border-slate-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Module Description</label>
                  <textarea 
                    value={moduleDesc} 
                    onChange={e => setModuleDesc(e.target.value)} 
                    rows={2}
                    className="w-full text-slate-600 p-2 border border-slate-300 rounded resize-none"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingModule(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveModule} className="bg-emerald-green hover:bg-emerald-green/90 text-white">Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <div className="absolute right-0 top-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/learner/courses/${course.id}/modules/${module.id}`} target="_blank">
                    <Button variant="outline" size="sm" className="text-royal-blue border-royal-blue/30 hover:bg-royal-blue/5">
                      👁️ Preview as Learner
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => setIsEditingModule(true)}>
                    Edit
                  </Button>
                </div>
                <h2 className="text-2xl font-heading font-bold text-slate-800 pr-48">{module.title}</h2>
                <p className="text-slate-600 mt-2">{module.description}</p>
              </div>
            )}
          </div>

          <CourseBuilder 
            course={course} 
            module={module} 
            blocks={blocks} 
            setBlocks={setBlocks} 
          />
        </div>
      </div>

      <AICoDesigner 
        courseTitle={course.title} 
        moduleTitle={module.title} 
        moduleDescription={module.description} 
        blocks={blocks} 
        onAddBlock={handleAddProposedBlock}
      />
    </>
  );
}
