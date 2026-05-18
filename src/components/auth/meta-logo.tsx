import { cn } from "@/lib/utils";

type MetaLogoProps = {
  className?: string;
  variant?: "brand" | "white";
};

/** Meta infinity mark + wordmark (stylistic; not an official asset). */
export function MetaLogo({ className, variant = "brand" }: MetaLogoProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5",
        variant === "white" ? "text-white" : "text-[#0866FF]",
        className,
      )}
      aria-label="Meta"
    >
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden>
        <path
          fill="currentColor"
          d="M18 7.5c-2.4 0-4.3 1.9-5.8 4.4-1.2 2-2.4 4.8-3.5 7.4-.9 2.2-1.8 4.3-2.6 5.8-.8 1.4-1.7 2.4-2.8 2.4-1.2 0-2.1-1.1-2.1-2.6 0-2.2 1.6-5.4 3.5-8.2C7.2 12.4 9.8 6 14.2 6c2.1 0 3.8 1.2 5.2 3.1.6.8 1.1 1.7 1.6 2.6.5-.9 1-1.8 1.6-2.6 1.4-1.9 3.1-3.1 5.2-3.1 4.4 0 7 6.4 8.1 9.3 1.9 2.8 3.5 6 3.5 8.2 0 1.5-.9 2.6-2.1 2.6-1.1 0-2-.9-2.8-2.4-.8-1.5-1.7-3.6-2.6-5.8-1.1-2.6-2.3-5.4-3.5-7.4C22.3 9.4 20.4 7.5 18 7.5Z"
        />
      </svg>
      <span className="text-[22px] font-bold tracking-tight">Meta</span>
    </div>
  );
}
