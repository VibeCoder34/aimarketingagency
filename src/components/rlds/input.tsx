import type { ComponentProps, ReactNode } from "react";
import { Mic, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchInputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: "sm" | "lg";
  onClear?: () => void;
};

/** Arama alanı — ikonlar, temizle, boyut ve durumlar */
export function SearchInput({ className, size = "sm", onClear, value, ...props }: SearchInputProps) {
  const sizes =
    size === "lg"
      ? "min-h-12 px-rlds-md text-base"
      : "min-h-10 px-rlds-sm rlds-body-1";

  return (
    <div
      className={cn(
        "flex w-full items-center gap-rlds-sm rounded-full bg-rlds-ui-2 shadow-inner ring-1 ring-black/5 transition focus-within:ring-2 focus-within:ring-rlds-brand/30 dark:ring-white/10",
        sizes,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-rlds-fg-tertiary" strokeWidth={2} />
      <input
        className={cn(
          "min-w-0 flex-1 bg-transparent text-rlds-fg outline-none placeholder:text-rlds-fg-tertiary",
          className,
        )}
        value={value}
        {...props}
      />
      {onClear && value ? (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-full p-1 text-rlds-fg-tertiary hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Temizle"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      ) : (
        <button
          type="button"
          className="shrink-0 rounded-full p-1 text-rlds-fg-tertiary hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Sesli giriş"
        >
          <Mic className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export type TextFieldProps = Omit<ComponentProps<"input">, "size"> & {
  size?: "sm" | "lg";
  leading?: ReactNode;
};

export function TextField({ className, size = "sm", leading, ...props }: TextFieldProps) {
  const sizes =
    size === "lg"
      ? "min-h-12 px-rlds-md text-base"
      : "min-h-10 px-rlds-sm rlds-body-1";

  return (
    <div
      className={cn(
        "flex w-full items-center gap-rlds-sm rounded-rlds-md bg-rlds-ui-2 shadow-inner ring-1 ring-black/5 transition focus-within:ring-2 focus-within:ring-rlds-brand/30 dark:ring-white/10",
        sizes,
      )}
    >
      {leading}
      <input
        className={cn(
          "min-w-0 flex-1 bg-transparent text-rlds-fg outline-none placeholder:text-rlds-fg-tertiary",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export type ComposerProps = ComponentProps<"input">;

/** Küçük hap arama / kompozer */
export function Composer({ className, ...props }: ComposerProps) {
  return (
    <div className="inline-flex max-w-md items-center gap-rlds-xs rounded-full bg-rlds-ui-2 px-rlds-md py-rlds-2xs shadow-inner ring-1 ring-black/5 dark:ring-white/10">
      <Search className="h-3.5 w-3.5 text-rlds-fg-tertiary" strokeWidth={2} />
      <input
        className={cn(
          "min-w-0 flex-1 bg-transparent rlds-body-2 text-rlds-fg outline-none placeholder:text-rlds-fg-tertiary",
          className,
        )}
        {...props}
      />
    </div>
  );
}
