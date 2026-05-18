import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[var(--adpilot-accent)] text-white hover:opacity-95",
  secondary:
    "border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] text-[var(--adpilot-text-primary)] hover:bg-[var(--adpilot-nav-active-bg)]",
  ghost: "text-[var(--adpilot-text-primary)] hover:bg-[var(--adpilot-nav-active-bg)]",
  destructive: "border border-red-200 bg-red-50 text-red-800 hover:bg-red-100",
};

export function Button({ className, variant = "secondary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--adpilot-radius-item)] px-3 py-2 text-sm font-medium transition-colors duration-150 disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
