"use client";

import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "@/components/layout/language-context";

// Atelier UI shared geometric icon sets
export const I = {
  home: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11 12 4l9 7"/><path d="M5 10v9h14v-9"/></svg>),
  create: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 4v16M4 12h16"/></svg>),
  library: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></svg>),
  practice: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3 4 7v6c0 4 3.5 6.5 8 8 4.5-1.5 8-4 8-8V7l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>),
  arrow: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  back: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>),
  check: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m5 12 5 5 9-10"/></svg>),
  search: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>),
  send: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12 20 4l-6 16-3-7-7-1Z"/></svg>),
};

export function Mark({ size = 44, color = "var(--ink)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-label="Atelier">
      <rect x="9"  y="10" width="3" height="24" fill={color}/>
      <rect x="16" y="6"  width="3" height="32" fill={color}/>
      <rect x="23" y="14" width="3" height="16" fill={color}/>
      <rect x="30" y="6"  width="3" height="32" fill={color}/>
      <circle cx="24.5" cy="35" r="2" fill={color}/>
    </svg>
  );
}

export function AIglyph({ size = 22, color = "currentColor", style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>
      <path d="M12 9a3 3 0 0 0 3 3 3 3 0 0 0-3 3 3 3 0 0 0-3-3 3 3 0 0 0 3-3Z" fill={color} stroke="none"/>
    </svg>
  );
}

export function AIChip({ label = "AI" }: { label?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" }}>
      <AIglyph size={13}/> {label}
    </span>
  );
}

export function TopBar({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <header className="topbar">
      <div className="tb-left">
        <div>
          <div className="eyebrow">{sub}</div>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>{title}</div>
        </div>
      </div>
      <div className="tb-right">
        <label className="search">
          <Search style={{ width: 18, height: 18 }} className="text-ink-3" />
          <input placeholder={t("topbar.search")} />
        </label>
        {right}
      </div>
    </header>
  );
}
