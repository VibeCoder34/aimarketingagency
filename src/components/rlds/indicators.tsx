import type { ReactNode } from "react";
import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "solid" | "outline" | "success" | "danger";

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ children, variant = "solid", className }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    solid: "bg-rlds-inverse text-rlds-fg-on-inverse",
    outline: "border border-rlds-border bg-rlds-surface text-rlds-fg",
    success: "bg-rlds-success text-white",
    danger: "bg-rlds-danger text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-rlds-sm py-rlds-3xs rlds-meta font-medium",
        styles[variant],
        className,
      )}
    >
      <span className="opacity-70" aria-hidden>
        |
      </span>
      {children}
    </span>
  );
}

export type StatusIconKind = "success" | "warning" | "error" | "neutral";

const statusConfig: Record<StatusIconKind, { className: string; icon: ReactNode }> = {
  success: {
    className: "bg-rlds-success text-white",
    icon: <Check className="h-3 w-3" strokeWidth={3} />,
  },
  warning: {
    className: "bg-rlds-warning text-white",
    icon: <Check className="h-3 w-3" strokeWidth={3} />,
  },
  error: {
    className: "bg-rlds-danger text-white",
    icon: <X className="h-3 w-3" strokeWidth={3} />,
  },
  neutral: {
    className: "bg-rlds-inverse text-rlds-fg-on-inverse",
    icon: <Minus className="h-3 w-3" strokeWidth={3} />,
  },
};

export function StatusIcon({ kind, className }: { kind: StatusIconKind; className?: string }) {
  const cfg = statusConfig[kind];

  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px]",
        cfg.className,
        className,
      )}
    >
      {cfg.icon}
    </span>
  );
}

export type ProgressBarProps = {
  value: number;
  max?: number;
  segmented?: boolean;
  className?: string;
};

export function ProgressBar({ value, max = 100, segmented, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  if (segmented) {
    return (
      <div className={cn("flex w-full gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-rlds-ui shadow-inner" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-rlds-ui shadow-inner", className)}>
      <div
        className="h-full rounded-full bg-rlds-inverse transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
