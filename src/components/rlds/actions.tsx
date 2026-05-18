import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "media" | "positive" | "negative";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Sadece ikon */
  iconOnly?: boolean;
  leading?: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-rlds-inverse text-rlds-fg-on-inverse hover:brightness-110 active:brightness-95",
  secondary: "bg-rlds-ui text-rlds-fg hover:bg-rlds-border active:bg-rlds-ui-2",
  tertiary: "bg-transparent text-rlds-fg hover:bg-black/[0.04] active:bg-black/[0.08] dark:hover:bg-white/10 dark:active:bg-white/15",
  media: "bg-zinc-700 text-white hover:bg-zinc-600 active:bg-zinc-800",
  positive: "bg-rlds-success text-white hover:brightness-105 active:brightness-95",
  negative: "bg-rlds-danger text-white hover:brightness-105 active:brightness-95",
};

export function Button({ className, variant = "primary", iconOnly, leading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-rlds-xs rounded-full px-rlds-lg py-rlds-sm rlds-body-1 font-medium transition disabled:pointer-events-none disabled:opacity-45",
        iconOnly ? "aspect-square px-0" : "",
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {leading}
      {children}
    </button>
  );
}

export type ModularButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  title: string;
  description?: string;
  leading?: ReactNode;
};

export function ModularButton({
  variant = "primary",
  title,
  description,
  leading,
  className,
  ...props
}: ModularButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-rlds-md rounded-full px-rlds-lg py-rlds-md text-left transition disabled:opacity-45",
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {leading ? <span className="shrink-0 opacity-90">{leading}</span> : null}
      <span className="min-w-0">
        <span className="block rlds-body-1-em">{title}</span>
        {description ? (
          <span
            className={cn(
              "block rlds-body-2",
              variant === "secondary" || variant === "tertiary"
                ? "text-rlds-fg-secondary"
                : "text-white/80",
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export type QuickReplyProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function QuickReply({ selected, className, children, ...props }: QuickReplyProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full px-rlds-md py-rlds-2xs rlds-body-2 transition",
        selected
          ? "bg-rlds-inverse text-rlds-fg-on-inverse"
          : "bg-rlds-ui-2 text-rlds-fg hover:bg-rlds-ui active:bg-rlds-border",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export type SelectionDropdownProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  leading?: ReactNode;
  size?: "sm" | "lg";
  open?: boolean;
};

export function SelectionDropdown({
  leading,
  size = "sm",
  className,
  children,
  ...props
}: SelectionDropdownProps) {
  const pad = size === "lg" ? "py-rlds-md rlds-body-1" : "py-rlds-sm rlds-body-2";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-w-[10rem] items-center justify-between gap-rlds-sm rounded-full bg-rlds-ui-2 px-rlds-md text-rlds-fg shadow-inner ring-1 ring-black/5 transition hover:bg-rlds-ui active:bg-rlds-border dark:ring-white/10",
        pad,
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-rlds-sm">
        {leading}
        <span className="truncate">{children}</span>
      </span>
      <span aria-hidden className="text-rlds-fg-tertiary">
        ▾
      </span>
    </button>
  );
}
