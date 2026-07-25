"use client";

import { useState } from "react";
import { YouTubeIcon } from "./Icons";

export type Video = {
  id: string;
  title: string;
  channel: string;
  similarity?: number;
};

export default function VideoThumb({
  video,
  className = "",
}: {
  video: Video;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`group relative overflow-hidden rounded-lg bg-bg-subtle ${className}`}>
      {!failed ? (
        <img
          src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1f1f1f] to-[#0f0f0f]">
          <YouTubeIcon className="h-7 w-7 text-brand/70" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-black/60 backdrop-blur transition-transform duration-300 group-hover:scale-110">
          <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 text-white" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      {video.similarity != null && (
        <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white backdrop-blur">
          {video.similarity}%
        </span>
      )}
    </div>
  );
}
