import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export type SideNavItemProps = {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

const itemBase =
  "flex w-full items-center gap-rlds-sm rounded-full px-rlds-md py-rlds-xs text-left rlds-body-1 transition";

export function SideNavItem({ icon, label, active, onClick, className }: SideNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        itemBase,
        active
          ? "bg-rlds-inverse text-rlds-fg-on-inverse"
          : "text-rlds-fg hover:bg-rlds-ui-2 active:bg-rlds-ui",
        className,
      )}
    >
      {icon ? <span className="flex h-5 w-5 items-center justify-center opacity-80">{icon}</span> : null}
      <span className="truncate">{label}</span>
    </button>
  );
}

export type SideNavHeaderProps = {
  label: string;
  open?: boolean;
  onToggle?: () => void;
  tone?: "default" | "muted" | "strong";
  className?: string;
};

export function SideNavHeader({ label, open, onToggle, tone = "default", className }: SideNavHeaderProps) {
  const tones = {
    default: "bg-rlds-surface",
    muted: "bg-rlds-ui-2",
    strong: "bg-rlds-ui",
  } as const;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between rounded-rlds-md px-rlds-md py-rlds-sm rlds-body-1-em text-rlds-fg ring-1 ring-black/5 dark:ring-white/10",
        tones[tone],
        className,
      )}
    >
      {label}
      {open ? <ChevronUp className="h-4 w-4" strokeWidth={2} /> : <ChevronDown className="h-4 w-4" strokeWidth={2} />}
    </button>
  );
}

export type SideNavProps = {
  header?: ReactNode;
  children: ReactNode;
  footerAvatar?: ReactNode;
  className?: string;
};

/** Dikey yan menü — üst başlık, liste, altta çıkış + avatar */
export function SideNav({ header, children, footerAvatar, className }: SideNavProps) {
  return (
    <nav
      className={cn(
        "flex h-full min-h-[280px] w-64 flex-col gap-rlds-sm rounded-rlds-lg bg-rlds-surface p-rlds-md shadow-[var(--shadow-rlds-bevel)] ring-1 ring-black/5 dark:ring-white/10",
        className,
      )}
    >
      {header}
      <div className="flex flex-1 flex-col gap-rlds-2xs overflow-y-auto">{children}</div>
      <div className="mt-auto flex items-center justify-between border-t border-rlds-divider pt-rlds-md">
        <button
          type="button"
          className="rounded-full p-2 text-rlds-fg-secondary transition hover:bg-rlds-ui-2"
          aria-label="Çıkış"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <div className="h-9 w-9 overflow-hidden rounded-full bg-rlds-ui ring-2 ring-rlds-surface">
          {footerAvatar}
        </div>
      </div>
    </nav>
  );
}
