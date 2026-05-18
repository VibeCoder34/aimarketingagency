"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { Recommendation, RecommendationPriority } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { OverviewCard } from "@/components/overview/overview-shell";
import { overviewCardHover } from "@/lib/overview/motion";

const PRIORITY_LABELS: Record<RecommendationPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_VARIANTS: Record<RecommendationPriority, "danger" | "warning" | "default" | "muted"> = {
  urgent: "danger",
  high: "warning",
  medium: "default",
  low: "muted",
};

export function RecommendedActionsCard({ actions }: { actions: Recommendation[] }) {
  return (
    <OverviewCard
      title="Recommended actions"
      subtitle="Manual next steps — AdPilot does not change ads"
      action={
        <Link href="/ai-insights" className="text-xs font-medium text-[#1877f2] hover:underline">
          View all recommendations →
        </Link>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        {actions.map((action) => (
          <motion.article
            key={action.id}
            variants={overviewCardHover}
            initial="rest"
            whileHover="hover"
            className="flex flex-col rounded-xl border border-zinc-200/90 bg-zinc-50/40 p-4"
          >
            <Badge variant={PRIORITY_VARIANTS[action.priority]} className="w-fit">
              {PRIORITY_LABELS[action.priority]}
            </Badge>
            <h3 className="mt-2 text-sm font-semibold leading-snug text-zinc-900">{action.title}</h3>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-600">{action.whyItMatters}</p>
            <p className="mt-3 text-xs font-medium text-zinc-800">{action.estimatedImpact}</p>
            <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-[11px] leading-relaxed text-zinc-600">
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-zinc-400" aria-hidden />
              {action.manualActionNote}
            </p>
          </motion.article>
        ))}
      </div>
    </OverviewCard>
  );
}
