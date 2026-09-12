/** Guinea — FripCash market. Used by auth forms until BE owns phone parsing. */
export const AUTH_COUNTRY = {
  code: "+224",
  flag: "🇬🇳",
  label: "+224",
  placeholder: "621 11 22 33",
  /** Digits after country code (Guinea mobiles are typically 9). */
  minLocalDigits: 8,
  maxLocalDigits: 9,
} as const;

export function normalizeLocalPhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidLocalPhone(local: string): boolean {
  const digits = normalizeLocalPhone(local);
  return (
    digits.length >= AUTH_COUNTRY.minLocalDigits &&
    digits.length <= AUTH_COUNTRY.maxLocalDigits
  );
}

export function fullPhoneFromLocal(local: string): string {
  return `${AUTH_COUNTRY.code}${normalizeLocalPhone(local)}`;
}
