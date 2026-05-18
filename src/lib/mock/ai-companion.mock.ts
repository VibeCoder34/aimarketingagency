import type {
  AiActionResponse,
  AiGeneratedOutput,
  AiPageContext,
  AiPageKey,
} from "@/types/ai-companion";

export const AI_COMPANION_TITLE = "Agency Copilot";

export const AI_PAGE_CONTEXTS: Record<AiPageKey, AiPageContext> = {
  overview: {
    contextLine: "Viewing Overview · Last 14 days",
    insight: "ROAS is down this week. 3 campaigns need attention.",
    suggestedActions: [
      { id: "ov-explain", label: "Explain weekly performance" },
      { id: "ov-exec", label: "Create executive summary" },
      { id: "ov-client", label: "Generate client update" },
      { id: "ov-risks", label: "Find top risks" },
    ],
  },
  campaigns: {
    contextLine: "Viewing Campaigns · All campaigns",
    insight: "2 campaigns show rising CPA and declining CTR.",
    suggestedActions: [
      { id: "cmp-analyze", label: "Analyze campaigns" },
      { id: "cmp-under", label: "Find underperformers" },
      { id: "cmp-pause", label: "What should I pause?" },
      { id: "cmp-plan", label: "Create optimization plan" },
    ],
  },
  "campaign-detail": {
    contextLine: "Viewing Campaign · Detail",
    insight: "CTR is declining while frequency is rising — creative fatigue likely.",
    suggestedActions: [
      { id: "cd-drop", label: "Explain performance drop" },
      { id: "cd-plan", label: "Create action plan" },
      { id: "cd-client", label: "Generate client explanation" },
      { id: "cd-creative", label: "Suggest creative tests" },
    ],
  },
  "ai-insights": {
    contextLine: "Viewing AI Insights · Command center",
    insight: "3 urgent items and 5 optimization opportunities are ready for action.",
    suggestedActions: [
      { id: "ai-prio", label: "Prioritize recommendations" },
      { id: "ai-report", label: "Add insights to report" },
      { id: "ai-tasks", label: "Create task list" },
      { id: "ai-msg", label: "Write client message" },
    ],
  },
  creatives: {
    contextLine: "Viewing Creatives · Performance library",
    insight: "3 creatives may be fatigued and need new variations.",
    suggestedActions: [
      { id: "cr-fatigue", label: "Find fatigued creatives" },
      { id: "cr-hooks", label: "Generate new hooks" },
      { id: "cr-variations", label: "Create variations from top performer" },
      { id: "cr-ugc", label: "Write UGC brief" },
      { id: "cr-higgs", label: "Create Higgsfield prompt" },
    ],
  },
  reports: {
    contextLine: "Viewing Reports · Weekly reporting",
    insight: "A weekly client report can be generated from current insights.",
    suggestedActions: [
      { id: "rp-weekly", label: "Generate weekly report" },
      { id: "rp-friendly", label: "Make it client-friendly" },
      { id: "rp-recs", label: "Add recommendations section" },
      { id: "rp-exec", label: "Create executive summary" },
    ],
  },
  analytics: {
    contextLine: "Viewing Analytics · Last 30 days",
    insight: "Spend is up 6.4% while blended ROAS dipped slightly — investigate drivers.",
    suggestedActions: [
      { id: "an-trend", label: "Explain trend changes" },
      { id: "an-drivers", label: "Find performance drivers" },
      { id: "an-platform", label: "Compare platforms" },
      { id: "an-audience", label: "Summarize audience insights" },
    ],
  },
  alerts: {
    contextLine: "Viewing Alerts · 12 active",
    insight: "3 urgent alerts need review.",
    suggestedActions: [
      { id: "al-explain", label: "Explain urgent alerts" },
      { id: "al-fix", label: "Create fix plan" },
      { id: "al-notify", label: "Notify client draft" },
      { id: "al-prio", label: "Prioritize issues" },
    ],
  },
  settings: {
    contextLine: "Viewing Settings · Account preferences",
    insight: "Your ROAS threshold and fatigue triggers align with agency best practices.",
    suggestedActions: [
      { id: "st-explain", label: "Explain AI settings" },
      { id: "st-threshold", label: "Recommend default thresholds" },
      { id: "st-integrations", label: "Summarize integrations" },
    ],
  },
};

