"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import type { OverviewData } from "@/lib/data/types";
import type { ConnectedMetaAdAccountRow } from "@/lib/meta/queries";
import { overviewFadeUp, overviewStagger } from "@/lib/overview/motion";
import { OverviewContextBar } from "@/components/overview/overview-context-bar";
import { AccountHealthCard } from "@/components/overview/account-health-card";
import { KpiCard } from "@/components/overview/kpi-card";
import { SpendEfficiencyChart } from "@/components/overview/spend-efficiency-chart";
import { WhatChangedCard } from "@/components/overview/what-changed-card";
import { CampaignSignalsCard } from "@/components/overview/campaign-signals-card";
import { LiveCampaignSignalsSection } from "@/components/overview/live-campaign-signals-section";
import { RecommendedActionsCard } from "@/components/overview/recommended-actions-card";
import { BudgetPacingCard } from "@/components/overview/budget-pacing-card";
import { PlatformBreakdownCard } from "@/components/overview/platform-breakdown-card";
import { DataCoverageCard } from "@/components/overview/data-coverage-card";
import { RecentAlertsCard } from "@/components/overview/recent-alerts-card";
import { AiQuickActionsCard } from "@/components/overview/ai-quick-actions-card";
import { OverviewSectionUnavailable } from "@/components/overview/overview-section-unavailable";
import { OverviewStatusBanner } from "@/components/overview/overview-status-banner";
import { ConversionCoverageBanner } from "@/components/overview/conversion-coverage-banner";
import { FunnelHealthCard } from "@/components/overview/funnel-health-card";
import type { OverviewKpi } from "@/lib/data/types";

function MotionSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={overviewFadeUp} className={className}>
      {children}
    </motion.div>
  );
}

