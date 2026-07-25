"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { YouTubeIcon, HuggingFaceIcon, ChromaIcon, OpenAIIcon, LangChainIcon } from "./Icons";

type Step = {
  n: number;
  title: string;
  tech: string;
  caption: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
};

function Mini({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-16 items-center justify-center rounded-md border border-line bg-bg px-2">
      {children}
    </div>
  );
}

const STEPS: Step[] = [
  {
    n: 1, title: "Video", tech: "YouTube Data API", caption: "Videos are pulled by query or channel.",
    icon: <YouTubeIcon className="h-4 w-4 text-brand" />,
    visual: (<Mini><div className="flex items-center gap-1.5">
      <span className="grid h-7 w-10 place-items-center rounded bg-[#1f1f1f]"><svg viewBox="0 0 24 24" className="ml-0.5 h-3 w-3 text-white" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>
      <div className="flex flex-col gap-1"><span className="h-1 w-8 rounded bg-fg/30" /><span className="h-1 w-6 rounded bg-fg/15" /></div>
    </div></Mini>),
  },
  {
    n: 2, title: "Transcript", tech: "Speech-to-text", caption: "Audio is converted into clean text.",
    icon: <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M4 10h16M4 14h10M4 18h7" /></svg>,
    visual: (<Mini><div className="flex flex-col gap-1">
      <span className="h-1 w-16 rounded bg-fg/40" /><span className="h-1 w-12 rounded bg-fg/25" /><span className="h-1 w-14 rounded bg-fg/25" /><span className="h-1 w-10 rounded bg-fg/15" />
    </div></Mini>),
  },
  {
    n: 3, title: "Embed", tech: "sentence-transformers", caption: "Each transcript becomes a 384-d vector.",
    icon: <HuggingFaceIcon className="h-4 w-4 text-brand" />,
    visual: (<Mini><span className="font-mono text-[10px] text-fg/70">[0.21, -0.44, 0.88, …]</span></Mini>),
  },
  {
    n: 4, title: "Store", tech: "ChromaDB", caption: "Vectors are indexed for fast lookup.",
    icon: <ChromaIcon className="h-4 w-4 text-brand" />,
    visual: (<Mini><div className="flex flex-col gap-0.5 font-mono text-[9px] text-fg/50">
      <span>▸ [0.21, …]</span><span>▸ [-0.44, …]</span><span>▸ [0.88, …]</span><span className="text-brand">▸ indexed</span>
    </div></Mini>),
  },
  {
    n: 5, title: "Retrieve", tech: "top-k nearest", caption: "Query finds its closest transcripts.",
    icon: <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" strokeLinecap="round" /></svg>,
    visual: (<Mini><div className="flex items-center gap-2">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[9px] font-bold text-white">Q</span>
      <div className="flex flex-col gap-0.5"><span className="h-1 w-10 rounded bg-brand" /><span className="h-1 w-8 rounded bg-fg/20" /><span className="h-1 w-7 rounded bg-fg/20" /></div>
    </div></Mini>),
  },
  {
    n: 6, title: "Answer", tech: "LangChain · OpenAI", caption: "An answer is written from the sources.",
    icon: <OpenAIIcon className="h-4 w-4 text-brand" />,
    visual: (<Mini><div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" /><span className="h-1.5 w-1.5 rounded-full bg-brand/60" /><span className="font-mono text-[9px] text-fg/60">cited</span>
    </div></Mini>),
  },
];

export default function PipelineSimulation() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % STEPS.length), 1900);
    return () => clearInterval(id);
  }, []);

  const cur = STEPS[active];
  const progress = ((active + 1) / STEPS.length) * 100;

  return (
    <section id="pipeline" className="border-y border-line bg-bg-subtle">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">/ the pipeline</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">From a video to a grounded answer.</h2>
          <p className="mt-4 text-muted">Every query travels the same six steps. Watch one request move through the system.</p>
        </div>

        {/* synced progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-[12px]">
            <span className="font-mono text-muted">step {cur.n} / {STEPS.length}</span>
            <AnimatePresence mode="wait">
              <motion.span key={active} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }} className="font-medium">
                {cur.title} <span className="text-muted">— {cur.caption}</span>
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg">
            <motion.div className="h-full rounded-full bg-brand" animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
          </div>
        </div>

        {/* stages */}
        <div className="flex items-stretch gap-2 overflow-x-auto pb-3 [scrollbar-width:thin] snap-x snap-mandatory sm:gap-0">
          {STEPS.map((s, i) => {
            const isActive = i === active;
            const done = i < active;
            return (
              <div key={s.n} className="flex items-center">
                <motion.div
                  animate={{ borderColor: isActive ? "var(--brand)" : "var(--border)", scale: isActive ? 1.03 : 1 }}
                  transition={{ duration: 0.3 }}
                  className={`relative w-[150px] shrink-0 snap-center rounded-xl border bg-bg p-3 sm:w-[164px] ${isActive ? "card" : ""}`}
                  style={{ boxShadow: isActive ? "0 0 0 1px var(--brand), var(--shadow)" : "none" }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="grid h-7 w-7 place-items-center rounded-md border border-line">{s.icon}</span>
                    <span className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] transition-colors ${isActive || done ? "bg-brand text-white" : "bg-bg-subtle text-muted"}`}>
                      {done ? "✓" : s.n}
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold">{s.title}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-muted">{s.tech}</div>
                  <div className="mt-2">{s.visual}</div>
                </motion.div>

                {i < STEPS.length - 1 && (
                  <div className="relative mx-1 hidden h-[2px] w-6 items-center sm:flex sm:w-8">
                    <div className="absolute inset-0 rounded-full bg-line" />
                    <motion.span
                      className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-brand"
                      animate={{ left: ["-4px", "100%"], opacity: done || isActive ? [0, 1, 0] : 0 }}
                      transition={{ duration: 1.4, repeat: done || isActive ? Infinity : 0, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted sm:hidden">← scroll to follow the flow →</p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5"><LangChainIcon className="h-4 w-4" /> orchestrated by LangChain</span>
          <span className="inline-flex items-center gap-1.5"><ChromaIcon className="h-4 w-4" /> stored in ChromaDB</span>
          <span className="inline-flex items-center gap-1.5"><OpenAIIcon className="h-4 w-4" /> answered by OpenAI</span>
        </div>
      </div>
    </section>
  );
}
