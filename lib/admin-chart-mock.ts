/** Mock time-series for admin charts (inscriptions acheteurs / vendeurs). */
function buildSignupChartData() {
  const ref = new Date();
  ref.setHours(0, 0, 0, 0);
  const points: { date: string; acheteurs: number; vendeurs: number }[] = [];
  for (let i = 89; i >= 0; i -= 4) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    points.push({
      date: d.toISOString().slice(0, 10),
      acheteurs: 38 + (day % 9) * 5 + Math.round(Math.sin(i / 5) * 12),
      vendeurs: 14 + (day % 7) * 2 + Math.round(Math.cos(i / 6) * 8),
    });
  }
  return points;
}

export const signupChartData = buildSignupChartData();

export const categoryChartData = [
  { category: "mode", volume: 420, fill: "var(--color-mode)" },
  { category: "electronique", volume: 285, fill: "var(--color-electronique)" },
  { category: "maison", volume: 198, fill: "var(--color-maison)" },
  { category: "chaussures", volume: 156, fill: "var(--color-chaussures)" },
  { category: "autre", volume: 112, fill: "var(--color-autre)" },
] as const;

export const zoneChartData = [
  { zone: "zone_1", commandes: 312, fill: "var(--color-zone_1)" },
  { zone: "zone_2", commandes: 248, fill: "var(--color-zone_2)" },
  { zone: "autre", commandes: 89, fill: "var(--color-autre)" },
] as const;

export const orderStatusChartData = [
  { status: "livree", count: 186, fill: "var(--color-livree)" },
  { status: "en_cours", count: 94, fill: "var(--color-en_cours)" },
  { status: "en_attente", count: 52, fill: "var(--color-en_attente)" },
  { status: "annulee", count: 18, fill: "var(--color-annulee)" },
] as const;

export const gmvRadialData = [{ month: "juin", mobile: 2850000, web: 6200000 }] as const;

export const productGmvChartData = [
  { name: "Baskets", gmv: 3360000 },
  { name: "Sac cuir", gmv: 2520000 },
  { name: "Robe vintage", gmv: 1710000 },
  { name: "Écouteurs", gmv: 1450000 },
  { name: "Chemise", gmv: 980000 },
] as const;

export const courierPerfChartData = [
  { name: "Mamadou K.", deliveries: 18 },
  { name: "Alpha B.", deliveries: 14 },
  { name: "Ousmane T.", deliveries: 11 },
] as const;

export type TransactionChartPoint = {
  date: string;
  revenus: number;
  commissions: number;
};

function buildTransactionChartData(): TransactionChartPoint[] {
  const points: TransactionChartPoint[] = [];
  const ref = new Date();
  ref.setHours(0, 0, 0, 0);
  for (let i = 89; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    const wave = Math.sin(i / 6) * 120000;
    const spike = day % 7 === 0 ? 280000 : day % 5 === 0 ? 150000 : 0;
    const revenus = Math.round(420000 + wave + spike + (i % 11) * 18000);
    const commissions = Math.round(revenus * 0.08);
    points.push({
      date: d.toISOString().slice(0, 10),
      revenus,
      commissions,
    });
  }
  return points;
}

export const transactionChartData = buildTransactionChartData();

export function filterTransactionChartByDays(days: number): TransactionChartPoint[] {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return transactionChartData.filter((item) => {
    const d = new Date(item.date);
    return d >= start && d <= end;
  });
}

export function filterTransactionChartByRange(
  from: Date,
  to: Date
): TransactionChartPoint[] {
  return transactionChartData.filter((item) => {
    const d = new Date(item.date);
    return d >= from && d <= to;
  });
}
