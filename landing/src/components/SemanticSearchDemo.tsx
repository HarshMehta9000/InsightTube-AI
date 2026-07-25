"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoThumb, { type Video } from "./VideoThumb";
import { YouTubeIcon, OpenAIIcon } from "./Icons";

type QA = {
  q: string;
  a: string;
  sources: Video[];
};

const QA_BANK: QA[] = [
  {
    q: "How do transformers handle attention?",
    a: "Attention lets each token weigh every other token through learned query, key and value vectors. Multi-head attention runs several of these in parallel, so the model captures different kinds of relationships at once. The retrieved sources walk through it with worked visual examples.",
    sources: [
      { id: "aircAruvnKk", title: "But what is a neural network?", channel: "3Blue1Brown", similarity: 94 },
      { id: "kCc8FmEb1nY", title: "Let's build GPT from scratch", channel: "Andrej Karpathy", similarity: 91 },
      { id: "WXuK6gekU1Y", title: "Intro to LLMs & attention", channel: "AI Explained", similarity: 88 },
    ],
  },
  {
    q: "What's the best way to build a RAG system?",
    a: "Chunk your documents, embed each chunk, and store the vectors in a database like Chroma. At query time, embed the question, retrieve the top-k nearest chunks, then feed them as context to the LLM so it answers only from what was retrieved. The sources below cover a full end-to-end build.",
    sources: [
      { id: "kCc8FmEb1nY", title: "Let's build GPT from scratch", channel: "Andrej Karpathy", similarity: 90 },
      { id: "WXuK6gekU1Y", title: "Intro to LLMs & attention", channel: "AI Explained", similarity: 86 },
      { id: "aircAruvnKk", title: "But what is a neural network?", channel: "3Blue1Brown", similarity: 82 },
    ],
  },
  {
    q: "Which videos explain vector databases?",
    a: "Vector databases store embeddings and return nearest neighbours by cosine similarity. The top matches compare options like Chroma and pgvector and show exactly when each one fits — small prototypes versus production scale.",
    sources: [
      { id: "WXuK6gekU1Y", title: "Intro to LLMs & attention", channel: "AI Explained", similarity: 92 },
      { id: "aircAruvnKk", title: "But what is a neural network?", channel: "3Blue1Brown", similarity: 79 },
      { id: "kCc8FmEb1nY", title: "Let's build GPT from scratch", channel: "Andrej Karpathy", similarity: 76 },
    ],
  },
];

type Phase = "idle" | "retrieving" | "answering" | "done";

export default function SemanticSearchDemo() {
  const [active, setActive] = useState<QA>(QA_BANK[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [question, setQuestion] = useState<QA["q"]>(QA_BANK[0].q);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = (qa: QA) => {
    clearTimers();
    setActive(qa);
    setQuestion(qa.q);
    setTyped("");
    setPhase("retrieving");

    const t1 = setTimeout(() => setPhase("answering"), 1100);
    timers.current.push(t1);

    // typewriter
    const words = qa.a.split(" ");
    let i = 0;
    const tick = () => {
      i += 1;
      setTyped(words.slice(0, i).join(" "));
      if (i < words.length) {
        timers.current.push(setTimeout(tick, 26));
      } else {
        setPhase("done");
      }
    };
    const t2 = setTimeout(tick, 1150);
    timers.current.push(t2);
  };

  useEffect(() => {
    run(QA_BANK[0]);
    return clearTimers;
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [typed, phase]);

  const retrieveSteps = ["Embed query", "ANN search · 1,284 vectors", "Top-3 neighbours", "Build grounded prompt"];

  return (
    <section id="search" className="mx-auto max-w-6xl px-5 py-24">
      <div className="mb-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">/ live demo</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Ask a question. Watch it retrieve.
        </h2>
        <p className="mt-4 text-muted">
          A simulated end-to-end query. Pick a question — the engine embeds it, finds the nearest
          video transcripts in the vector store, then writes an answer grounded only in those
          sources.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Chat panel */}
        <div className="surface flex h-[520px] flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <YouTubeIcon className="h-4 w-4 text-brand" />
            <span className="text-[13px] font-medium">InsightTube · semantic search</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              online
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
            {/* user bubble */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-[13px] text-white">
                {question}
              </div>
            </div>

            {/* retrieval status */}
            <AnimatePresence>
            {phase === "retrieving" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-line bg-bg p-3"
              >
                <div className="mb-2 flex items-end gap-0.5">
                  {Array.from({ length: 22 }).map((_, b) => (
                    <motion.span
                      key={b}
                      className="w-1 rounded-full bg-brand/70"
                      animate={{ height: [4, 6 + ((b * 7) % 16), 4] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: b * 0.03, ease: "easeInOut" }}
                    />
                  ))}
                  <span className="ml-2 font-mono text-[10px] text-muted">embedding query…</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] text-muted">
                  {retrieveSteps.map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.22 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-brand">▸</span>
                      {s}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* answer bubble */}
            {(phase === "answering" || phase === "done") && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-bg px-4 py-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted">
                    <OpenAIIcon className="h-3.5 w-3.5 text-brand" />
                    Answer · grounded in {active.sources.length} sources
                    {phase === "done" && (
                      <button
                        onClick={() => run(active)}
                        className="ml-auto inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 text-[10px] normal-case tracking-normal text-muted transition-colors hover:text-fg"
                      >
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6" /></svg>
                        regenerate
                      </button>
                    )}
                  </div>
                  <p className="text-[13px] leading-relaxed text-fg/90">
                    {typed}
                    {phase === "answering" && <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-brand align-middle" />}
                  </p>
                </div>
              </div>
            )}

            {/* sources */}
            {(phase === "answering" || phase === "done") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="mb-2 text-[11px] uppercase tracking-wide text-muted">Retrieved sources</p>
                <div className="grid grid-cols-3 gap-2">
                  {active.sources.map((v) => (
                    <div key={v.id} className="overflow-hidden rounded-lg border border-line">
                      <VideoThumb video={v} className="aspect-video" />
                      <div className="p-1.5">
                        <p className="line-clamp-1 text-[10.5px] font-medium leading-tight">{v.title}</p>
                        <p className="mt-0.5 text-[9.5px] text-muted">{v.channel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* suggested questions */}
          <div className="flex flex-wrap gap-2 border-t border-line p-3">
            {QA_BANK.map((qa) => (
              <button
                key={qa.q}
                data-q="1"
                onClick={() => run(qa)}
                disabled={phase === "retrieving" || phase === "answering"}
                className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors disabled:opacity-40 ${
                  qa.q === active.q && phase === "done"
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-line text-muted hover:text-fg"
                }`}
              >
                {qa.q}
              </button>
            ))}
          </div>
        </div>

        {/* Side: how retrieval scored it */}
        <div className="surface rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">retrieval trace</p>
          <div className="mt-4 space-y-3">
            {active.sources.map((v, i) => (
              <div key={v.id}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="truncate text-fg/80">#{i + 1} · {v.channel}</span>
                  <span className="font-mono text-brand">{v.similarity}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
                  <motion.div
                    className="h-full rounded-full bg-brand"
                    initial={{ width: 0 }}
                    animate={{ width: `${v.similarity}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-line bg-bg p-3 text-[11px] leading-relaxed text-muted">
            <span className="font-medium text-fg">cosine similarity</span> ranks every transcript
            by semantic distance to your question — not keyword overlap.
          </div>
        </div>
      </div>
    </section>
  );
}
