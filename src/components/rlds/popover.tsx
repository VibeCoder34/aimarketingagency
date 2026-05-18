import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PopoverPanelProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  /** Beveled yüzey (paneller, menüler) */
  material?: "bevel" | "shadow";
};

export function PopoverPanel({ title, children, className, material = "bevel" }: PopoverPanelProps) {
  return (
    <div
      className={cn(
        "min-w-48 overflow-hidden rounded-rlds-md border border-rlds-border bg-rlds-surface p-rlds-md text-rlds-fg",
        material === "shadow" ? "shadow-[var(--shadow-rlds-float)]" : "shadow-[var(--shadow-rlds-bevel)]",
        className,
      )}
    >
      {title ? <p className="rlds-subhead mb-rlds-sm text-rlds-fg-secondary">{title}</p> : null}
      {children}
    </div>
  );
}

export type PopoverMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  leading?: ReactNode;
  destructive?: boolean;
};

export function PopoverMenuItem({ leading, destructive, className, children, ...props }: PopoverMenuItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-rlds-sm rounded-rlds-sm px-rlds-sm py-rlds-xs text-left rlds-body-1 transition hover:bg-rlds-ui-2 active:bg-rlds-ui",
        destructive && "text-rlds-danger hover:bg-red-500/10",
        className,
      )}
      {...props}
    >
      {leading}
      {children}
    </button>
  );
}
