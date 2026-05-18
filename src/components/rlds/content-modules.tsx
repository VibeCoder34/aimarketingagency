import { Ellipsis, FastForward, Pause, Rewind, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroCardProps = {
  eyebrow?: string;
  title: string;
  className?: string;
  /** Koyu veya parlak gradient varyantı */
  tone?: "dark" | "vivid";
};

export function HeroCard({ eyebrow, title, className, tone = "dark" }: HeroCardProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-40 flex-col justify-end overflow-hidden rounded-rlds-lg p-rlds-lg text-white",
        tone === "dark"
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-black"
          : "bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light">
        <div className="absolute -right-6 top-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-black/30 blur-3xl" />
      </div>
      <div className="relative z-10">
        {eyebrow ? <p className="rlds-meta text-white/80">{eyebrow}</p> : null}
        <p className="rlds-h2 text-white">{title}</p>
        <div className="mt-rlds-md flex items-center gap-rlds-sm">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur">
            <Ellipsis className="h-4 w-4" />
          </span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-white" : "bg-white/40")} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export type MediaControlsBarProps = {
  progress?: number;
  className?: string;
};

/** Siyah bar üzerinde oynatıcı kontrolleri + progress */
export function MediaControlsBar({ progress = 35, className }: MediaControlsBarProps) {
  return (
    <div className={cn("overflow-hidden rounded-rlds-lg bg-black text-white", className)}>
      <div className="flex items-center justify-between gap-rlds-md px-rlds-lg py-rlds-md">
        <button type="button" className="rounded-full p-2 hover:bg-white/10" aria-label="Ses">
          <Volume2 className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <div className="flex items-center gap-rlds-lg">
          <button type="button" className="rounded-full p-2 hover:bg-white/10" aria-label="10 saniye geri">
            <Rewind className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black hover:bg-white/90"
            aria-label="Duraklat"
          >
            <Pause className="h-6 w-6" fill="currentColor" strokeWidth={0} />
          </button>
          <button type="button" className="rounded-full p-2 hover:bg-white/10" aria-label="10 saniye ileri">
            <FastForward className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        <button type="button" className="rounded-full p-2 hover:bg-white/10" aria-label="Daha fazla">
          <Ellipsis className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
      <div className="h-1 w-full bg-white/15">
        <div className="h-full bg-white transition-[width]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export type MediaPlayerProps = {
  progress?: number;
  className?: string;
};

export function MediaPlayer({ progress = 40, className }: MediaPlayerProps) {
  return (
    <div className={cn("overflow-hidden rounded-rlds-lg", className)}>
      <div className="relative min-h-48 bg-gradient-to-br from-sky-400 via-indigo-500 to-fuchsia-500">
        <MediaControlsBar progress={progress} className="absolute inset-x-0 bottom-0 rounded-none border-0" />
      </div>
    </div>
  );
}
