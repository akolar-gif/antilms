"use client";

import React, { useState, useEffect, useRef } from "react";
import { Maximize2, X, RefreshCw, Image as ImageIcon, Sparkles, AlertCircle, FileCode, Copy, Check, Workflow } from "lucide-react";

// Preprocesses markdown text so headings, images, and mermaid blocks are ALWAYS separated by double newlines
function normalizeMarkdownNewlines(rawText: string): string {
  if (!rawText) return "";
  return rawText
    // Insert newlines before headings if they follow text without newline
    .replace(/([^\n])\s*(#{1,3}\s+)/g, "$1\n\n$2")
    // Insert newlines before markdown images if they follow text
    .replace(/([^\n])\s*(!\[.*?\]\(.*?\))/g, "$1\n\n$2\n\n")
    // Insert newlines after markdown images if text follows immediately
    .replace(/(!\[.*?\]\(.*?\))\s*([^\n])/g, "$1\n\n$2")
    // Insert newlines before mermaid blocks if they follow text
    .replace(/([^\n])\s*(```mermaid)/g, "$1\n\n$2")
    // Clean up excessive newlines
    .replace(/\n{3,}/g, "\n\n");
}

// Standalone Smart Image Component with card layout, zoom modal, and Pollinations/Unsplash support
function SmartImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className="my-8 rounded-2xl border border-line bg-paper shadow-sm overflow-hidden group transition-all">
        {/* Card Header */}
        <div className="px-4 py-3 bg-paper-2 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-blue">
            <Sparkles className="w-4 h-4 text-blue animate-pulse" />
            <span className="uppercase tracking-wider font-mono text-[11px]">Visualisierung & Infografik</span>
          </div>
          <span className="text-[10px] font-mono text-ink-3 bg-paper px-2.5 py-0.5 rounded-full border border-line">Grafik-Block</span>
        </div>

        {/* Image Frame */}
        <div className="relative overflow-hidden bg-paper-3 min-h-[220px] flex items-center justify-center">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-3 text-xs bg-paper-2 p-6 text-center">
              <RefreshCw className="w-5 h-5 animate-spin text-blue" />
              <span>Visuelle Darstellung wird aufbereitet...</span>
            </div>
          )}

          {hasError ? (
            <div className="p-8 text-center flex flex-col items-center gap-2 text-ink-3 bg-paper-2 w-full">
              <ImageIcon className="w-8 h-8 text-ink-3/40" />
              <p className="text-xs font-medium text-ink-2">{alt || "Visualisierung zum Thema"}</p>
              <button 
                type="button"
                onClick={() => { setHasError(false); setIsLoading(true); }}
                className="text-[11px] text-blue hover:underline flex items-center gap-1 mt-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Grafik neu laden
              </button>
            </div>
          ) : (
            <img 
              src={src} 
              alt={alt || "Inhaltsgrafik"} 
              onLoad={() => setIsLoading(false)}
              onError={() => { setIsLoading(false); setHasError(true); }}
              className={`w-full max-h-[520px] object-cover transition-all duration-300 group-hover:scale-[1.01] ${isLoading ? "opacity-0" : "opacity-100"}`}
            />
          )}

          {!hasError && !isLoading && (
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="absolute top-3 right-3 p-2 bg-paper/85 backdrop-blur-md hover:bg-paper text-ink rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-line cursor-pointer"
              title="Großansicht öffnen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Caption */}
        {alt && (
          <div className="p-4 bg-paper border-t border-line text-center">
            <p className="text-xs text-ink-2 font-medium leading-relaxed">{alt}</p>
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={src} alt={alt} className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
            {alt && <p className="text-white text-sm font-medium mt-4 text-center">{alt}</p>}
          </div>
        </div>
      )}
    </>
  );
}

// Client-side Mermaid Diagram Renderer as Standalone Visual Block
function MermaidDiagram({ chart, id }: { chart: string; id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically load Mermaid.js if not present
        if (!(window as any).mermaid) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
            script.onload = () => {
              try {
                (window as any).mermaid.initialize({
                  startOnLoad: false,
                  theme: "neutral",
                  securityLevel: "loose",
                  fontFamily: "inherit",
                });
                resolve();
              } catch (e) {
                reject(e);
              }
            };
            script.onerror = () => reject(new Error("Mermaid Script konnte nicht geladen werden"));
            document.head.appendChild(script);
          });
        }

        const mermaid = (window as any).mermaid;
        const cleanChart = chart.trim();
        const uniqueId = `mermaid-svg-${id}-${Math.random().toString(36).substring(2, 7)}`;
        
        const { svg: renderedSvg } = await mermaid.render(uniqueId, cleanChart);
        
        if (isMounted) {
          setSvg(renderedSvg);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn("Mermaid render error:", err);
          setError(err?.message || "Diagramm konnte nicht gerendert werden");
          setIsLoading(false);
        }
      }
    };

    renderChart();
    return () => { isMounted = false; };
  }, [chart, id]);

  if (isLoading) {
    return (
      <div className="my-8 p-8 border border-line rounded-2xl bg-paper-2 flex flex-col items-center justify-center gap-3 text-ink-3 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-blue" />
        <span>Ablaufschema & Diagramm wird gerendert...</span>
      </div>
    );
  }

  if (error || !svg) {
    return (
      <div className="my-8 p-6 border border-line rounded-2xl bg-paper-2 text-ink-2">
        <div className="flex items-center gap-2 text-amber-600 text-xs font-bold mb-2">
          <AlertCircle className="w-4 h-4" />
          <span>Prozess-Struktur (Text-Ansicht):</span>
        </div>
        <pre className="p-3 bg-paper border border-line rounded-xl text-xs font-mono text-ink-2 overflow-x-auto whitespace-pre-wrap">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-2xl border border-line bg-paper shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-paper-2 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-green">
          <Workflow className="w-4 h-4 text-emerald-green" />
          <span className="uppercase tracking-wider font-mono text-[11px]">Prozess- & Ablauf-Diagramm</span>
        </div>
        <span className="text-[10px] font-mono text-ink-3 bg-paper px-2.5 py-0.5 rounded-full border border-line">Diagramm-Block</span>
      </div>
      <div className="p-6 bg-paper overflow-x-auto flex flex-col items-center">
        <div 
          ref={containerRef}
          className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}

// Code Block with Copy Button
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl border border-line bg-ink text-paper overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
        <span className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-blue" />
          {language || "code"}
        </span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Kopiert" : "Kopieren"}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Helper to format inline bold, italic, code
function formatInlineMarkdown(text: string) {
  if (!text) return null;
  
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-extrabold text-ink">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic text-ink">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-paper-3 text-ink-2 font-mono text-xs">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

// Main Rich Content Renderer Component
export function RichContentRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Preprocess text to ensure clean line breaks before headings, images, and code blocks
  const normalizedContent = normalizeMarkdownNewlines(content);
  const lines = normalizedContent.split("\n");
  
  const elements: React.ReactNode[] = [];
  
  let inMermaid = false;
  let mermaidBuffer: string[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  let codeLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Mermaid code block start/end
    if (line.trim().startsWith("```mermaid") || line.trim().startsWith("```diagram")) {
      inMermaid = true;
      mermaidBuffer = [];
      continue;
    }
    if (inMermaid) {
      if (line.trim() === "```") {
        inMermaid = false;
        const chartCode = mermaidBuffer.join("\n");
        elements.push(<MermaidDiagram key={`mermaid-${i}`} id={`m-${i}`} chart={chartCode} />);
        mermaidBuffer = [];
      } else {
        mermaidBuffer.push(line);
      }
      continue;
    }

    // Generic Code block start/end
    if (line.trim().startsWith("```")) {
      if (inCode) {
        inCode = false;
        elements.push(<CodeBlock key={`code-${i}`} code={codeBuffer.join("\n")} language={codeLang} />);
        codeBuffer = [];
        codeLang = "";
      } else {
        inCode = true;
        codeLang = line.trim().replace("```", "");
        codeBuffer = [];
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Standalone or extracted Markdown Images: ![alt](url)
    const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      elements.push(<SmartImage key={`img-${i}`} src={src} alt={alt} />);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-base font-extrabold mt-8 mb-4 text-ink leading-snug flex items-center gap-2 border-b pb-2 border-line-soft">
          {formatInlineMarkdown(line.replace("### ", ""))}
        </h4>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-lg font-extrabold mt-10 mb-5 text-ink leading-tight flex items-center gap-2 border-b pb-2 border-line">
          {formatInlineMarkdown(line.replace("## ", ""))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={`h1-${i}`} className="text-xl font-extrabold mt-12 mb-6 text-blue uppercase tracking-tight">
          {formatInlineMarkdown(line.replace("# ", ""))}
        </h2>
      );
      continue;
    }

    // Bullet Lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-sm text-ink-2 mb-2 leading-relaxed">
          {formatInlineMarkdown(line.substring(2))}
        </li>
      );
      continue;
    }

    // Numbered Lists
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <li key={`nli-${i}`} className="ml-5 list-decimal text-sm text-ink-2 mb-2 leading-relaxed">
          {formatInlineMarkdown(numMatch[2])}
        </li>
      );
      continue;
    }

    // Blockquotes / Callouts
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={`bq-${i}`} className="my-5 p-4 border-l-4 border-blue bg-blue/5 rounded-r-xl text-sm italic text-ink-2">
          {formatInlineMarkdown(line.replace("> ", ""))}
        </blockquote>
      );
      continue;
    }

    // Blank lines
    if (line.trim() === "") {
      elements.push(<div key={`space-${i}`} className="h-3" />);
      continue;
    }

    // Standard paragraph text
    elements.push(
      <p key={`p-${i}`} className="text-sm text-ink-2 mb-4 leading-relaxed font-sans">
        {formatInlineMarkdown(line)}
      </p>
    );
  }

  return <div className="rich-content space-y-1">{elements}</div>;
}
