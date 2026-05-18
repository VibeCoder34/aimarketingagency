/**
 * Scenario fixture for curated recommendations.
 * Import only from @/lib/data/recommendation-engine — not from pages.
 */
import type { AiRecommendation } from "@/types";

export const MOCK_AI_SUMMARY = {
  active: 12,
  savings: 31_400,
  uplift: 47_200,
  urgent: 3,
  lastAnalyzed: "2 hours ago",
};

export const MOCK_AI_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: "ai-1",
    priority: "urgent",
    category: "budget",
    categoryLabel: "Budget Optimization",
    title: 'Pause "Cold Traffic — US 25-45"',
    explanation:
      "This campaign has maintained a ROAS of 2.50x for 14 consecutive days, well below your account threshold of 3.0x. Despite 3 creative refreshes in the past 30 days, performance has not recovered. Continuing to run this campaign burns $1,200/day with negative ROI relative to your other campaigns.",
    dataPoints: ["ROAS 2.50x", "Spend $29,400 MTD", "14 days below threshold"],
    impact: "Save ~$8,200/month, reallocate to top performers",
  },
  {
    id: "ai-2",
    priority: "urgent",
    category: "scaling",
    categoryLabel: "Scaling Opportunity",
    title: 'Scale "Summer Sale 2026" budget',
    explanation:
      "Your top campaign is delivering 4.50x ROAS with consistent performance over 21 days. Budget utilization is at 78% daily average, indicating headroom to scale. Increasing daily budget by 40% ($720/day) is projected to generate an additional $12,000 in monthly revenue without significant ROAS degradation based on audience size.",
    dataPoints: ["ROAS 4.50x", "21-day streak", "Audience utilization 62%"],
    impact: "+$12,000 est. monthly revenue",
  },
  {
    id: "ai-3",
    priority: "high",
    category: "creative",
    categoryLabel: "Creative Fatigue",
    title: 'Refresh creative on "Brand Awareness Q2"',
    explanation:
      "The primary creative in this campaign has been running for 34 days. CTR has dropped from 2.9% to 1.8% over the past 7 days — a 38% decline — which is a strong signal of audience fatigue. Introducing 2-3 new creative variants is recommended before ROAS begins to decline.",
    dataPoints: ["CTR -38% in 7 days", "Creative age: 34 days", "Frequency: 4.2"],
    impact: "Prevent estimated -0.8x ROAS decline",
  },
  {
    id: "ai-4",
    priority: "high",
    category: "audience",
    categoryLabel: "Audience Optimization",
    title: 'Expand "Retargeting — Cart Abandoners" audience',
    explanation:
      "This campaign's audience is 91% saturated — you're reaching the same people repeatedly. Broadening the retargeting window from 7 days to 30 days and adding \"viewed product\" events will expand the pool by an estimated 40,000 users while maintaining purchase intent signals.",
    dataPoints: ["Audience saturation 91%", "Frequency 6.8", "ROAS 4.00x"],
    impact: "+40,000 audience reach, maintain 3.8x+ ROAS",
  },
  {
    id: "ai-5",
    priority: "high",
    category: "creative",
    categoryLabel: "Creative Strategy",
    title: "Test UGC video creative on top campaigns",
    explanation:
      "Across your account, image-based ads are outperforming video by 2.1x on CTR but video ads show 34% higher conversion rates when users do click. User-generated content (UGC) style video combines both strengths. We recommend testing 2 UGC videos on \"Summer Sale 2026\" and \"Lookalike — Top Customers\".",
    dataPoints: ["Image CTR avg 2.8%", "Video conversion rate +34%", "Account benchmark"],
    impact: "Est. +0.4x ROAS on tested campaigns",
  },
  {
    id: "ai-6",
    priority: "medium",
    category: "budget",
    categoryLabel: "Budget Optimization",
    title: "Reallocate budget from Awareness to Conversion campaigns",
    explanation:
      "Awareness campaigns currently consume 38% of total budget but contribute 0% to direct revenue attribution. With your current ROAS targets, shifting 20% of awareness spend to \"Retargeting — Cart Abandoners\" and \"Lookalike — Top Customers\" is projected to improve blended ROAS from 3.42x to 3.80x.",
    dataPoints: ["Awareness spend: $42,400 (38% of total)", "Blended ROAS 3.42x"],
    impact: "Blended ROAS +0.38x, +$18,200 attributed revenue",
  },
  {
    id: "ai-7",
    priority: "medium",
    category: "structure",
    categoryLabel: "Campaign Structure",
    title: 'Enable Campaign Budget Optimization on "Lookalike"',
    explanation:
      "\"Lookalike — Top Customers\" currently uses ad set level budgeting across 4 ad sets. Switching to CBO will allow Meta's algorithm to dynamically allocate budget to the best-performing ad sets in real time. Based on current ad set performance variance, CBO is estimated to improve efficiency by 12-18%.",
    dataPoints: ["4 ad sets", "Budget variance between ad sets: 340%", "Current ROAS 3.60x"],
    impact: "+12-18% budget efficiency",
  },
  {
    id: "ai-8",
    priority: "low",
    category: "audience",
    categoryLabel: "Audience Expansion",
    title: "Add Spanish-language creative variants",
    explanation:
      "18% of your converting audience has Spanish as their primary language based on Meta demographic data, but 0% of your current creatives are in Spanish. Creating Spanish-language variants of your top 2 creatives could unlock a high-intent audience segment currently underserved.",
    dataPoints: ["Spanish-speaking converters: 18%", "Spanish creatives: 0"],
    impact: "Est. +8-12% reach expansion on existing audiences",
  },
];
