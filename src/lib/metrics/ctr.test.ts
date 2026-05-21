import { describe, expect, it } from "vitest";
import {
  ctrFromClicksAndImpressions,
  formatCtrPercentagePoints,
  isSuspiciousCtr,
  normalizeMetaCtr,
} from "@/lib/metrics/ctr";

describe("normalizeMetaCtr", () => {
  it('treats Meta ctr "4.3599" as 4.3599 percentage points', () => {
    expect(normalizeMetaCtr("4.3599")).toBeCloseTo(4.3599, 4);
  });

  it("displays Meta ctr as 4.36%", () => {
    const ctr = normalizeMetaCtr("4.3599");
    expect(formatCtrPercentagePoints(ctr, 2)).toBe("4.36%");
  });

  it("calculates ctr from clicks and impressions as percentage points", () => {
    expect(ctrFromClicksAndImpressions(435, 10_000)).toBeCloseTo(4.35, 2);
    expect(formatCtrPercentagePoints(ctrFromClicksAndImpressions(435, 10_000)!, 2)).toBe(
      "4.35%",
    );
  });

  it("flags impossible ctr above 100% as suspicious", () => {
    expect(isSuspiciousCtr(435.99)).toBe(true);
    expect(isSuspiciousCtr(4.36)).toBe(false);
  });

  it("falls back to calculated ctr when Meta value is suspicious", () => {
    const ctr = normalizeMetaCtr("435.99", { clicks: 435, impressions: 10_000 });
    expect(ctr).toBeCloseTo(4.35, 2);
    expect(formatCtrPercentagePoints(ctr, 2)).toBe("4.35%");
  });
});
