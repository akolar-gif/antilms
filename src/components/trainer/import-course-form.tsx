"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importCourseAction } from "@/app/actions/course";
import { X, Upload, FileJson, AlertCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export function ImportCourseForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setParsedData(null);
    setErrorMsg(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setParsedData(null);
    setErrorMsg(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndParse = (text: string) => {
    try {
      const data = JSON.parse(text);
      if (!data.title || !data.description) {
        setErrorMsg("Die JSON-Datei muss mindestens die Felder 'title' (Titel) und 'description' (Beschreibung) enthalten.");
        setParsedData(null);
        return;
      }
      setErrorMsg(null);
      setParsedData(data);
    } catch (err) {
      setErrorMsg("Die Datei ist keine gültige JSON-Datei.");
      setParsedData(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        setErrorMsg("Bitte lade eine Datei im .json-Format hoch.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          validateAndParse(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          validateAndParse(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;
    setIsLoading(true);
    const toastId = toast.loading("Importiere Lernpfad...");

    try {
      const res = await importCourseAction(parsedData);
      if (res.success && res.courseId) {
        toast.success("Kurs erfolgreich importiert!", { id: toastId });
        handleClose();
        router.push(`/trainer/courses/${res.courseId}`);
      } else {
        toast.error(res.error || "Fehler beim Importieren.", { id: toastId });
      }
    } catch (err) {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExampleJson = () => {
    const example = {
      title: "Erfolgreich Verhandeln (Beispiel)",
      description: "Lerne die Grundlagen effektiver Verhandlungstechniken im Berufsalltag.",
      category: "Verhandlung",
      type: "comprehensive",
      price: 29.90,
      modules: [
        {
          title: "1. Grundlagen und Vorbereitung",
          blocks: [
            {
              type: "text",
              title: "Einführung in die Verhandlungstheorie",
              content: "Verhandeln ist eine Schlüsselqualifikation...",
              settings: {}
            },
            {
              type: "quiz",
              title: "Schneller Wissens-Check",
              content: "",
              settings: {
                question: "Was ist das primäre Ziel des Harvard-Konzepts?",
                options: [
                  "Den Verhandlungspartner zu übervorteilen",
                  "Eine Win-Win-Lösung zu erzielen",
                  "Den Preis um jeden Preis zu drücken"
                ],
                correctAnswer: 1
              }
            }
          ]
        },
        {
          title: "2. Praktisches Rollenspiel",
          blocks: [
            {
              type: "reflection",
              title: "Deine bisherigen Verhandlungserfahrungen",
              content: "Beschreibe eine Situation, in der du eine Verhandlung als schwierig empfunden hast.",
              settings: {}
            },
            {
              type: "ai_chat",
              title: "KI-Rollenspiel: Gehaltsverhandlung",
              content: "Simuliere eine Gehaltsverhandlung mit deinem zögerlichen Chef.",
              settings: {
                systemPrompt: "Du bist der Vorgesetzte des Nutzers. Du hast wenig Budget und suchst nach Ausreden. Sei freundlich aber beharrlich."
              }
            }
          ]
        }
      ]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(example, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "innoversity-course-template.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <>
      <button 
        onClick={handleOpen} 
        className="btn outline" 
        style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: 8,
          borderColor: "var(--line)",
          background: "var(--paper-2)",
          color: "var(--ink)",
        }}
      >
        <Upload className="w-4 h-4" /> Kurs importieren
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-paper border border-line w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
            style={{ background: "var(--paper)" }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-line flex justify-between items-center">
              <div>
                <h3 className="font-heading font-bold text-lg text-ink">Kurs aus JSON importieren</h3>
                <p className="text-xs text-ink-3 mt-1">Lade eine strukturierte JSON-Datei hoch, um einen kompletten Kurs anzulegen.</p>
              </div>
              <button onClick={handleClose} className="p-1.5 hover:bg-paper-2 rounded-lg text-ink-3 hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Instructions and Download Template */}
              <div className="bg-paper-2 border border-line-soft rounded-xl p-4 flex gap-3 items-start">
                <HelpCircle className="w-5 h-5 text-blue shrink-0 mt-0.5" />
                <div className="text-xs space-y-2">
                  <p className="text-ink leading-relaxed">
                    Die JSON-Datei beschreibt den Kurs samt Modulen und Lerneinheiten (z.B. Text, Quiz, Reflexion oder KI-Chats).
                  </p>
                  <button 
                    onClick={downloadExampleJson}
                    className="text-blue hover:underline font-semibold font-mono inline-block text-[11px] uppercase tracking-wider"
                  >
                    📥 Beispiel-Vorlage (.json) herunterladen
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              {!parsedData && (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative min-h-[160px] ${
                    dragActive ? "border-blue bg-blue/5" : "border-line hover:border-blue/50 hover:bg-paper-2"
                  }`}
                >
                  <input 
                    type="file" 
                    id="import-file-input" 
                    accept=".json"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileJson className="w-10 h-10 text-ink-3 mb-3" />
                  <span className="text-sm font-medium text-ink">
                    JSON-Datei hierher ziehen oder <span className="text-blue underline">durchsuchen</span>
                  </span>
                  <span className="text-[11px] text-ink-3 mt-1.5 font-mono">Dateiendung: .json</span>
                </div>
              )}

              {/* Error Box */}
              {errorMsg && (
                <div className="bg-coral/5 border border-coral/20 rounded-xl p-4 flex gap-3 items-start text-coral text-xs leading-relaxed animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Fehler beim Einlesen:</span>
                    <p className="mt-1 text-ink-2">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Parsed Preview */}
              {parsedData && (
                <div className="border border-line rounded-xl p-5 space-y-4 bg-paper-2 animate-fade-in">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-400/20 text-blue uppercase">
                      Vorschau
                    </span>
                    <button 
                      onClick={() => setParsedData(null)}
                      className="text-xs font-mono text-ink-3 hover:text-coral underline cursor-pointer"
                    >
                      Andere Datei wählen
                    </button>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-ink leading-tight">{parsedData.title}</h4>
                    <p className="text-xs text-ink-2 mt-1 line-clamp-2">{parsedData.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-line-soft pt-4 text-center">
                    <div className="bg-paper border border-line-soft p-2.5 rounded-lg">
                      <div className="text-[10px] font-mono text-ink-3 uppercase">Kategorie</div>
                      <div className="text-xs font-semibold text-ink mt-1 truncate">{parsedData.category || "General"}</div>
                    </div>
                    <div className="bg-paper border border-line-soft p-2.5 rounded-lg">
                      <div className="text-[10px] font-mono text-ink-3 uppercase">Module</div>
                      <div className="text-xs font-semibold text-ink mt-1">{(parsedData.modules || []).length}</div>
                    </div>
                    <div className="bg-paper border border-line-soft p-2.5 rounded-lg">
                      <div className="text-[10px] font-mono text-ink-3 uppercase">Preis</div>
                      <div className="text-xs font-semibold text-ink mt-1">
                        {parsedData.price !== undefined ? `${Number(parsedData.price).toFixed(2).replace(".", ",")} €` : "Standard (49 €)"}
                      </div>
                    </div>
                  </div>

                  {parsedData.modules && parsedData.modules.length > 0 && (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      <div className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">Modulstruktur:</div>
                      {parsedData.modules.map((m: any, idx: number) => (
                        <div key={idx} className="bg-paper border border-line-soft px-3 py-2 rounded-lg text-xs flex justify-between items-center">
                          <span className="font-medium text-ink truncate">{m.title || `Modul ${idx + 1}`}</span>
                          <span className="text-[10px] font-mono text-ink-3 shrink-0 bg-paper-3 px-1.5 py-0.5 rounded">
                            {(m.blocks || []).length} Lerneinheiten
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-line flex justify-end gap-3 bg-paper-2">
              <button 
                onClick={handleClose} 
                className="btn outline"
                style={{ borderColor: "var(--line)", color: "var(--ink)", background: "var(--paper)" }}
                disabled={isLoading}
              >
                Abbrechen
              </button>
              <button 
                onClick={handleImport} 
                className="btn blue"
                disabled={isLoading || !parsedData}
              >
                {isLoading ? "Importiere..." : "Import starten"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
