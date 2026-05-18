"use client";

import { motion } from "framer-motion";
import type { OverviewData } from "@/lib/data/types";
import { overviewFadeUp, overviewStagger } from "@/lib/overview/motion";
import { OverviewContextBar } from "@/components/overview/overview-context-bar";
import { AccountHealthCard } from "@/components/overview/account-health-card";
import { KpiCard } from "@/components/overview/kpi-card";
import { SpendEfficiencyChart } from "@/components/overview/spend-efficiency-chart";
import { WhatChangedCard } from "@/components/overview/what-changed-card";
import { CampaignSignalsCard } from "@/components/overview/campaign-signals-card";
import { RecommendedActionsCard } from "@/components/overview/recommended-actions-card";
import { BudgetPacingCard } from "@/components/overview/budget-pacing-card";
import { PlatformBreakdownCard } from "@/components/overview/platform-breakdown-card";
import { DataCoverageCard } from "@/components/overview/data-coverage-card";
import { RecentAlertsCard } from "@/components/overview/recent-alerts-card";
import { AiQuickActionsCard } from "@/components/overview/ai-quick-actions-card";

function MotionSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={overviewFadeUp} className={className}>
      {children}
    </motion.div>
  );
}

export type OverviewDashboardProps = {
  data: OverviewData;
};

export function OverviewDashboard({ data }: OverviewDashboardProps) {
  return (
    <div className="min-h-full bg-[#f5f5f0]">
      <motion.div
        className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6"
        variants={overviewStagger}
        initial="hidden"
        animate="visible"
      >
        <MotionSection>
          <OverviewContextBar context={data.context} />
        </MotionSection>

        <MotionSection>
          <AccountHealthCard health={data.health} />
        </MotionSection>

        <MotionSection>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </MotionSection>

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <MotionSection>
              <SpendEfficiencyChart data={data.dailyInsights} caption={data.spendChartCaption} />
            </MotionSection>

            <MotionSection>
              <WhatChangedCard rows={data.whatChanged} />
            </MotionSection>

            <MotionSection>
              <CampaignSignalsCard campaigns={data.campaigns} />
            </MotionSection>

            <MotionSection>
              <RecommendedActionsCard actions={data.recommendations} />
            </MotionSection>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <MotionSection>
              <BudgetPacingCard pacing={data.budgetPacing} />
            </MotionSection>
            <MotionSection>
              <PlatformBreakdownCard platforms={data.platformBreakdown} insight={data.platformInsight} />
            </MotionSection>
            <MotionSection>
              <DataCoverageCard items={data.dataCoverage} />
            </MotionSection>
            <MotionSection>
              <RecentAlertsCard alerts={data.alerts} />
            </MotionSection>
            <MotionSection>
              <AiQuickActionsCard actions={data.aiQuickActions} />
            </MotionSection>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
