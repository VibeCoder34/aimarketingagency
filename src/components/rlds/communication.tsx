import { cn } from "@/lib/utils";

export type AdminTextProps = {
  title: string;
  time: string;
  className?: string;
};

export function AdminText({ title, time, className }: AdminTextProps) {
  return (
    <div className={cn("text-center", className)}>
      <p className="rlds-body-2-em text-rlds-fg-secondary">{title}</p>
      <p className="rlds-meta text-rlds-fg-tertiary">{time}</p>
    </div>
  );
}

export type ChatBubbleProps = {
  direction: "incoming" | "outgoing";
  message: string;
  name?: string;
  /** Gelen mesajda avatar URL */
  avatarUrl?: string | null;
  reaction?: string;
  className?: string;
};

export function ChatBubble({
  direction,
  message,
  name,
  avatarUrl,
  reaction,
  className,
}: ChatBubbleProps) {
  const incoming = direction === "incoming";

  return (
    <div
      className={cn(
        "flex max-w-[min(100%,28rem)] gap-rlds-sm",
        incoming ? "mr-auto" : "ml-auto flex-row-reverse",
        className,
      )}
    >
      {incoming ? (
        <div className="mt-5 h-6 w-6 shrink-0 overflow-hidden rounded-full bg-rlds-ui">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      ) : null}
      <div className="relative min-w-0">
        {incoming && name ? <p className="mb-0.5 rlds-meta text-rlds-fg-tertiary">{name}</p> : null}
        <div
          className={cn(
            "relative inline-block px-rlds-md py-rlds-sm rlds-body-1",
            incoming
              ? "rounded-[18px] rounded-tl-md bg-rlds-incoming-bubble text-rlds-fg"
              : "rounded-[18px] rounded-br-md bg-rlds-outgoing-bubble text-white",
          )}
        >
          {message}
          {reaction ? (
            <span
              className={cn(
                "absolute -bottom-2 inline-flex items-center rounded-full border border-rlds-border bg-rlds-surface px-1.5 py-0.5 text-sm shadow-sm",
                incoming ? "-right-1" : "-left-1",
              )}
            >
              {reaction}
            </span>
          ) : null}
        </div>
        {!incoming ? (
          <div className="mt-1 flex justify-end -space-x-2 pr-1">
            <span className="h-4 w-4 rounded-full border-2 border-white bg-rlds-ui" />
            <span className="-ml-2 h-4 w-4 rounded-full border-2 border-white bg-rlds-ui" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type ReactionPillProps = {
  emojis: string[];
  count?: number;
  className?: string;
};

export function ReactionPill({ emojis, count, className }: ReactionPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-rlds-border bg-rlds-surface px-rlds-sm py-rlds-3xs rlds-meta text-rlds-fg shadow-sm",
        className,
      )}
    >
      {emojis.join(" ")}
      {count != null ? <span className="pl-0.5 tabular-nums">{count}</span> : null}
    </span>
  );
}
