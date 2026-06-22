import { cookies } from "next/headers";
import { translations } from "@/components/layout/translations";
import { testAiConnectionAction } from "@/app/actions/ai";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "de") as "de" | "en";
  const dict = translations[lang] || translations.de;
  const t = (key: keyof typeof translations.de, params?: Record<string, string>) => {
    let text = dict[key] || translations.de[key] || String(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  const aiStatus = await testAiConnectionAction();

  return (
    <div className="screen">
      {/* TopBar Header */}
      <header className="topbar">
        <div className="tb-left">
          <div>
            <div className="eyebrow">{t("admin.eyebrow")}</div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
              {t("admin.title")}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Lattice Grid */}
      <div className="lattice" style={{ gridTemplateColumns: "1fr" }}>
        <div className="cell">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {t("admin.telemetry")}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 72px)" }}>{t("admin.title")}</h1>
          <p className="lede" style={{ maxWidth: 560, marginTop: 18 }}>
            {t("admin.desc")}
          </p>
        </div>
      </div>

      {/* KI-Systemdiagnose (Gemini API) */}
      <div className="lattice" style={{ gridTemplateColumns: "1fr" }}>
        <div className="cell" style={{ background: "var(--paper-2)", borderLeft: "4px solid " + (aiStatus.working ? "var(--emerald)" : aiStatus.configured ? "var(--coral)" : "var(--amber)") }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="eyebrow" style={{ color: aiStatus.working ? "var(--emerald-d)" : aiStatus.configured ? "var(--coral-d)" : "var(--ink-3)" }}>
                KI-Systemdiagnose (Gemini API)
              </span>
              <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 20, marginTop: 6, textTransform: "uppercase" }}>
                {aiStatus.working 
                  ? "Verbindung erfolgreich & gesichert" 
                  : aiStatus.configured 
                    ? "Fehler bei der Verbindung" 
                    : "Kein API-Key konfiguriert"}
              </h2>
              <p className="text-xs text-ink-2 mt-1.5" style={{ lineHeight: 1.4 }}>
                {aiStatus.working 
                  ? `Der API-Schlüssel ist aktiv. Diagnosetest erfolgreich. Schlüssel-Vorschau: ${aiStatus.preview}`
                  : aiStatus.configured 
                    ? `API-Schlüssel konfiguriert (${aiStatus.preview}), aber Test fehlgeschlagen: ${aiStatus.errorMessage}`
                    : "Bitte füge GOOGLE_GENERATIVE_AI_API_KEY zu deiner .env-Datei hinzu, um KI-Funktionen zu aktivieren."}
              </p>
            </div>
            
            <div className="flex items-center gap-2 md:self-center">
              <span className={`w-2.5 h-2.5 rounded-full ${aiStatus.working ? "bg-emerald" : aiStatus.configured ? "bg-coral" : "bg-amber"}`} style={{ display: "inline-block" }} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-2">
                {aiStatus.working ? "Online" : aiStatus.configured ? "Fehlgeschlagen" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="lattice" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {/* Uncertainty Clusters */}
        <div className="cell flex flex-col gap-6" style={{ minHeight: 320 }}>
          <span className="corner-no">№ 01</span>
          <div>
            <span className="eyebrow" style={{ color: "var(--coral-d)" }}>DIFFICULT CONCEPTS</span>
            <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }}>{t("admin.uncertainty_clusters")}</h3>
          </div>
          <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
            {t("admin.uncertainty_desc")}
          </p>
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex justify-between items-center p-3 rounded-xl border border-line" style={{ background: "var(--paper-2)" }}>
              <span className="font-bold text-ink">"Root Cause Analysis"</span>
              <span className="text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 bg-coral/20 text-coral-d rounded border border-coral/30">
                {lang === "de" ? "Hohe Reibung" : "High Friction"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl border border-line" style={{ background: "var(--paper-2)" }}>
              <span className="font-bold text-ink">{lang === "de" ? "\"Agile Schätzungen\"" : "\"Agile Estimations\""}</span>
              <span className="text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 bg-blue/20 text-blue-d rounded border border-blue/30">
                {lang === "de" ? "Moderat" : "Moderate"}
              </span>
            </div>
          </div>
        </div>

        {/* Reflection Depth */}
        <div className="cell flex flex-col gap-6" style={{ minHeight: 320 }}>
          <span className="corner-no">№ 02</span>
          <div>
            <span className="eyebrow" style={{ color: "var(--blue-d)" }}>COHORT ANALYSIS</span>
            <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }}>{t("admin.reflection_depth")}</h3>
          </div>
          <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
            {t("admin.reflection_desc")}
          </p>
          
          <div className="mt-auto h-28 flex items-end justify-between gap-2.5 p-4 border border-line rounded-2xl animate-reveal" style={{ background: "var(--paper-2)" }}>
            <div className="flex-1 rounded-t bg-coral h-1/3 transition-all"></div>
            <div className="flex-1 rounded-t bg-coral h-2/3 transition-all" style={{ opacity: 0.65 }}></div>
            <div className="flex-1 rounded-t bg-coral h-full transition-all" style={{ opacity: 0.85 }}></div>
            <div className="flex-1 rounded-t bg-coral h-[85%] transition-all"></div>
          </div>
        </div>

        {/* Competence Signals */}
        <div className="cell flex flex-col gap-6" style={{ minHeight: 320 }}>
          <span className="corner-no">№ 03</span>
          <div>
            <span className="eyebrow" style={{ color: "var(--ink-3)" }}>FUTURE SKILLS</span>
            <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }}>{t("admin.competence_signals")}</h3>
          </div>
          <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
            {t("admin.competence_desc")}
          </p>
          
          <div className="flex flex-col gap-4 mt-auto">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-ink-3">
                <span>{lang === "de" ? "Kritisches Denken" : "Critical Thinking"}</span>
                <span>{t("admin.active", { percentage: "78" })}</span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                <div className="bg-ink h-full rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-ink-3">
                <span>{lang === "de" ? "Komplexe Problemlösung" : "Complex Problem Solving"}</span>
                <span>{t("admin.active", { percentage: "45" })}</span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                <div className="bg-ink h-full rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

