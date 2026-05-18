import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

export type SegmentedControlProps<T extends string = string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Yatay segment kontrol — aktif segment koyu hap */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex rounded-full bg-rlds-ui p-1 shadow-inner ring-1 ring-black/5 dark:ring-white/10",
        className,
      )}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-rlds-2xs rounded-full px-rlds-md py-rlds-2xs rlds-body-2 transition",
              selected
                ? "bg-rlds-inverse text-rlds-fg-on-inverse shadow-sm"
                : "text-rlds-fg-secondary hover:bg-black/[0.04] active:bg-black/[0.07] dark:hover:bg-white/10 dark:active:bg-white/15",
            )}
          >
            {opt.icon ? <span className="flex h-4 w-4 items-center justify-center">{opt.icon}</span> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export type ChipSelectorProps = {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

/** Dikey / küçük hap chip seçiciler */
export function ChipSelector({ children, selected, onClick, className }: ChipSelectorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-full border border-rlds-border px-rlds-md py-rlds-xs text-left rlds-body-2 transition",
        selected
          ? "border-transparent bg-rlds-inverse text-rlds-fg-on-inverse"
          : "bg-rlds-surface text-rlds-fg hover:bg-rlds-ui-2 active:bg-rlds-ui",
        className,
      )}
    >
      {children}
    </button>
  );
}
