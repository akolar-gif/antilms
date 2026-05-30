"use client";

import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "@/components/layout/language-context";

export { I, Mark, AIglyph, AIChip } from "./static-icons";

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
