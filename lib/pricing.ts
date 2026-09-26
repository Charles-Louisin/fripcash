/** Mirror BE: displayPrice = round(net * (1 + rate)) */

export const DEFAULT_COMMISSION_STANDARD = 0.08;
export const DEFAULT_COMMISSION_PROXIMITE = 0.05;

export function previewBuyerPrice(
  netPriceGnf: number,
  commissionRate: number
): number {
  if (!Number.isFinite(netPriceGnf) || netPriceGnf <= 0) return 0;
  if (!Number.isFinite(commissionRate) || commissionRate < 0) {
    return Math.round(netPriceGnf);
  }
  return Math.round(netPriceGnf * (1 + commissionRate));
}

/** Preview rate until seller has a dedicated “my rate” endpoint */
export function previewCommissionRate(
  destination?: string | null
): number {
  const d = String(destination || "")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");
  if (d === "PROXIMITE" || d === "PROXIMITÉ") {
    return DEFAULT_COMMISSION_PROXIMITE;
  }
  return DEFAULT_COMMISSION_STANDARD;
}
