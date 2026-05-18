import Link from "next/link";
import { CampaignDetailContent } from "@/components/campaigns/campaign-detail-content";
import { campaignDetailParams, getCampaignDetailData } from "@/lib/data/get-dashboard-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = getCampaignDetailData(campaignDetailParams(id));

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--adpilot-text-muted)]">
            <Link href="/campaigns" className="text-[var(--adpilot-accent)] hover:underline">
              Campaigns
            </Link>
          </p>
          {data.found ? (
            <h2 className="text-lg font-semibold text-[var(--adpilot-text-primary)]">{data.campaign.name}</h2>
          ) : (
            <h2 className="text-lg font-semibold text-[var(--adpilot-text-primary)]">Campaign not found</h2>
          )}
        </div>
      </div>

      <CampaignDetailContent data={data} />
    </div>
  );
}
