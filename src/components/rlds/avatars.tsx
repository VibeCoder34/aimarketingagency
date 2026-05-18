import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-base",
  "2xl": "h-24 w-24 text-lg",
} as const;

export type AvatarSize = keyof typeof sizeMap;

export type AvatarStatus = "online" | "none";

export type AvatarProps = {
  src?: string | null;
  alt: string;
  fallback?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  bordered?: boolean;
  className?: string;
};

export function Avatar({ src, alt, fallback, size = "md", status = "none", bordered, className }: AvatarProps) {
  const initials = fallback ?? alt.slice(0, 2).toUpperCase();

  return (
    <span className={cn("relative inline-flex", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-full bg-rlds-ui text-rlds-fg-secondary ring-offset-2 ring-offset-rlds-surface",
          sizeMap[size],
          bordered && "ring-2 ring-rlds-inverse",
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </span>
      {status === "online" ? (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-rlds-surface bg-emerald-500" />
      ) : null}
    </span>
  );
}

export type FacepileProps = {
  people: { src?: string | null; alt: string }[];
  extraCount?: number;
  size?: AvatarSize;
  className?: string;
};

export function Facepile({ people, extraCount, size = "sm", className }: FacepileProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {people.slice(0, 4).map((p, i) => (
          <Avatar key={`${p.alt}-${i}`} src={p.src} alt={p.alt} size={size} bordered className="ring-2 ring-rlds-surface" />
        ))}
      </div>
      {extraCount != null ? (
        <span className="pl-rlds-sm rlds-meta font-medium text-rlds-fg-secondary">+{extraCount}</span>
      ) : null}
    </div>
  );
}

export type PeopleCardProps = {
  name: string;
  role: string;
  meta?: string;
  avatarSrc?: string | null;
  className?: string;
};

export function PeopleCard({ name, role, meta, avatarSrc, className }: PeopleCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-rlds-lg bg-rlds-surface p-rlds-lg text-center shadow-[var(--shadow-rlds-bevel)] ring-1 ring-black/5 dark:ring-white/10",
        className,
      )}
    >
      <Avatar src={avatarSrc} alt={name} size="xl" status="online" />
      <p className="mt-rlds-md rlds-body-1-em text-rlds-fg">{name}</p>
      <p className="rlds-body-2 text-rlds-fg-secondary">{role}</p>
      {meta ? <p className="rlds-meta text-rlds-fg-tertiary">{meta}</p> : null}
    </div>
  );
}
