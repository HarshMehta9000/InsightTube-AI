"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoThumb, { type Video } from "./VideoThumb";
import { YouTubeIcon, OpenAIIcon } from "./Icons";

type Item = Video & { status: "ingesting" | "indexed" };

const PALETTE: Video[] = [
  { id: "aircAruvnKk", title: "But what is a neural network?", channel: "3Blue1Brown" },
  { id: "kCc8FmEb1nY", title: "Let's build GPT from scratch", channel: "Andrej Karpathy" },
  { id: "WXuK6gekU1Y", title: "Intro to large language models", channel: "AI Explained" },
  { id: "Tbn6V1O9H4I", title: "Vector databases, explained", channel: "Tech With Tim" },
  { id: "elhL9JIy2qo", title: "RAG pipelines end-to-end", channel: "LangChain" },
  { id: "kBLizQ4VZNg", title: "Embeddings & similarity search", channel: "James Briggs" },
];

const QUESTIONS = [
  "Summarize my knowledge base",
  "What do these videos have in common?",
  "What are the key takeaways?",
];

type Msg = { role: "user" | "assistant"; text: string; sources?: Video[] };

function topicOf(items: Item[]): string {
  const t = items.map((i) => i.title + " " + i.channel).join(" ").toLowerCase();
  if (/gpt|transformer|neural|attention/.test(t)) return "neural networks & attention";
  if (/rag|retriev|pipeline/.test(t)) return "retrieval-augmented generation";
  if (/vector|embedding|similarity|database/.test(t)) return "vector search & embeddings";
  return "applied machine learning";
}

function buildAnswer(items: Item[], question: string): string {
  const channels = [...new Set(items.map((i) => i.channel))];
  const titles = items.slice(0, 2).map((i) => `“${i.title}”`);
  const n = items.length;
  const topic = topicOf(items);
  const q = question.toLowerCase();
  if (q.includes("common") || q.includes("have in common")) {
    return `Across the ${n} indexed transcript${n > 1 ? "s" : ""} you added — from ${channels.join(
      ", "
    )} — the shared focus is ${topic}. Notably, ${titles.join(" and ")} approach it from a builder's perspective.`;
  }
  if (q.includes("takeaway")) {
    return `From your ${n} source${n > 1 ? "s" : ""} (${titles.join(", ")}): (1) ${topic} is best learned through worked examples, (2) retrieval grounds answers in real data, and (3) the engineering — chunking, embedding, indexing — matters as much as the model.`;
  }
  return `Your knowledge base holds ${n} indexed video${n > 1 ? "s" : ""}: ${titles.join(
    " and "
  )} (from ${channels.join(", ")}). The dominant theme is ${topic}. Ask a follow-up and I'll answer only from these sources.`;
}

const INGEST_STEPS = ["downloading", "transcribing", "embedding"];

function IngestStatus() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, INGEST_STEPS.length - 1)), 600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-brand">{INGEST_STEPS[step]}…</span>
        <span className="font-mono text-[9px] text-muted">{step + 1}/3</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg-subtle">
        <motion.div
          className="h-full rounded-full bg-brand"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.7, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

