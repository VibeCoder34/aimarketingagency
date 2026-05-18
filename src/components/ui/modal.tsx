"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
};

export function Modal({ open, onClose, title, children, className, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "w-full rounded-[var(--adpilot-radius-card)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] shadow-lg",
          wide ? "max-w-2xl" : "max-w-lg",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--adpilot-border)] px-4 py-3">
          <h2 id="modal-title" className="text-sm font-semibold text-[var(--adpilot-text-primary)]">
            {title}
          </h2>
          <Button type="button" variant="ghost" onClick={onClose} className="!p-1.5" aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
