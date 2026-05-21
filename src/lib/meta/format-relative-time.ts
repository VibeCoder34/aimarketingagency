export function formatRelativeTimeAgo(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return "never";
  }

  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) {
    return "unknown";
  }

  const diffMs = Date.now() - then;
  if (diffMs < 0) {
    return "just now";
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export function formatMinutesUntil(futureMs: number): string {
  const minutes = Math.max(1, Math.ceil(futureMs / 60_000));
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}
