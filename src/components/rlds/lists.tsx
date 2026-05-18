import type { ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type InfoCellProps = {
  icon?: ReactNode;
  title: string;
  value: string;
  variant?: "default" | "muted";
  className?: string;
};

export function InfoCell({ icon, title, value, variant = "default", className }: InfoCellProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-rlds-sm rounded-rlds-sm p-rlds-md",
        variant === "muted" ? "bg-rlds-ui-2" : "bg-rlds-surface",
        className,
      )}
    >
      {icon ? <span className="mt-0.5 text-rlds-fg-tertiary">{icon}</span> : null}
      <div>
        <p className="rlds-meta text-rlds-fg-tertiary">{title}</p>
        <p className="rlds-body-1-em text-rlds-fg">{value}</p>
      </div>
    </div>
  );
}

export type ListCellProps = {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  muted?: boolean;
  className?: string;
};

export function ListCell({ leading, title, subtitle, trailing, muted, className }: ListCellProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-rlds-md rounded-rlds-sm px-rlds-md py-rlds-sm",
        muted ? "bg-rlds-ui-2" : "bg-rlds-surface",
        className,
      )}
    >
      {leading ? <span className="shrink-0">{leading}</span> : null}
      <div className="min-w-0 flex-1">
        <p className="rlds-body-1 truncate text-rlds-fg">{title}</p>
        {subtitle ? <p className="rlds-meta truncate text-rlds-fg-tertiary">{subtitle}</p> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

export type MenuRowProps = {
  icon?: ReactNode;
  label: string;
  trailing?: ReactNode;
  active?: boolean;
  className?: string;
} & ComponentProps<"button">;

export function MenuRow({ icon, label, trailing, active, className, ...props }: MenuRowProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between gap-rlds-sm rounded-rlds-sm px-rlds-md py-rlds-sm text-left rlds-body-1 transition",
        active
          ? "bg-rlds-ui text-rlds-brand"
          : "text-rlds-fg hover:bg-rlds-ui-2 active:bg-rlds-ui",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-rlds-sm">
        {icon ? <span className={cn(active ? "text-rlds-brand" : "text-rlds-fg-tertiary")}>{icon}</span> : null}
        <span className="truncate">{label}</span>
      </span>
      {trailing ?? <ChevronRight className="h-4 w-4 shrink-0 text-rlds-fg-tertiary" strokeWidth={2} />}
    </button>
  );
}

export function MenuSectionHeader({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("relative pt-rlds-lg", className)}>
      <p className="rlds-meta mb-rlds-xs uppercase tracking-wide text-rlds-fg-tertiary">{label}</p>
      <div className="h-px w-full bg-rlds-divider" />
    </div>
  );
}