function KpiGrid({
  kpis,
  title,
  subtitle,
}: {
  kpis: OverviewKpi[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-3">
      {title ? (
        <KpiSectionHeader title={title} subtitle={subtitle} />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}

function KpiSectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-tight text-zinc-900">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p> : null}
    </div>
  );
}

export type OverviewDashboardProps = {
  data: OverviewData;
  metaAccounts?: ConnectedMetaAdAccountRow[];
  showMetaAccountPicker?: boolean;
};

export function OverviewDashboard({
  data,
  metaAccounts = [],
  showMetaAccountPicker = false,
}: OverviewDashboardProps) {
  const isLiveMeta = data.source === "meta" && data.displayMode !== "demo";
  const showMainSections =
    data.displayMode === "full" ||
    data.displayMode === "demo" ||
    data.displayMode === "no_snapshot";
  const hasKpis = data.kpis.length > 0;
  const primaryKpis = data.kpis.filter((k) => k.tier !== "secondary");
  const secondaryKpis = data.kpis.filter((k) => k.tier === "secondary");
  const kpiSections = {
    primary: primaryKpis.length > 0 ? primaryKpis : data.kpis.slice(0, 4),
    secondary: secondaryKpis.length > 0 ? secondaryKpis : [],
  };
  const hasFunnel = data.performance?.funnelMetrics != null;
  const hasSpendChart = data.dailyInsights.length > 0;
  const hasCampaigns = data.campaigns.length > 0;
  const hasLiveCampaignSignals = data.campaignSignals?.available === true;
  const showCampaignSignalsSection =
    hasLiveCampaignSignals || hasCampaigns || data.source === "meta";
  const hasRecommendations = data.recommendations.length > 0;
  const hasBudgetPacing = data.budgetPacing != null;
  const hasPlatforms = data.platformBreakdown.length > 0;

  return (
    <div className="min-h-full bg-[#f5f5f0]">
      <motion.div
        className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6"
        variants={overviewStagger}
        initial="hidden"
        animate="visible"
      >
        <MotionSection>
          <Suspense fallback={null}>
            <OverviewContextBar
              context={data.context}
              metaAccounts={metaAccounts}
              showAccountPicker={showMetaAccountPicker}
            />
          </Suspense>
        </MotionSection>

        <MotionSection>
          <OverviewStatusBanner
            displayMode={data.displayMode}
            title={data.context.bannerTitle}
            message={data.context.bannerMessage}
          />
        </MotionSection>

        {showMainSections || hasKpis ? (
          <MotionSection>
            <AccountHealthCard health={data.health} />
          </MotionSection>
        ) : null}

        {(data.performance || hasKpis) && showMainSections ? (
          <MotionSection>
            <ConversionCoverageBanner performance={data.performance} />
          </MotionSection>
        ) : null}

        {hasKpis ? (
          <>
            <MotionSection>
              <KpiGrid kpis={kpiSections.primary} title="Performance" />
            </MotionSection>
            {kpiSections.secondary.length > 0 ? (
              <MotionSection>
                <KpiGrid
                  kpis={kpiSections.secondary}
                  title="Efficiency"
                  subtitle="Traffic metrics"
                />
              </MotionSection>
            ) : null}
          </>
        ) : null}

        {hasFunnel && data.performance?.funnelMetrics ? (
          <MotionSection>
            <FunnelHealthCard funnel={data.performance.funnelMetrics} />
          </MotionSection>
        ) : null}

        {showMainSections ? (
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <MotionSection>
                {hasSpendChart ? (
                  <SpendEfficiencyChart data={data.dailyInsights} caption={data.spendChartCaption} />
                ) : (
                  <OverviewSectionUnavailable
                    title="Spend & efficiency trend"
                    subtitle="Daily time series"
                    message={
                      data.sectionMessages?.spendChart ??
                      data.spendChartCaption ??
                      "Not available yet for live Meta data."
                    }
                  />
                )}
              </MotionSection>

              <MotionSection>
                <WhatChangedCard rows={data.whatChanged} />
              </MotionSection>

              <MotionSection>
                {hasLiveCampaignSignals && data.campaignSignals ? (
                  <LiveCampaignSignalsSection signals={data.campaignSignals} />
                ) : hasCampaigns ? (
                  <CampaignSignalsCard campaigns={data.campaigns} />
                ) : showCampaignSignalsSection ? (
                  <LiveCampaignSignalsSection
                    signals={
                      data.campaignSignals ?? {
                        available: false,
                        resultMode: "traffic",
                        purchaseRoasAvailable: false,
                        campaigns: [],
                        topSpending: [],
                        bestLeads: [],
                        highSpendNoResults: [],
                        lowCtr: [],
                        highFrequency: [],
                        emptyMessage:
                          data.sectionMessages?.campaigns ??
                          "No campaign insights in cache. Run reporting sync with campaign_insights.",
                      }
                    }
                  />
                ) : (
                  <OverviewSectionUnavailable
                    title="Campaign signals"
                    subtitle="Signals are advisory"
                    message={
                      data.sectionMessages?.campaigns ??
                      "Campaign-level live data is coming next."
                    }
                  />
                )}
              </MotionSection>

              <MotionSection>
                {hasRecommendations ? (
                  <RecommendedActionsCard actions={data.recommendations} />
                ) : (
                  <OverviewSectionUnavailable
                    title="Recommended actions"
                    message={
                      data.sectionMessages?.recommendations ??
                      "Recommendations require campaign sync — not available yet."
                    }
                  />
                )}
              </MotionSection>
            </div>

            <div className="space-y-6 xl:col-span-4">
              <MotionSection>
                {hasBudgetPacing && data.budgetPacing ? (
                  <BudgetPacingCard pacing={data.budgetPacing} />
                ) : (
                  <OverviewSectionUnavailable
                    title="Budget pacing"
                    subtitle="Monthly cap"
                    message={
                      data.sectionMessages?.budgetPacing ??
                      "Not available yet without a known account budget."
                    }
                  />
                )}
              </MotionSection>
              <MotionSection>
                {hasPlatforms ? (
                  <PlatformBreakdownCard
                    platforms={data.platformBreakdown}
                    insight={data.platformInsight}
                  />
                ) : (
                  <OverviewSectionUnavailable
                    title="Platform breakdown"
                    subtitle="Spend share"
                    message={data.platformInsight || "Platform breakdown is not synced yet."}
                  />
                )}
              </MotionSection>
              <MotionSection>
                <DataCoverageCard items={data.dataCoverage} />
              </MotionSection>
              <MotionSection>
                {data.alerts.length > 0 ? (
                  <RecentAlertsCard alerts={data.alerts} />
                ) : (
                  <OverviewSectionUnavailable
                    title="Recent alerts"
                    message={isLiveMeta ? "No alerts for this account yet." : "No alerts in demo data."}
                  />
                )}
              </MotionSection>
              <MotionSection>
                {data.aiQuickActions.length > 0 ? (
                  <AiQuickActionsCard actions={data.aiQuickActions} />
                ) : null}
              </MotionSection>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
