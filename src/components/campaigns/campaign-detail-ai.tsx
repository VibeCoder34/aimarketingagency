"use client";

import { useEffect } from "react";
import { useAICompanion } from "@/components/ai-companion/ai-companion-context";
import { AIDiagnosisCard } from "@/components/ai-companion/ai-diagnosis-card";

export function CampaignDetailAI({ campaignName }: { campaignName: string }) {
  const { setCampaignContext } = useAICompanion();

  useEffect(() => {
    setCampaignContext(campaignName);
    return () => setCampaignContext(undefined);
  }, [campaignName, setCampaignContext]);

  return <AIDiagnosisCard campaignName={campaignName} />;
}
