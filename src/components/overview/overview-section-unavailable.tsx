import { OverviewCard } from "@/components/overview/overview-shell";

export function OverviewSectionUnavailable({
  title,
  subtitle,
  message,
}: {
  title: string;
  subtitle?: string;
  message: string;
}) {
  return (
    <OverviewCard title={title} subtitle={subtitle}>
      <p className="py-8 text-center text-sm text-zinc-500">{message}</p>
    </OverviewCard>
  );
}
