import type { ReactNode } from "react";
import { Bell, LayoutGrid, Search, Wifi, BatteryMedium } from "lucide-react";
import { cn } from "@/lib/utils";

export type SystemTopBarProps = {
  time?: string;
  avatarUrl?: string | null;
  avatarAlt?: string;
  className?: string;
  trailing?: ReactNode;
};

/** Bottom system navigation bar — glass pill, avatar + status + quick actions + app strip */
export function SystemTopBar({
  time = "10:00",
  avatarUrl,
  avatarAlt = "Profil",
  className,
  trailing,
}: SystemTopBarProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-4xl items-center justify-between gap-rlds-md rounded-full border border-white/30 bg-white/40 px-rlds-lg py-rlds-sm shadow-[var(--shadow-rlds-bevel)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50",
        className,
      )}
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-white/80 dark:bg-zinc-700">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={avatarAlt} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-rlds-body-2 text-rlds-fg-secondary">
            AI
          </span>
        )}
        <span
          className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900"
          aria-hidden
        />
      </div>

      <div className="flex items-center gap-rlds-sm text-rlds-body-2-em text-rlds-fg">
        <span className="tabular-nums">{time}</span>
        <Wifi className="h-4 w-4 text-rlds-fg-secondary" strokeWidth={1.75} />
        <BatteryMedium className="h-4 w-4 text-rlds-fg-secondary" strokeWidth={1.75} />
      </div>

      <div className="flex items-center gap-rlds-md text-rlds-fg">
        <button
          type="button"
          className="rounded-full p-1.5 transition hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/15"
          aria-label="Bildirimler"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="rounded-full p-1.5 transition hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/15"
          aria-label="Ara"
        >
          <Search className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <div className="hidden h-8 w-14 rounded-full border border-dashed border-rlds-border sm:block" />

        <div className="flex items-center gap-rlds-xs">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-9 shrink-0 rounded-rlds-sm bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 shadow-sm"
            />
          ))}
        </div>

        <button
          type="button"
          className="rounded-full p-2 transition hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10"
          aria-label="Uygulamalar"
        >
          <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {trailing}
    </div>
  );
}
