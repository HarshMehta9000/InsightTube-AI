"use client";

import { motion } from "framer-motion";
import {
  PythonIcon,
  FastAPIIcon,
  PydanticIcon,
  LangChainIcon,
  OpenAIIcon,
  ChromaIcon,
  HuggingFaceIcon,
  StreamlitIcon,
  DockerIcon,
} from "./Icons";

const STACK = [
  { Icon: PythonIcon, name: "Python", role: "runtime" },
  { Icon: FastAPIIcon, name: "FastAPI", role: "backend" },
  { Icon: PydanticIcon, name: "Pydantic", role: "validation" },
  { Icon: LangChainIcon, name: "LangChain", role: "orchestration" },
  { Icon: OpenAIIcon, name: "OpenAI", role: "LLM" },
  { Icon: HuggingFaceIcon, name: "sentence-transformers", role: "embeddings" },
  { Icon: ChromaIcon, name: "ChromaDB", role: "vector store" },
  { Icon: StreamlitIcon, name: "Streamlit", role: "dashboard" },
  { Icon: DockerIcon, name: "Docker", role: "containers" },
];

export default function TechStack() {
  return (
    <section id="stack" className="border-t border-line bg-bg-subtle">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand">/ stack</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            A deliberate, small stack.
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Each tool does one job. They&apos;re wired together with typed contracts, so when
            something breaks it fails loudly and locally — not silently somewhere downstream.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {STACK.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-bg px-3 py-2.5 transition-colors hover:border-brand/40"
              >
                <s.Icon className="h-5 w-5 shrink-0 text-fg/80" />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium">{s.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-muted">
                    {s.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-2xl border border-line bg-[#0b0b0b]"
        >
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[11px] text-white/40">semantic_engine.py</span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-white/85">
            <code>
              <span className="text-[#ff7b72]">from</span>{" "}
              <span className="text-[#7ee787]">core.ai.semantic_engine</span>{" "}
              <span className="text-[#ff7b72]">import</span>{" "}
              <span className="text-[#ffa657]">NLQueryEngine</span>
              {"\n\n"}
              <span className="text-white/40"># ask anything in plain English</span>
              {"\n"}
              <span className="text-[#79c0ff]">engine</span> ={" "}
              <span className="text-[#ffa657]">NLQueryEngine</span>()
              {"\n"}
              <span className="text-[#79c0ff]">res</span> ={" "}
              <span className="text-[#ff7b72]">await</span>{" "}
              <span className="text-[#79c0ff]">engine</span>.ask(
              {"\n"}
              {"    "}<span className="text-[#a5d6ff]">&quot;best videos on vector databases?&quot;</span>
              {"\n"})
              {"\n\n"}
              <span className="text-white/40"># embed → retrieve top-k → grounded answer</span>
              {"\n"}
              <span className="text-[#d2a8ff]">print</span>(res[
              <span className="text-[#a5d6ff]">&quot;answer&quot;</span>]){"  "}
              <span className="text-white/40"># grounded in res[&quot;sources&quot;]</span>
            </code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
