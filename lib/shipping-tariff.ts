export type ShippingTariff = {
  fromZoneId: string;
  toZoneId: string;
  amountGnf: number;
};

function idsEqual(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  return String(a) === String(b);
}

/** Admin matrix: origin → destination. Falls back if the listing has no zone. */
export function tariffAmountGnf(
  tariffs: ShippingTariff[],
  fromZoneId: string | null | undefined,
  toZoneId: string
): number {
  if (!toZoneId) return 0;
  if (fromZoneId) {
    const exact = tariffs.find(
      (row) =>
        idsEqual(row.fromZoneId, fromZoneId) && idsEqual(row.toZoneId, toZoneId)
    );
    if (exact) return Number(exact.amountGnf) || 0;
  }
  const same = tariffs.find(
    (row) =>
      idsEqual(row.fromZoneId, toZoneId) && idsEqual(row.toZoneId, toZoneId)
  );
  if (same) return Number(same.amountGnf) || 0;
  const incoming = tariffs.filter((row) => idsEqual(row.toZoneId, toZoneId));
  if (!incoming.length) return 0;
  return Math.min(...incoming.map((row) => Number(row.amountGnf) || 0));
}

export function cartShippingGnf(
  tariffs: ShippingTariff[],
  toZoneId: string,
  itemZoneIds: Array<string | null | undefined>
): number {
  if (!toZoneId) return 0;
  const origins = [
    ...new Set(itemZoneIds.map((id) => (id ? String(id) : "")).filter(Boolean)),
  ];
  if (origins.length === 0) return tariffAmountGnf(tariffs, null, toZoneId);
  return origins.reduce(
    (sum, from) => sum + tariffAmountGnf(tariffs, from, toZoneId),
    0
  );
}
