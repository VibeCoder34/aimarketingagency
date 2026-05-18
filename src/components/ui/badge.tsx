import { cn } from "@/lib/utils";

export type UiBadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "muted";
  className?: string;
};

const variants: Record<NonNullable<UiBadgeProps["variant"]>, string> = {
  default: "bg-[var(--adpilot-nav-active-bg)] text-[var(--adpilot-text-primary)] border border-[var(--adpilot-border)]",
  success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border border-amber-200",
  danger: "bg-red-50 text-red-800 border border-red-200",
  muted: "bg-[#f5f5f0] text-[var(--adpilot-text-muted)] border border-[var(--adpilot-border)]",
};

export function Badge({ children, variant = "default", className }: UiBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
