/** Display-friendly account_id (strip act_ prefix when present). */
export function formatDisplayAccountId(metaAdAccountId: string): string {
  return metaAdAccountId.startsWith("act_") ? metaAdAccountId.slice(4) : metaAdAccountId;
}
