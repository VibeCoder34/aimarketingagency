import type { ReactNode } from "react";
import { ChevronLeft, Ellipsis, Minus, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ControlBarNavProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  /** Orta alan: parlaklık vb. placeholder */
  center?: ReactNode;
  /** Sağda … menüsü */
  showMenu?: boolean;
  className?: string;
};

/** Uygulama penceresi üst kontrol çubuğu — beyaz hap, pencere aksiyonları */
export function ControlBarNav({
  title,
  showBack,
  onBack,
  center,
  showMenu,
  className,
}: ControlBarNavProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center gap-rlds-sm rounded-full bg-rlds-surface px-rlds-md py-rlds-xs text-rlds-fg shadow-[var(--shadow-rlds-bevel)] ring-1 ring-black/5 dark:ring-white/10",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-rlds-xs">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded-full p-1.5 transition hover:bg-rlds-ui-2 active:bg-rlds-ui"
            aria-label="Geri"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
        <span className="rlds-body-1-em truncate">{title}</span>
      </div>

      <div className="hidden shrink-0 items-center gap-rlds-sm sm:flex">{center}</div>

      <div className="flex shrink-0 items-center gap-rlds-xs">
        {showMenu ? (
          <button
            type="button"
            className="rounded-full p-1.5 transition hover:bg-rlds-ui-2"
            aria-label="Daha fazla"
          >
            <Ellipsis className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
        <button type="button" className="rounded-full p-1.5 transition hover:bg-rlds-ui-2" aria-label="Küçült">
          <Minus className="h-4 w-4" strokeWidth={2} />
        </button>
        <button type="button" className="rounded-full p-1.5 transition hover:bg-rlds-ui-2" aria-label="Tam ekran">
          <Square className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <button type="button" className="rounded-full p-1.5 transition hover:bg-red-500/15" aria-label="Kapat">
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
