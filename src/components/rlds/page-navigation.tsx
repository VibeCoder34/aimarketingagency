import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionMenu?: boolean;
  className?: string;
};

/** Sayfa bölüm başlığı — sol ikon + başlık / alt başlık, sağ aksiyon */
export function SectionHeader({
  icon,
  title,
  subtitle,
  actionLabel,
  actionMenu,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-rlds-md", className)}>
      <div className="flex min-w-0 items-center gap-rlds-sm">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-rlds-sm bg-rlds-ui-2 text-rlds-fg-secondary">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="rlds-body-1-em truncate text-rlds-fg">{title}</p>
          {subtitle ? <p className="rlds-meta truncate text-rlds-fg-tertiary">{subtitle}</p> : null}
        </div>
      </div>
      {actionLabel || actionMenu ? (
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-rlds-sm py-rlds-2xs rlds-body-2 text-rlds-fg-secondary transition hover:bg-rlds-ui-2"
        >
          {actionLabel}
          {actionMenu ? <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} /> : null}
        </button>
      ) : null}
    </div>
  );
}

export type TabBarProps<T extends string = string> = {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Yatay metin sekmeleri — aktif hap */
export function TabBar<T extends string>({ tabs, value, onChange, className }: TabBarProps<T>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-rlds-sm", className)} role="tablist">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "rounded-full px-rlds-md py-rlds-2xs rlds-body-2 transition",
              active
                ? "bg-rlds-inverse text-rlds-fg-on-inverse"
                : "text-rlds-fg-secondary hover:text-rlds-fg",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
