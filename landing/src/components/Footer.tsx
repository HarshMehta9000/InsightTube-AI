import { YouTubeIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <YouTubeIcon className="h-5 w-5 text-brand" />
          <span className="text-[13px] text-muted">
            Insight<span className="text-brand">Tube</span> AI · MIT License
          </span>
        </div>
        <div className="flex items-center gap-5 text-[13px] text-muted">
          <a className="transition-colors hover:text-fg" href="#search">Search</a>
          <a className="transition-colors hover:text-fg" href="#pipeline">Pipeline</a>
          <a className="transition-colors hover:text-fg" href="#vectors">Vectors</a>
          <a
            className="transition-colors hover:text-fg"
            href="https://github.com/HarshMehta9000/InsightTube-AI"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