const OUTPUTS = {
  weeklyReport: {
    id: "out-report-weekly",
    type: "report" as const,
    title: "Weekly Performance Report Draft",
    description: "Client-ready summary of spend, ROAS, key wins, risks, and next actions.",
    status: "Draft" as const,
    preview:
      "Northwind Media · May 6–13\n\nSpend: $164,820 (+6.4%) · Blended ROAS: 3.42x\n\nWins: Summer Sale at 4.5x ROAS. Risks: Cold Traffic below threshold.\n\nNext: Pause underperformers, scale Summer Sale 40%, refresh Brand Awareness creatives.",
  },
  execSummary: {
    id: "out-exec-summary",
    type: "executive_summary" as const,
    title: "Executive Summary",
    description: "One-page leadership overview of account health and priorities.",
    status: "Draft" as const,
    preview:
      "Account health: Stable with 3 attention areas. Revenue opportunity: +$47k from scaling top campaigns. Immediate action: address 3 urgent alerts.",
  },
  clientUpdate: {
    id: "out-client-msg",
    type: "client_message" as const,
    title: "Client Update — Weekly Performance",
    description: "Professional email draft explaining results and planned optimizations.",
    status: "Ready" as const,
    preview:
      "Hi team — This week spend reached $164.8k with 3.42x blended ROAS. Summer Sale continues to outperform. We're pausing Cold Traffic and reallocating budget to retargeting. Full report attached.",
  },
  optimizationPlan: {
    id: "out-opt-plan",
    type: "optimization_plan" as const,
    title: "Campaign Optimization Plan",
    description: "Pause high CPA ad sets, scale stable ROAS campaigns, and test new creatives.",
    status: "Suggested" as const,
    preview:
      "1. Pause Cold Traffic — US 25-45 ($1,200/day savings)\n2. Scale Summer Sale +40% budget\n3. Refresh Brand Awareness Q2 creatives (3 variants)\n4. Expand retargeting window 7→30 days",
  },
  creativeBrief: {
    id: "out-creative-brief",
    type: "creative_brief" as const,
    title: "UGC Creative Brief: New Hook Variations",
    description: "Based on fatigued creatives and top-performing ad angles.",
    status: "Ready" as const,
    preview:
      "Objective: Combat fatigue on Brand Awareness Q2.\nHooks: Social proof, urgency, before/after.\nFormat: 15s UGC vertical + static carousel.\nReference: Summer Sale Hero v3 (4.8x ROAS).",
  },
  diagnosis: {
    id: "out-diagnosis",
    type: "campaign_diagnosis" as const,
    title: "Campaign Diagnosis",
    description: "CTR decline with rising frequency indicates creative fatigue.",
    status: "Suggested" as const,
    preview:
      "CTR dropped 38% in 7 days (2.9% → 1.8%). Frequency at 4.2 and climbing. ROAS still 3.0x but trending down. Recommend 2–3 new creatives before next budget cycle.",
  },
  taskList: {
    id: "out-tasks",
    type: "task_list" as const,
    title: "AI Priority Task List",
    description: "Action items derived from urgent recommendations and alerts.",
    status: "Suggested" as const,
    preview:
      "□ Pause Cold Traffic campaign (urgent)\n□ Scale Summer Sale budget +40%\n□ Brief 3 new Brand Awareness creatives\n□ Review 3 urgent alerts\n□ Send weekly client update",
  },
  higgsfieldPrompt: {
    id: "out-higgs",
    type: "creative_brief" as const,
    title: "Higgsfield Prompt — UGC Summer Sale",
    description: "AI generation prompt for new vertical video concepts.",
    status: "Ready" as const,
    preview:
      "UGC testimonial, woman 28-35, outdoor summer setting, holding product, authentic handheld camera, hook: 'I didn't expect this deal to last' — 9:16, 15 seconds.",
  },
};

