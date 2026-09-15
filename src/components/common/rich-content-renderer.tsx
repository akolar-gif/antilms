"use client";

import React, { useState, useEffect, useRef } from "react";
import { Maximize2, X, RefreshCw, AlertCircle, FileCode, Copy, Check, Workflow } from "lucide-react";

// Helper string hash
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Strip emojis from heading strings for a clean, elegant typography look
function stripEmojis(str: string): string {
  if (!str) return "";
  return str
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

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

// Topic-matched Unsplash Photo Library with distinct, highly targeted categories (zero duplicate gamer photos)
const TOPIC_IMAGE_LIBRARY: { keywords: string[]; urls: string[] }[] = [
  {
    keywords: ["tastatur", "steuerung", "taste", "eingabe", "maus", "key", "keyboard", "wasd", "leertaste", "shift"],
    urls: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&auto=format&fit=crop&q=80"
    ]
  },
  {
    keywords: ["holz", "wood", "ressource", "crafting", "werkzeug", "material", "werkbank", "sammeln", "rohstoff", "ofen", "stein"],
    urls: [
      "https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508873696983-2df515122519?w=1200&auto=format&fit=crop&q=80"
    ]
  },
  {
    keywords: ["nacht", "überleben", "zombie", "gegner", "gefahr", "licht", "fackel", "dunkelheit", "night", "survival", "monster", "schlaf", "unterschlupf", "feind"],
    urls: [
      "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80"
    ]
  },
  {
    keywords: ["befehl", "cheat", "command", "selektor", "gamemode", "give", "teleport"],
    urls: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80"
    ]
  },
  {
    keywords: ["bauen", "bauwerk", "basis", "haus", "struktur", "not-unterschlupf", "architektur", "konstruktion"],
    urls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80"
    ]
  },
  {
    keywords: ["minecraft", "spieler", "landscape", "landschaft", "biome", "welt", "world", "game", "gaming", "block", "avatar", "spielfigur"],
    urls: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80"
    ]
  },
  {
    keywords: ["agil", "scrum", "kanban", "team", "zusammenarbeit", "meeting", "workflow", "prozess", "management", "organisation", "strategie", "planung"],
    urls: [
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
    ]
  }
];

function getTopicMatchedImageUrl(altText: string, srcUrl?: string, index: number = 0): string {
  const text = (altText + " " + (srcUrl || "")).toLowerCase();
  
  for (const group of TOPIC_IMAGE_LIBRARY) {
    if (group.keywords.some(kw => text.includes(kw))) {
      // Use composite offset incorporating text hash and block index to guarantee unique photo selection
      const hash = Math.abs(hashString(text)) + (index * 7);
      return group.urls[hash % group.urls.length];
    }
  }

  const fallbackUrls = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80"
  ];
  return fallbackUrls[index % fallbackUrls.length];
}

// High-definition Editorial Image Component
function SmartImage({ src, alt, index = 0 }: { src: string; alt: string; index?: number }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    // Route Pollinations AI / AI placeholders directly to our Gemini PRO API image generator
    if (src.includes("image.pollinations.ai") || src.startsWith("gemini://") || !src.startsWith("http")) {
      const rawPrompt = alt || src.split("/prompt/")[1] || "Minecraft learning module illustration";
      const cleanPrompt = rawPrompt.replace(/[\?&].*/, "").replace(/[^a-zA-Z0-9 äöüÄÖÜß\-_]/g, " ").trim();
      setCurrentSrc(`/api/generate-image?prompt=${encodeURIComponent(cleanPrompt)}`);
    } else {
      setCurrentSrc(src);
    }
  }, [src, alt, index]);

  const handleImageError = () => {
    setIsLoading(false);
    if (!hasError) {
      setHasError(true);
      // Fallback dynamically to a unique topic photo matching the exact image caption/keywords
      const matchedPhotoUrl = getTopicMatchedImageUrl(alt, src, index);
      setCurrentSrc(matchedPhotoUrl);
    }
  };

  return (
    <>
      <figure className="my-8 group relative flex flex-col items-center">
        <div className="relative w-full overflow-hidden rounded-2xl border border-line/80 bg-paper-2 shadow-xs transition-all duration-300">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-3 text-xs bg-paper-2 p-8 text-center min-h-[220px]">
              <RefreshCw className="w-5 h-5 animate-spin text-blue" />
              <span>Hochauflösende Visualisierung wird geladen...</span>
            </div>
          )}

          <img 
            src={currentSrc} 
            alt={alt || "Illustration zum Thema"} 
            onLoad={() => setIsLoading(false)}
            onError={handleImageError}
            className={`w-full max-h-[500px] object-cover rounded-2xl transition-all duration-300 group-hover:scale-[1.008] ${isLoading ? "opacity-0" : "opacity-100"}`}
          />

          {!isLoading && (
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

        {alt && (
          <figcaption className="mt-3 text-center text-xs text-ink-3 italic font-sans max-w-2xl leading-relaxed">
            {alt}
          </figcaption>
        )}
      </figure>

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
            <img src={currentSrc} alt={alt} className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
            {alt && <p className="text-white text-sm font-medium mt-4 text-center">{alt}</p>}
          </div>
        </div>
      )}
    </>
  );
}

