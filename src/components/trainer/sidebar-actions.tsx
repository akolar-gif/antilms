"use client";

import { useState } from "react";
import { addModuleAction, generateModuleAction } from "@/app/actions/course";
import { Sparkles, Plus, X, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/components/layout/language-context";

export function SidebarModuleActions({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const { t } = useTranslation();

  const handleAddManual = async () => {
    const toastId = toast.loading(t("module_actions.toast_adding"));
    try {
      await addModuleAction(courseId);
      toast.success(t("module_actions.toast_added"), { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(t("module_actions.toast_add_failed"), { id: toastId });
    }
  };

  const handleGenerateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !description) {
      toast.error(t("module_actions.toast_required"));
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(t("module_actions.toast_generating"));

    try {
      const result = await generateModuleAction(courseId, topic, description);
      toast.success(t("module_actions.toast_gen_success"), { id: toastId });
      setIsOpen(false);
      setTopic("");
      setDescription("");
      router.push(`/trainer/courses/${courseId}/modules/${result.moduleId}`);
    } catch (error) {
      console.error(error);
      toast.error(t("module_actions.toast_gen_failed"), { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-4 pt-4" style={{ borderTop: "1.5px solid var(--line)" }}>
      <button 
        onClick={handleAddManual}
        className="btn ghost w-full"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", fontSize: "12px", fontFamily: "var(--f-mono)", textTransform: "uppercase" }}
      >
        <Plus className="w-3.5 h-3.5" />
        {t("module_actions.empty_module")}
      </button>

      <button 
        onClick={() => setIsOpen(true)}
        className="btn blue w-full"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", fontSize: "12px", fontFamily: "var(--f-mono)", textTransform: "uppercase" }}
      >
        <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
        {t("module_actions.ai_module")}
      </button>

      {/* Generation Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-paper border border-line p-8 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col gap-6"
            >
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                disabled={isLoading}
                className="absolute top-6 right-6 text-ink-3 hover:text-ink transition-colors"
                style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="eyebrow" style={{ color: "var(--blue)" }}>{t("module_actions.designer_title")}</span>
                <h3 className="display" style={{ fontSize: 24, marginTop: 4 }}>{t("module_actions.generate_module")}</h3>
              </div>

              <form onSubmit={handleGenerateModule} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="modal-topic" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">
                    {t("module_actions.topic_label")}
                  </label>
                  <input
                    type="text"
                    id="modal-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder={t("module_actions.topic_placeholder")}
                    className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all"
                    style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
                  />
                </div>

                <div>
                  <label htmlFor="modal-desc" className="block text-xs font-mono uppercase tracking-wider text-ink-3 mb-1.5">
                    {t("module_actions.focus_label")}
                  </label>
                  <textarea
                    id="modal-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isLoading}
                    rows={3}
                    placeholder={t("module_actions.focus_placeholder")}
                    className="w-full p-3 border border-line rounded-xl outline-none focus:border-blue transition-all resize-none"
                    style={{ background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)} 
                    disabled={isLoading}
                    className="btn ghost"
                  >
                    {t("module_actions.cancel")}
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="btn blue"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <Wand2 className="w-4 h-4" />
                    {isLoading ? t("module_actions.generating") : t("module_actions.generate")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

