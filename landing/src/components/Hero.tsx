"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoThumb, { type Video } from "./VideoThumb";
import {
  YouTubeIcon,
  FastAPIIcon,
  OpenAIIcon,
  LangChainIcon,
  ChromaIcon,
} from "./Icons";

const POOL: Video[] = [
  { id: "aircAruvnKk", title: "But what is a neural network?", channel: "3Blue1Brown", similarity: 94 },
  { id: "kCc8FmEb1nY", title: "Let's build GPT: from scratch", channel: "Andrej Karpathy", similarity: 91 },
  { id: "WXuK6gekU1Y", title: "Intro to LLMs & retrieval", channel: "AI Explained", similarity: 88 },
  { id: "Tbn6V1O9H4I", title: "Vector databases, explained", channel: "Tech With Tim", similarity: 86 },
  { id: "elhL9JIy2qo", title: "RAG pipelines end-to-end", channel: "LangChain", similarity: 83 },
  { id: "kBLizQ4VZNg", title: "Embeddings & similarity", channel: "James Briggs", similarity: 80 },
];

const QUERIES = [
  "how do transformers handle attention?",
  "best way to build a RAG system?",
  "which videos explain vector databases?",
];

const BRANDS = [
  { Icon: YouTubeIcon, name: "YouTube" },
  { Icon: FastAPIIcon, name: "FastAPI" },
  { Icon: LangChainIcon, name: "LangChain" },
  { Icon: OpenAIIcon, name: "OpenAI" },
  { Icon: ChromaIcon, name: "ChromaDB" },
];

function useTypewriter(words: string[]) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let wi = 0;
    let ci = 0;
    let deleting = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const w = words[wi];
      if (!deleting) {
        ci += 1;
        setOut(w.slice(0, ci));
        if (ci === w.length) {
          deleting = true;
          t = setTimeout(tick, 1600);
          return;
        }
      } else {
        ci -= 1;
        setOut(w.slice(0, ci));
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
        }
      }
      t = setTimeout(tick, deleting ? 28 : 60);
    };
    t = setTimeout(tick, 500);
    return () => clearTimeout(t);
  }, [words]);
  return out;
}

export default function Hero() {
  const typed = useTypewriter(QUERIES);
  const [spin, setSpin] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSpin((s) => s + 1), 3200);
    return () => clearInterval(id);
  }, []);
  const sources = [0, 1, 2].map((o) => POOL[(spin + o) % POOL.length]);

  return (
    <section id="top" className="hero-glow relative overflow-hidden pt-32 pb-20 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-60" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_1fr]">
        {/* Left: copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-subtle px-3 py-1 text-xs text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Video → Transcript → Vector → Grounded answers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-5 text-[2.7rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl"
          >
            Search YouTube by <span className="text-brand">meaning</span>, not keywords.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg"
          >
            InsightTube AI pulls videos, extracts their transcripts, and embeds them into a vector
            database. Ask in plain English and get an answer grounded in the exact videos it
            retrieved — with every source cited.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="#search"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              Try the live search
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a
              href="#pipeline"
              className="inline-flex items-center justify-center rounded-lg border border-line px-5 py-3 text-sm font-semibold text-fg transition-colors hover:bg-bg-subtle"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10"
          >
            <p className="mb-3 text-[11px] uppercase tracking-widest text-muted">Built on</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted">
              {BRANDS.map(({ Icon, name }) => (
                <span key={name} className="flex items-center gap-1.5">
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="text-[13px] font-medium text-fg/80">{name}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: product mock with live-typing query */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card rounded-2xl p-4"
        >
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[11px] text-muted">insighttube · semantic search</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" strokeLinecap="round" /></svg>
            <span className="truncate text-[13px] text-fg">
              {typed}
              <span className="caret" />
            </span>
            <span className="ml-auto shrink-0 rounded bg-brand/10 px-1.5 py-0.5 font-mono text-[10px] text-brand">embed</span>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-bg p-4">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted">
              <OpenAIIcon className="h-3.5 w-3.5 text-brand" />
              Answer · grounded in 3 sources
            </div>
            <p className="text-[13px] leading-relaxed text-fg/90">
              Attention lets each token weigh every other token, forming context-aware
              representations. The key insight is that{" "}
              <span className="rounded bg-brand/10 px-0.5 text-fg">queries, keys and values</span>{" "}
              let the model look back at relevant earlier positions…
            </p>
          </div>

          <p className="mb-2 mt-4 text-[11px] uppercase tracking-wide text-muted">Sources</p>
          <div className="grid grid-cols-3 gap-2">
            {sources.map((v, i) => (
              <motion.div
                key={v.id}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={v.id + spin}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.45 }}
                    className="overflow-hidden rounded-lg border border-line bg-bg"
                  >
                    <VideoThumb video={v} className="aspect-video" />
                    <div className="p-1.5">
                      <p className="line-clamp-1 text-[10.5px] font-medium leading-tight text-fg">{v.title}</p>
                      <p className="mt-0.5 text-[9.5px] text-muted">{v.channel}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