export const AI_ACTION_RESPONSES: Record<string, AiActionResponse> = {
  "ov-explain": {
    assistantMessage:
      "This week blended ROAS fell to 3.42x (-0.08x) while spend grew 6.4%. The drop is driven mainly by Cold Traffic and Brand Awareness fatigue. Retargeting and Summer Sale remain strong anchors.",
    output: OUTPUTS.execSummary,
  },
  "ov-exec": { assistantMessage: "I've drafted an executive summary highlighting account health, risks, and revenue upside.", output: OUTPUTS.execSummary },
  "ov-client": { assistantMessage: "Here's a client-ready weekly update you can send or edit.", output: OUTPUTS.clientUpdate },
  "ov-risks": {
    assistantMessage: "Top risks: (1) Cold Traffic below 3.0x ROAS for 14 days, (2) Brand Awareness CTR -38%, (3) Blended ROAS threshold breach.",
    output: OUTPUTS.optimizationPlan,
  },
  "cmp-analyze": {
    assistantMessage:
      "8 campaigns analyzed. 3 exceed ROAS targets, 2 need creative refresh, 1 should be paused. Biggest opportunity: scale Summer Sale; biggest risk: Cold Traffic burn rate.",
    output: OUTPUTS.optimizationPlan,
  },
  "cmp-under": {
    assistantMessage: "Underperformers: Cold Traffic (2.5x ROAS), Video Views Prospecting (2.5x), Engagement Page Likes (ended). Recommend pause or restructure.",
    output: OUTPUTS.diagnosis,
  },
  "cmp-pause": {
    assistantMessage: "Pause Cold Traffic — US 25-45 immediately. Saves ~$8,200/month. Reallocate to Retargeting and Summer Sale for better blended ROAS.",
    output: OUTPUTS.optimizationPlan,
  },
  "cmp-plan": { assistantMessage: "Optimization plan ready with prioritized budget and creative actions.", output: OUTPUTS.optimizationPlan },
  "cd-drop": {
    assistantMessage:
      "Performance drop is likely creative fatigue: CTR down, frequency up, same audience. Primary creative age 34 days.",
    output: OUTPUTS.diagnosis,
  },
  "cd-plan": { assistantMessage: "Action plan: refresh 2 creatives, reduce frequency cap, test UGC variant.", output: OUTPUTS.optimizationPlan },
  "cd-client": { assistantMessage: "Client explanation drafted in plain language without jargon.", output: OUTPUTS.clientUpdate },
  "cd-creative": { assistantMessage: "Suggested tests: UGC hook A/B, carousel vs single image, new CTA.", output: OUTPUTS.creativeBrief },
  "ai-prio": {
    assistantMessage: "Priority order: (1) Pause Cold Traffic, (2) Scale Summer Sale, (3) Refresh Brand Awareness, (4) Expand retargeting audience.",
    output: OUTPUTS.taskList,
  },
  "ai-report": { assistantMessage: "Added 8 recommendations to your weekly report draft.", output: OUTPUTS.weeklyReport },
  "ai-tasks": { assistantMessage: "Task list created from urgent and high-priority items.", output: OUTPUTS.taskList },
  "ai-msg": { assistantMessage: "Client message drafted summarizing wins, risks, and next steps.", output: OUTPUTS.clientUpdate },
  "cr-fatigue": {
    assistantMessage: "3 fatigued creatives: Brand Story Video 60s, Founder Story 30s, Before/After Split (paused).",
    output: OUTPUTS.creativeBrief,
  },
  "cr-hooks": { assistantMessage: "5 new hook angles based on top performers: urgency, social proof, founder story, comparison, scarcity.", output: OUTPUTS.creativeBrief },
  "cr-variations": { assistantMessage: "Variations planned from Summer Sale Hero v3 — same layout, new copy and CTA tests.", output: OUTPUTS.creativeBrief },
  "cr-ugc": { assistantMessage: "UGC brief ready with talent direction, hooks, and shot list.", output: OUTPUTS.creativeBrief },
  "cr-higgs": { assistantMessage: "Higgsfield prompt generated — paste into creative generator.", output: OUTPUTS.higgsfieldPrompt },
  "rp-weekly": { assistantMessage: "Weekly report draft generated with metrics, charts placeholders, and AI narrative.", output: OUTPUTS.weeklyReport },
  "rp-friendly": { assistantMessage: "Report rewritten for client readability — jargon removed, wins highlighted first.", output: OUTPUTS.weeklyReport },
  "rp-recs": { assistantMessage: "Recommendations section added with 8 prioritized actions.", output: OUTPUTS.weeklyReport },
  "rp-exec": { assistantMessage: "Executive summary page added to report package.", output: OUTPUTS.execSummary },
  "an-trend": {
    assistantMessage: "Spend +6.4% and revenue +11.2% — growth with slight ROAS compression. Instagram CPM higher than Facebook.",
    output: OUTPUTS.execSummary,
  },
  "an-drivers": {
    assistantMessage: "Drivers: Summer Sale (+revenue), Cold Traffic (-ROAS), awareness spend 38% of budget with soft attribution.",
    output: OUTPUTS.optimizationPlan,
  },
  "an-platform": {
    assistantMessage: "Facebook: 3.48x ROAS, lower CPM. Instagram: 3.32x ROAS, higher CPM but strong engagement on retargeting.",
    output: OUTPUTS.execSummary,
  },
  "an-audience": {
    assistantMessage: "Retargeting audiences best ROAS (4.2x). Broad targeting volume-high but efficiency lowest at 2.85x.",
    output: OUTPUTS.execSummary,
  },
  "al-explain": {
    assistantMessage: "3 urgent alerts: budget exhaustion risk, blended ROAS threshold, creative fatigue frequency 6.2.",
    output: OUTPUTS.diagnosis,
  },
  "al-fix": { assistantMessage: "Fix plan: pause Cold Traffic, refresh fatigued video, adjust Summer Sale pacing cap.", output: OUTPUTS.optimizationPlan },
  "al-notify": { assistantMessage: "Client notification draft prepared for urgent items.", output: OUTPUTS.clientUpdate },
  "al-prio": { assistantMessage: "Issues prioritized by revenue impact and time sensitivity.", output: OUTPUTS.taskList },
  "st-explain": {
    assistantMessage: "ROAS threshold 3.0x triggers pause recommendations. Fatigue at frequency 4.0. Re-analyze every 24h.",
  },
  "st-threshold": {
    assistantMessage: "Recommended: ROAS 3.0x, frequency 4.0, CTR decline -30%, pacing alert +15%.",
  },
  "st-integrations": {
    assistantMessage: "Higgsfield connected for creatives. Connect Slack for alert routing and Drive for report auto-save.",
  },
};

