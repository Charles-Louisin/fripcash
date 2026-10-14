export type GnOperator = "OM_GN" | "MTN_GN";

export function digitsOnly(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

export function gnLocalFromInput(value: string): string | null {
  let digits = digitsOnly(value);
  if (digits.startsWith("00224")) digits = digits.slice(5);
  if (digits.startsWith("224") && digits.length > 9) digits = digits.slice(3);
  if (digits.length !== 9) return null;
  if (!digits.startsWith("6")) return null;
  return digits;
}

export function operatorFromLocal(local: string): GnOperator | null {
  if (local.startsWith("62")) return "OM_GN";
  if (local.startsWith("65")) return "MTN_GN";
  return null;
}

export function parseGnMobile(value: string): {
  local: string;
  e164: string;
  operator: GnOperator;
} | null {
  const local = gnLocalFromInput(value);
  if (!local) return null;
  const operator = operatorFromLocal(local);
  if (!operator) return null;
  return { local, e164: `+224${local}`, operator };
}

export function formatGnPlaceholder(operator?: GnOperator): string {
  return operator === "MTN_GN" ? "65X XXX XXX" : "62X XXX XXX";
}
