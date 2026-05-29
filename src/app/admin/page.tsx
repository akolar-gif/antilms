export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div className="screen">
      {/* TopBar Header */}
      <header className="topbar">
        <div className="tb-left">
          <div>
            <div className="eyebrow">ADMIN PORTAL</div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
              Development Signals
            </div>
          </div>
        </div>
      </header>

      {/* Hero Lattice Grid */}
      <div className="lattice" style={{ gridTemplateColumns: "1fr" }}>
        <div className="cell">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            SYSTEM TELEMETRY
          </div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 72px)" }}>Development Signals</h1>
          <p className="lede" style={{ maxWidth: 560, marginTop: 18 }}>
            Verstehe, wo Lernende auf Hindernisse stoßen, sich weiterentwickeln und zusammenarbeiten. Echtzeit-Friction-Daten und Kompetenz-Signale.
          </p>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="lattice" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {/* Uncertainty Clusters */}
        <div className="cell flex flex-col gap-6" style={{ minHeight: 320 }}>
          <span className="corner-no">№ 01</span>
          <div>
            <span className="eyebrow" style={{ color: "var(--coral-d)" }}>DIFFICULT CONCEPTS</span>
            <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }}>Uncertainty Clusters</h3>
          </div>
          <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
            Themenbereiche, die die meisten Rückfragen an den AI-Mentor auslösen und Lernschwierigkeiten aufzeigen:
          </p>
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex justify-between items-center p-3 rounded-xl border border-line" style={{ background: "var(--paper-2)" }}>
              <span className="font-bold text-ink">"Root Cause Analysis"</span>
              <span className="text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 bg-coral/20 text-coral-d rounded border border-coral/30">High Friction</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl border border-line" style={{ background: "var(--paper-2)" }}>
              <span className="font-bold text-ink">"Agile Schätzungen"</span>
              <span className="text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 bg-blue/20 text-blue-d rounded border border-blue/30">Moderate</span>
            </div>
          </div>
        </div>

        {/* Reflection Depth */}
        <div className="cell flex flex-col gap-6" style={{ minHeight: 320 }}>
          <span className="corner-no">№ 02</span>
          <div>
            <span className="eyebrow" style={{ color: "var(--blue-d)" }}>COHORT ANALYSIS</span>
            <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }}>Reflection Depth</h3>
          </div>
          <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
            Durchschnittliche Tiefe und Differenzierung der verfassten Selbstreflexionen im Kursverlauf:
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
            <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }}>Competence Signals</h3>
          </div>
          <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
            Entwicklung von Zukunftsfähigkeiten basierend auf Projekt-Abgaben und reflektiven Texten:
          </p>
          
          <div className="flex flex-col gap-4 mt-auto">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-ink-3">
                <span>Critical Thinking</span>
                <span>78% active</span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                <div className="bg-ink h-full rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-ink-3">
                <span>Complex Problem Solving</span>
                <span>45% active</span>
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

