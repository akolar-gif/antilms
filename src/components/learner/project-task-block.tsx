"use client";

import { useState, useEffect } from "react";
import { LearningBlock, Submission, SubmissionVersion } from "@/types";
import { Button } from "@/components/ui/button";
import { Briefcase, Send, ShieldCheck, RefreshCw, Sparkles, User, Award } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/components/layout/language-context";
import { getSubmissionAction, submitProjectTaskAction, submitRevisionAction } from "@/app/actions/progress";

export function ProjectTaskBlock({ 
  block, 
  courseId,
  moduleId,
  onComplete 
}: { 
  block: LearningBlock; 
  courseId: string;
  moduleId: string;
  onComplete?: () => void;
}) {
  const [solution, setSolution] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisedSolution, setRevisedSolution] = useState("");
  const [revisedReflection, setRevisedReflection] = useState("");
  
  const { t } = useTranslation();

  // Load existing submission if any
  useEffect(() => {
    async function loadSubmission() {
      try {
        const sub = await getSubmissionAction(block.id);
        if (sub) {
          setSubmission(sub);
          setIsSubmitted(true);
          
          // Pre-fill fields with latest version if any
          if (sub.versions && sub.versions.length > 0) {
            const latest = sub.versions[sub.versions.length - 1];
            setSolution(latest.solution);
            setReflection(latest.reflection || "");
          }
        }
      } catch (error) {
        console.error("Failed to load submission:", error);
      }
    }
    loadSubmission();
  }, [block.id]);

  let taskData = {
    title: "",
    scenario: "",
    task: "",
    deliverable: "",
    constraints: [],
    reflectionPrompt: ""
  };

  try {
    taskData = JSON.parse(block.content);
  } catch (e) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="font-heading font-semibold text-xl text-slate-800 mb-2">{block.title}</h3>
        <p className="text-slate-600 text-sm">{block.content}</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!solution.trim() || !reflection.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Abgabe wird gespeichert...");
    try {
      const result = await submitProjectTaskAction(courseId, moduleId, block.id, solution, reflection);
      if (result.success && result.submission) {
        setSubmission(result.submission);
        setIsSubmitted(true);
        toast.success(t("project.toast_success"), { id: toastId });
        if (onComplete) onComplete();
      } else {
        toast.error("Abgabe fehlgeschlagen. Bitte erneut versuchen.", { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error("Abgabe fehlgeschlagen.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevisionSubmit = async () => {
    if (!revisedSolution.trim() || !revisedReflection.trim() || isSubmitting || !submission) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Überarbeitung wird gespeichert...");
    try {
      const result = await submitRevisionAction(courseId, moduleId, submission.id, revisedSolution, revisedReflection);
      if (result.success && result.submission) {
        setSubmission(result.submission);
        setShowRevisionForm(false);
        setRevisedSolution("");
        setRevisedReflection("");
        toast.success("Überarbeitung erfolgreich eingereicht!", { id: toastId });
      } else {
        toast.error("Einreichung der Überarbeitung fehlgeschlagen.", { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error("Einreichung der Überarbeitung fehlgeschlagen.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm my-8">
      {/* Header */}
      <div className="p-4 bg-royal-blue/5 border-b border-royal-blue/10 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-royal-blue">
          <Briefcase className="w-5 h-5" />
          <span className="font-semibold text-sm uppercase tracking-wider">{t("project.badge")}</span>
        </div>
        <span className="text-xs font-medium text-royal-blue/70 bg-royal-blue/10 px-2 py-1 rounded-full">
          {t("project.subbadge")}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-heading font-bold text-slate-800 text-xl">
            {taskData.title || block.title || t("project.default_title")}
          </h3>

          {/* Mastery Status Badge */}
          {submission && block.assessmentRole === "mastery" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Mastery Status:</span>
              {submission.masteryStatus === "demonstrated" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                  <Award className="w-3.5 h-3.5" /> Demonstriert (Demonstrated)
                </span>
              ) : submission.masteryStatus === "developing" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                  <RefreshCw className="w-3.5 h-3.5" /> In Entwicklung (Developing)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                  Ausstehend (Not Assessed)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Scenario & Task */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t("project.scenario")}</h4>
            <p className="text-slate-700 text-sm leading-relaxed">{taskData.scenario}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t("project.objective")}</h4>
            <p className="text-slate-800 font-medium text-sm leading-relaxed">{taskData.task}</p>
          </div>
        </div>

        {/* Deliverable & Constraints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("project.deliverable")}</h4>
            <p className="text-slate-700 text-sm font-semibold">{taskData.deliverable}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("project.constraints")}</h4>
            <ul className="space-y-1">
              {(taskData.constraints || []).map((constraint: string, idx: number) => (
                <li key={idx} className="flex items-start text-xs text-slate-600">
                  <span className="text-royal-blue mr-1.5">•</span>
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form */}
        {!isSubmitted ? (
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t("project.solution_label")}
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder={t("project.solution_placeholder")}
                rows={4}
                disabled={isSubmitting}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm focus:border-royal-blue focus:ring-1 focus:ring-royal-blue bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t("project.reflection_label", { prompt: taskData.reflectionPrompt })}
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder={t("project.reflection_placeholder")}
                rows={3}
                disabled={isSubmitting}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm focus:border-royal-blue focus:ring-1 focus:ring-royal-blue bg-white text-slate-800"
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={!solution.trim() || !reflection.trim() || isSubmitting}
                className="bg-royal-blue hover:bg-royal-blue/90 text-white font-semibold shadow-sm"
              >
                <Send className="w-4 h-4 mr-2" /> {t("project.submit_btn")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-4 border-t border-slate-100">
            {/* Version History / Submissions List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verlauf der Einreichungen ({submission?.versions?.length || 0}):</h4>
              
              {submission?.versions?.map((ver: SubmissionVersion, idx: number) => {
                const isLatest = idx === (submission.versions.length - 1);
                return (
                  <div key={idx} className={`p-4 rounded-xl border transition-all ${isLatest ? 'bg-royal-blue/5 border-royal-blue/10' : 'bg-slate-50/50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${isLatest ? 'bg-royal-blue/10 text-royal-blue font-bold' : 'bg-slate-200 text-slate-600'}`}>
                        Version {idx + 1} {isLatest && "(Aktuell)"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ver.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <strong className="block text-slate-600 text-[10px] uppercase tracking-wider mb-1">Eingereichter Entwurf:</strong>
                        <p className="font-mono text-slate-800 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200 text-[13px]">{ver.solution}</p>
                      </div>
                      
                      {ver.reflection && (
                        <div>
                          <strong className="block text-slate-600 text-[10px] uppercase tracking-wider mb-1">Reflexion:</strong>
                          <p className="text-slate-800 italic bg-white p-3 rounded-lg border border-slate-200 text-[13px]">"{ver.reflection}"</p>
                        </div>
                      )}

                      {/* Feedback List for this version */}
                      {ver.feedback && ver.feedback.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-slate-200/60 pt-3">
                          {ver.feedback.map((f, fIdx) => (
                            <div key={f.id || fIdx} className="bg-white p-4 rounded-lg border border-slate-200 space-y-1 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-royal-blue mb-1">
                                {f.source === "ai" ? (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Anka AI Coach Feedback</span>
                                  </>
                                ) : f.source === "peer" ? (
                                  <>
                                    <User className="w-3.5 h-3.5 text-coral" />
                                    <span>Peer Feedback ({f.evaluatorId || "Mitschüler"})</span>
                                  </>
                                ) : f.source === "trainer" ? (
                                  <>
                                    <Award className="w-3.5 h-3.5 text-emerald-green" />
                                    <span>Trainer Feedback</span>
                                  </>
                                ) : (
                                  <span>Selbstbewertung</span>
                                )}
                                <span className="text-[9px] text-slate-400 font-normal ml-auto">
                                  {new Date(f.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans prose prose-sm max-w-none">
                                {f.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AI evaluation loading state */}
                      {isLatest && (!ver.feedback || ver.feedback.length === 0) && block.metadata?.allowAiCoach !== false && (
                        <div className="bg-white border border-slate-200 p-4 rounded-lg text-center flex items-center justify-center space-x-2 text-slate-500 text-xs shadow-xs">
                          <RefreshCw className="w-4 h-4 animate-spin text-royal-blue" />
                          <span>Anka AI analysiert deinen Entwurf und generiert Feedback...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Revision control button */}
            {isSubmitted && !showRevisionForm && block.metadata?.allowRevision !== false && (
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={() => setShowRevisionForm(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Neue Überarbeitung einreichen (Revision)
                </Button>
              </div>
            )}

            {/* Revision form input */}
            {showRevisionForm && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="font-heading font-bold text-amber-700 text-sm flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4" /> Neue Revision erarbeiten:
                </h4>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Überarbeitete Lösung:
                  </label>
                  <textarea
                    value={revisedSolution}
                    onChange={(e) => setRevisedSolution(e.target.value)}
                    placeholder="Überarbeite deinen Lösungsansatz basierend auf dem Feedback..."
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Was hast du konkret angepasst und gelernt?
                  </label>
                  <textarea
                    value={revisedReflection}
                    onChange={(e) => setRevisedReflection(e.target.value)}
                    placeholder="Beschreibe kurz die vorgenommenen Änderungen..."
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    onClick={() => setShowRevisionForm(false)} 
                    disabled={isSubmitting}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Abbrechen
                  </Button>
                  <Button 
                    onClick={handleRevisionSubmit} 
                    disabled={!revisedSolution.trim() || !revisedReflection.trim() || isSubmitting}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm"
                  >
                    <Send className="w-4 h-4 mr-2" /> Revision absenden
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