export const AI_COMMAND_CENTER_SECTIONS = [
  {
    id: "summary",
    title: "Today's AI Summary",
    body: "I found 3 urgent issues, 5 optimization opportunities, and 2 creative fatigue risks across this account.",
    variant: "default" as const,
  },
  {
    id: "urgent",
    title: "Urgent Issues",
    body: "Campaign CPA increased 28% while conversion volume stayed flat.",
    variant: "danger" as const,
  },
  {
    id: "optimization",
    title: "Optimization Opportunities",
    body: "Two campaigns are above target ROAS and may be ready for careful budget scaling.",
    variant: "success" as const,
  },
  {
    id: "creative",
    title: "Creative Opportunities",
    body: "Three fatigued creatives need new variations based on top-performing hooks.",
    variant: "warning" as const,
  },
  {
    id: "reports",
    title: "Reports Ready",
    body: "Weekly performance report can be generated using current recommendations.",
    variant: "default" as const,
  },
];

export const AI_CAMPAIGN_DIAGNOSIS = {
  summary: "CTR is declining while frequency is increasing. Creative fatigue may be affecting performance.",
  details: [
    "CTR down 38% over 7 days on primary creative",
    "Frequency reached 4.2 (threshold: 4.0)",
    "ROAS stable but at risk if trend continues",
  ],
};

export function getGenericChatResponse(pageKey: AiPageKey, userText: string): AiActionResponse {
  const lower = userText.toLowerCase();
  if (lower.includes("report")) return AI_ACTION_RESPONSES["rp-weekly"] ?? { assistantMessage: "I can help generate a report draft." };
  if (lower.includes("pause") || lower.includes("underperform"))
    return AI_ACTION_RESPONSES["cmp-pause"] ?? { assistantMessage: "Review underperforming campaigns in AI Insights." };
  if (lower.includes("creative") || lower.includes("fatigue"))
    return AI_ACTION_RESPONSES["cr-fatigue"] ?? { assistantMessage: "Check Creatives for fatigue signals." };
  const ctx = AI_PAGE_CONTEXTS[pageKey];
  return {
    assistantMessage: `Based on ${ctx.contextLine}: ${ctx.insight} Try a suggested action below for a detailed output.`,
  };
}

export function resolvePageKey(pathname: string): AiPageKey {
  if (/^\/campaigns\/[^/]+$/.test(pathname)) return "campaign-detail";
  const map: Record<string, AiPageKey> = {
    "/": "overview",
    "/campaigns": "campaigns",
    "/ai-insights": "ai-insights",
    "/creatives": "creatives",
    "/reports": "reports",
    "/analytics": "analytics",
    "/alerts": "alerts",
    "/settings": "settings",
  };
  return map[pathname] ?? "overview";
}

export function getContextLine(pageKey: AiPageKey, campaignName?: string): string {
  if (pageKey === "campaign-detail" && campaignName) {
    return `Viewing Campaign · ${campaignName}`;
  }
  return AI_PAGE_CONTEXTS[pageKey].contextLine;
}
