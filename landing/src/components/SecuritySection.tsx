"use client";

import { motion } from "framer-motion";

const PILLARS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Retrieval guardrails",
    body: "Answers are constrained to retrieved context. If the store has nothing relevant, the model says so instead of guessing — wrong answers fail in a visible, debuggable way.",
    points: ["Context-grounded generation", "Explicit low-confidence signals", "Source citations on every answer"],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="m7 14 3-3 3 3 5-6" />
      </svg>
    ),
    title: "Eval harness",
    body: "Question-and-expected-source pairs measure whether retrieval actually got better after a model swap — so improvements are evidence-based, not vibes.",
    points: ["Retrieval recall @ k", "Answer faithfulness scoring", "Regression tracking per change"],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "API security",
    body: "Every service sits behind typed contracts and standard hardening — secrets never leave the container, and requests are validated before they touch the model.",
    points: ["Pydantic input validation", "Rate limiting & sane defaults", "Secrets via env, never committed"],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
      </svg>
    ),
    title: "Observability",
    body: "Each stage logs what it did and how long it took, so a slow or failing step is localised instantly instead of hidden inside one monolithic request.",
    points: ["Per-stage latency traces", "Structured pipeline logs", "Containerised, isolated failures"],
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="mx-auto max-w-6xl px-5 py-24">
      <div className="mb-12 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">/ trust &amp; safety</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Retrieval you can trust, failures you can see.
        </h2>
        <p className="mt-4 text-muted">
          The whole point of the RAG pattern is observability. Guardrails and evaluation make sure
          the system gets better on purpose — not by accident.
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="bg-bg p-7 transition-colors hover:bg-bg-subtle"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-brand">
              {p.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{p.body}</p>
            <ul className="mt-4 space-y-1.5">
              {p.points.map((pt) => (
                <li key={pt} className="flex items-center gap-2 text-[13px] text-fg/80">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                  {pt}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