export default function KnowledgeBaseDemo() {
  const [kb, setKb] = useState<Item[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState("");
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [auto, setAuto] = useState(true);
  const [round, setRound] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const kbRef = useRef<Item[]>(kb);
  const busyRef = useRef(busy);
  useEffect(() => { kbRef.current = kb; }, [kb]);
  useEffect(() => { busyRef.current = busy; }, [busy]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const indexed = kb.filter((i) => i.status === "indexed");

  const add = (v: Video) => {
    setKb((prev) => {
      if (prev.some((i) => i.id === v.id)) return prev;
      return [...prev, { ...v, status: "ingesting" }];
    });
    const t = setTimeout(() => {
      setKb((prev) => prev.map((i) => (i.id === v.id ? { ...i, status: "indexed" } : i)));
    }, 1800);
    timers.current.push(t);
  };

  const remove = (id: string) => setKb((prev) => prev.filter((i) => i.id !== id));

  const ask = (question: string) => {
    const indexedNow = kbRef.current.filter((i) => i.status === "indexed");
    if (busyRef.current || indexedNow.length === 0) return;
    setBusy(true);
    clearTimers();
    setTyping("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    const sources = indexedNow.slice(0, 3);
    const answer = buildAnswer(indexedNow, question);

    const t1 = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: "", sources }]);
      const words = answer.split(" ");
      let i = 0;
      const tick = () => {
        i += 1;
        const partial = words.slice(0, i).join(" ");
        setTyping(partial);
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant") copy[copy.length - 1] = { ...last, text: partial };
          return copy;
        });
        if (i < words.length) timers.current.push(setTimeout(tick, 24));
        else setBusy(false);
      };
      timers.current.push(setTimeout(tick, 350));
    }, 700);
    timers.current.push(t1);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  // auto-play: simulate adding videos + asking questions on a loop
  useEffect(() => {
    if (!auto) return;
    let cancelled = false;
    const local: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) =>
      local.push(setTimeout(() => { if (!cancelled) fn(); }, ms));
    setKb([]); setMessages([]); setTyping("");
    at(600, () => add(PALETTE[0]));
    at(2500, () => add(PALETTE[1]));
    at(5200, () => ask(QUESTIONS[0]));
    at(10800, () => ask(QUESTIONS[1]));
    at(15500, () => setRound((r) => r + 1));
    return () => { cancelled = true; local.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, round]);

  const parseYouTubeId = (text: string) => {
    const t = text.trim();
    const m = t.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
    return null;
  };

  const handleSubmit = () => {
    setAuto(false);
    const text = input.trim();
    if (!text) return;
    const id = parseYouTubeId(text);
    if (id) {
      if (!kb.some((i) => i.id === id)) {
        add({ id, title: "Pasted YouTube video", channel: "You" });
      }
      setInput("");
      return;
    }
    ask(text);
    setInput("");
  };

  return (
    <section id="build" className="mx-auto max-w-6xl px-5 py-24">
      <div className="mb-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">/ build your own</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Drop in videos. Chat with them.
        </h2>
        <p className="mt-4 text-muted">
          Add YouTube videos to a knowledge base — tap them on the left or{" "}
          <span className="text-fg">paste a URL in the chat</span>. Each one is ingested,
          transcribed and indexed in real time. Then ask anything, and the assistant answers using{" "}
          <span className="text-fg">only</span> the videos you added.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* LEFT: knowledge base */}
        <div className="surface flex flex-col rounded-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="flex items-center gap-2 text-[13px] font-medium">
              <YouTubeIcon className="h-4 w-4 text-brand" /> Knowledge base
            </span>
            <span className="font-mono text-[11px] text-muted">
              {indexed.length}/{kb.length} indexed
            </span>
          </div>

          {/* added items */}
          <div className="min-h-[96px] flex-1 space-y-2 p-3">
            <AnimatePresence initial={false}>
              {kb.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-1 py-6 text-center text-[12px] text-muted"
                >
                  No videos yet — add some below.
                </motion.p>
              )}
              {kb.map((it) => (
                <motion.div
                  key={it.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="flex items-center gap-2.5 rounded-lg border border-line bg-bg p-2"
                >
                  <VideoThumb video={it} className="h-9 w-14 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium">{it.title}</p>
                    <p className="truncate text-[10.5px] text-muted">{it.channel}</p>
                    {it.status === "ingesting" ? (
                      <IngestStatus />
                    ) : (
                      <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-brand">
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                        indexed
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => remove(it.id)}
                    aria-label="remove"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted transition-colors hover:bg-bg-subtle hover:text-fg"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* palette */}
          <div className="border-t border-line p-3">
            <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-wide text-muted">
              tap to add
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PALETTE.map((v) => {
                const added = kb.some((i) => i.id === v.id);
                return (
                  <button
                    key={v.id}
                    data-add={added ? "" : "1"}
                    onClick={() => { setAuto(false); add(v); }}
                    disabled={added}
                    className={`group overflow-hidden rounded-lg border text-left transition-colors ${
                      added ? "border-line opacity-40" : "border-line hover:border-brand"
                    }`}
                  >
                    <div className="relative">
                      <VideoThumb video={v} className="aspect-video" />
                      <span className="absolute inset-0 grid place-items-center bg-black/0 transition-colors group-hover:bg-black/30">
                        <span className="grid h-7 w-7 scale-0 place-items-center rounded-full bg-brand text-white transition-transform group-hover:scale-100">
                          +
                        </span>
                      </span>
                    </div>
                    <p className="line-clamp-1 px-1.5 py-1 text-[10px] font-medium">{v.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: chatbot */}
        <div className="surface flex h-[460px] flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <OpenAIIcon className="h-4 w-4 text-brand" />
            <span className="text-[13px] font-medium">Chat with your videos</span>
            <button
              onClick={() => setAuto((a) => !a)}
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10.5px] font-mono transition-colors ${
                auto ? "border-brand/40 bg-brand/10 text-brand" : "border-line text-muted"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${auto ? "bg-brand" : "bg-muted"}`} />
              {auto ? "auto-demo live" : "paused · tap to play"}
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <YouTubeIcon className="mb-3 h-8 w-8 text-brand/50" />
                <p className="max-w-[16rem] text-[13px] text-muted">
                  {indexed.length === 0
                    ? "Add at least one video to your knowledge base to start asking questions."
                    : "Ask a question — I'll answer from your indexed videos."}
                </p>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand px-3.5 py-2 text-[13px] text-white">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="rounded-2xl rounded-bl-sm border border-line bg-bg px-3.5 py-2.5 text-[13px] leading-relaxed text-fg/90">
                      {m.text}
                      {busy && i === messages.length - 1 && (
                        <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-brand align-middle" />
                      )}
                    </div>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.sources.map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center gap-1 rounded-full border border-line bg-bg px-2 py-1 text-[10.5px] text-fg/70"
                          >
                            <YouTubeIcon className="h-3 w-3 text-brand" />
                            {s.channel}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="border-t border-line p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {QUESTIONS.map((q) => (
                <button
                  key={q}
                  data-ask="1"
                  onClick={() => { setAuto(false); ask(q); }}
                  disabled={busy || indexed.length === 0}
                  className="rounded-full border border-line px-3 py-1.5 text-[12px] text-muted transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste a YouTube URL to add, or ask a question…"
                className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-[13px] outline-none transition-colors focus:border-brand"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Send
              </button>
            </form>
            <p className="mt-1.5 font-mono text-[10px] text-muted">
              try: youtube.com/watch?v=aircAruvnKk
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
