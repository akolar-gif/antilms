"use client";

import { useState } from "react";
import { Course, Module, LearningBlock } from "@/types";
import { CourseBuilder } from "@/components/trainer/course-builder";
import { AICoDesigner } from "@/components/trainer/ai-co-designer";
import { createBlockAction } from "@/app/actions/store";
import { updateModuleAction } from "@/app/actions/course";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, Edit } from "lucide-react";
import { useTranslation } from "@/components/layout/language-context";

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
  const { t } = useTranslation();

  const handleSaveModule = async () => {
    const toastId = toast.loading(t("editor.toast_saving"));
    try {
      await updateModuleAction(course.id, module.id, { title: moduleTitle, description: moduleDesc });
      setIsEditingModule(false);
      toast.success(t("editor.toast_saved"), { id: toastId });
    } catch (error) {
      toast.error(t("editor.toast_save_failed"), { id: toastId });
    }
  };

  const handleAddProposedBlock = async (proposedBlock: {
    type: LearningBlock["type"];
    title: string;
    content: string;
    learningMode: LearningBlock["learningMode"];
  }) => {
    const toastId = toast.loading(t("editor.toast_adding"));
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
      toast.success(t("editor.toast_added"), { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(t("editor.toast_add_failed"), { id: toastId });
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-8" style={{ background: "var(--paper)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 pb-6" style={{ borderBottom: "1.5px solid var(--line)" }}>
            {isEditingModule ? (
              <div className="bg-paper p-6 rounded-2xl border border-line flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">{t("editor.module_title")}</label>
                  <input 
                    type="text" 
                    value={moduleTitle} 
                    onChange={e => setModuleTitle(e.target.value)} 
                    className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all"
                    style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 16, fontFamily: "var(--f-display)", fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">{t("editor.description")}</label>
                  <textarea 
                    value={moduleDesc} 
                    onChange={e => setModuleDesc(e.target.value)} 
                    rows={2}
                    className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all resize-none"
                    style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button className="btn ghost" onClick={() => setIsEditingModule(false)}>{t("editor.cancel")}</button>
                  <button className="btn blue" onClick={handleSaveModule}>{t("editor.save")}</button>
                </div>
              </div>
            ) : (
              <div className="group relative flex flex-col gap-3">
                <div className="absolute right-0 top-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/learner/courses/${course.id}/modules/${module.id}`} target="_blank" className="btn ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 12 }}>
                    <Eye className="w-3.5 h-3.5" /> {t("editor.preview")}
                  </Link>
                  <button className="btn ghost" onClick={() => setIsEditingModule(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 12 }}>
                    <Edit className="w-3.5 h-3.5" /> {t("editor.edit")}
                  </button>
                </div>
                
                <div>
                  <span className="eyebrow" style={{ color: "var(--blue)" }}>{t("editor.title")}</span>
                  <h2 className="display pr-48" style={{ fontSize: 28, marginTop: 4 }}>{module.title}</h2>
                </div>
                <p className="text-ink-2 text-sm max-w-xl" style={{ lineHeight: 1.5 }}>{module.description}</p>
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

