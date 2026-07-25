"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { YouTubeIcon } from "./Icons";
import { useActiveSection } from "./ScrollProgress";

const LINKS = [
  { href: "#search", label: "Search", id: "search" },
  { href: "#pipeline", label: "Pipeline", id: "pipeline" },
  { href: "#build", label: "Build", id: "build" },
  { href: "#vectors", label: "Vectors", id: "vectors" },
  { href: "#security", label: "Safety", id: "security" },
  { href: "#stack", label: "Stack", id: "stack" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(LINKS.map((l) => l.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-bg/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <a href="#top" className="flex items-center gap-2">
          <YouTubeIcon className="h-6 w-6 text-brand" />
          <span className="text-[15px] font-semibold tracking-tight">
            Insight<span className="text-brand">Tube</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                active === l.id ? "text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {l.label}
              {active === l.id && (
                <span className="mx-auto mt-0.5 block h-0.5 w-4 rounded-full bg-brand" />
              )}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com/HarshMehta9000/InsightTube-AI"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg bg-fg px-3.5 py-2 text-[13px] font-medium text-bg transition-opacity hover:opacity-90 sm:inline-block"
          >
            GitHub
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-bg lg:hidden">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-1 px-5 py-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-[14px] ${
                  active === l.id ? "bg-brand/10 text-brand" : "text-muted"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