// Cleans up raw AI Mermaid diagram string so it parses properly in Mermaid.js
function sanitizeMermaidCode(rawChart: string): string {
  if (!rawChart) return "graph TD\n  A[\"Prozess\"]";
  
  let lines = rawChart.trim().split("\n");
  
  // Ensure diagram starts with graph TD/LR or flowchart
  const firstLine = lines[0]?.trim() || "";
  if (!firstLine.startsWith("graph") && !firstLine.startsWith("flowchart") && !firstLine.startsWith("sequenceDiagram") && !firstLine.startsWith("classDiagram") && !firstLine.startsWith("gantt")) {
    lines.unshift("graph TD");
  }

  // Auto-fix node labels containing unquoted special characters
  const processedLines = lines.map(line => {
    let l = line.trim();
    if (!l || l.startsWith("graph") || l.startsWith("flowchart") || l.startsWith("subgraph") || l.startsWith("end") || l.startsWith("style") || l.startsWith("classDef")) {
      return l;
    }
    
    // Convert unquoted bracket labels e.g. A[1. /gamemode <Modus>] -> A["1. /gamemode <Modus>"]
    l = l.replace(/([A-Za-z0-9_]+)\[([^"\]]+)\]/g, (match, id, text) => {
      const cleanText = text.replace(/<[^>]*>/g, "").replace(/"/g, "'").trim();
      return `${id}["${cleanText}"]`;
    });

    l = l.replace(/([A-Za-z0-9_]+)\(([^"\)]+)\)/g, (match, id, text) => {
      const cleanText = text.replace(/<[^>]*>/g, "").replace(/"/g, "'").trim();
      return `${id}("${cleanText}")`;
    });

    return l;
  });

  return processedLines.join("\n");
}

// Clean visual step flowchart fallback if Mermaid syntax fails
function ProcessListFallback({ chart }: { chart: string }) {
  const stepMatches: string[] = [];
  const regex = /(?:\[|\()(?:"|')?([^"\]\)\n\r]+)(?:"|')?(?:\]|\))/g;
  let match;
  while ((match = regex.exec(chart)) !== null) {
    const text = match[1].trim();
    if (text && !stepMatches.includes(text) && text.length > 1) {
      stepMatches.push(text);
    }
  }

  if (stepMatches.length === 0) {
    return (
      <div className="my-6 p-4 rounded-xl border border-line bg-paper-2 font-mono text-xs text-ink-2 overflow-x-auto">
        <pre>{chart}</pre>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-2xl border border-line/80 bg-paper shadow-xs overflow-hidden">
      <div className="px-4 py-2.5 bg-paper-2 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-ink-2">
          <Workflow className="w-3.5 h-3.5 text-blue" />
          <span className="uppercase tracking-wider font-mono text-[10px]">Prozess- & Ablauf-Schritte</span>
        </div>
      </div>
      <div className="p-6 bg-paper flex flex-col md:flex-row flex-wrap items-center justify-center gap-3">
        {stepMatches.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="px-4 py-3 bg-paper-2 border border-line rounded-xl text-xs font-semibold text-ink shadow-xs text-center max-w-xs">
              <span className="text-blue font-mono font-bold mr-2">{idx + 1}.</span>
              {step}
            </div>
            {idx < stepMatches.length - 1 && (
              <div className="text-blue font-bold text-lg rotate-90 md:rotate-0">→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Client-side Mermaid Diagram Renderer
function MermaidDiagram({ chart, id }: { chart: string; id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const cleanChart = sanitizeMermaidCode(chart);

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      try {
        setIsLoading(true);
        setError(false);

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
                  suppressError: true,
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
        const uniqueId = `mermaid-svg-${id}-${Math.random().toString(36).substring(2, 7)}`;
        
        // Validate syntax with parse first
        if (typeof mermaid.parse === "function") {
          const isValid = await mermaid.parse(cleanChart);
          if (!isValid) {
            throw new Error("Mermaid syntax invalid");
          }
        }

        const { svg: renderedSvg } = await mermaid.render(uniqueId, cleanChart);
        
        if (isMounted) {
          setSvg(renderedSvg);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn("Mermaid render fallback triggered:", err);
          // Remove any orphaned error elements injected by Mermaid into document.body
          if (typeof document !== "undefined") {
            document.querySelectorAll("[id^='dmermaid'], .mermaid-error").forEach(el => {
              if (el.parentNode === document.body) el.remove();
            });
          }
          setError(true);
          setIsLoading(false);
        }
      }
    };

    renderChart();
    return () => { isMounted = false; };
  }, [cleanChart, id]);

  if (isLoading) {
    return (
      <div className="my-8 p-8 border border-line rounded-2xl bg-paper-2 flex flex-col items-center justify-center gap-3 text-ink-3 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-blue" />
        <span>Prozess-Diagramm wird aufbereitet...</span>
      </div>
    );
  }

  if (error || !svg) {
    return <ProcessListFallback chart={cleanChart} />;
  }

  return (
    <div className="my-8 rounded-2xl border border-line/80 bg-paper shadow-xs overflow-hidden">
      <div className="px-4 py-2.5 bg-paper-2 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-ink-2">
          <Workflow className="w-3.5 h-3.5 text-blue" />
          <span className="uppercase tracking-wider font-mono text-[10px]">Prozess- & Ablauf-Diagramm</span>
        </div>
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

  const normalizedContent = normalizeMarkdownNewlines(content);
  const lines = normalizedContent.split("\n");
  
  const elements: React.ReactNode[] = [];
  
  let inMermaid = false;
  let mermaidBuffer: string[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  let codeLang = "";
  let imageCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();

    // Mermaid code block start/end
    if (trimmedLine.startsWith("```mermaid") || trimmedLine.startsWith("```diagram")) {
      inMermaid = true;
      mermaidBuffer = [];
      continue;
    }
    if (inMermaid) {
      if (trimmedLine === "```") {
        inMermaid = false;
        const chartCode = mermaidBuffer.join("\n");
        elements.push(<MermaidDiagram key={`mermaid-${i}`} id={`m-${i}`} chart={chartCode} />);
        mermaidBuffer = [];
      } else {
        mermaidBuffer.push(rawLine);
      }
      continue;
    }

    // Generic Code block start/end
    if (trimmedLine.startsWith("```")) {
      if (inCode) {
        inCode = false;
        elements.push(<CodeBlock key={`code-${i}`} code={codeBuffer.join("\n")} language={codeLang} />);
        codeBuffer = [];
        codeLang = "";
      } else {
        inCode = true;
        codeLang = trimmedLine.replace("```", "");
        codeBuffer = [];
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Standalone or extracted Markdown Images: ![alt](url)
    const imgMatch = trimmedLine.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      imageCounter++;
      elements.push(<SmartImage key={`img-${i}`} src={src} alt={alt} index={imageCounter} />);
      continue;
    }

    // Skip empty or orphaned heading lines like "#", "##", "###"
    if (trimmedLine === "#" || trimmedLine === "##" || trimmedLine === "###") {
      continue;
    }

    // Headings (with stripEmojis for clean typography)
    if (trimmedLine.startsWith("### ")) {
      const titleText = stripEmojis(trimmedLine.substring(4).trim());
      if (titleText) {
        elements.push(
          <h4 key={`h3-${i}`} className="text-base font-extrabold mt-8 mb-4 text-ink leading-snug flex items-center gap-2 border-b pb-2 border-line-soft">
            {formatInlineMarkdown(titleText)}
          </h4>
        );
      }
      continue;
    }
    if (trimmedLine.startsWith("## ")) {
      const titleText = stripEmojis(trimmedLine.substring(3).trim());
      if (titleText) {
        elements.push(
          <h3 key={`h2-${i}`} className="text-lg font-extrabold mt-10 mb-5 text-ink leading-tight flex items-center gap-2 border-b pb-2 border-line">
            {formatInlineMarkdown(titleText)}
          </h3>
        );
      }
      continue;
    }
    if (trimmedLine.startsWith("# ")) {
      const titleText = stripEmojis(trimmedLine.substring(2).trim());
      if (titleText) {
        elements.push(
          <h2 key={`h1-${i}`} className="text-xl font-extrabold mt-12 mb-6 text-blue uppercase tracking-tight">
            {formatInlineMarkdown(titleText)}
          </h2>
        );
      }
      continue;
    }

    // Bullet Lists (support -, *, +, ^)
    if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ") || trimmedLine.startsWith("+ ") || trimmedLine.startsWith("^ ")) {
      const listContent = trimmedLine.startsWith("^ ") ? trimmedLine.substring(2) : trimmedLine.substring(2);
      elements.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-sm text-ink-2 mb-2 leading-relaxed">
          {formatInlineMarkdown(listContent)}
        </li>
      );
      continue;
    }

    // Numbered Lists
    const numMatch = trimmedLine.match(/^(\d+)[\.\)]\s+(.*)/);
    if (numMatch) {
      elements.push(
        <li key={`nli-${i}`} className="ml-5 list-decimal text-sm text-ink-2 mb-2 leading-relaxed">
          {formatInlineMarkdown(numMatch[2])}
        </li>
      );
      continue;
    }

    // Blockquotes / Callouts
    if (trimmedLine.startsWith("> ")) {
      elements.push(
        <blockquote key={`bq-${i}`} className="my-5 p-4 border-l-4 border-blue bg-blue/5 rounded-r-xl text-sm italic text-ink-2">
          {formatInlineMarkdown(trimmedLine.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Blank lines
    if (trimmedLine === "") {
      elements.push(<div key={`space-${i}`} className="h-3" />);
      continue;
    }

    // Standard paragraph text
    elements.push(
      <p key={`p-${i}`} className="text-sm text-ink-2 mb-4 leading-relaxed font-sans">
        {formatInlineMarkdown(trimmedLine)}
      </p>
    );
  }

  return <div className="rich-content space-y-1">{elements}</div>;
}

