/** Auth market countries — Guinée = phone OTP · France = email + password */

export type AuthCountryId = "GN" | "FR";

export type AuthCountry = {
  id: AuthCountryId;
  name: string;
  code: string;
  flag: string;
  authMethod: "phone" | "email";
  /** Phone-only fields (Guinée) */
  label?: string;
  placeholder?: string;
  minLocalDigits?: number;
  maxLocalDigits?: number;
};

export const AUTH_COUNTRIES: Record<AuthCountryId, AuthCountry> = {
  GN: {
    id: "GN",
    name: "Guinée",
    code: "+224",
    flag: "🇬🇳",
    authMethod: "phone",
    label: "+224",
    placeholder: "621112233",
    minLocalDigits: 9,
    maxLocalDigits: 9,
  },
  FR: {
    id: "FR",
    name: "France",
    code: "+33",
    flag: "🇫🇷",
    authMethod: "email",
  },
};

export const AUTH_COUNTRY_OPTIONS = Object.values(AUTH_COUNTRIES);

/** Default market (Guinée) — used by inscription OTP helpers. */
export const AUTH_COUNTRY = AUTH_COUNTRIES.GN;

export function normalizeLocalPhone(
  value: string,
  country: AuthCountry = AUTH_COUNTRY
): string {
  const max = country.maxLocalDigits ?? 9;
  return value.replace(/\D/g, "").slice(0, max);
}

export function isValidLocalPhone(
  local: string,
  country: AuthCountry = AUTH_COUNTRY
): boolean {
  const max = country.maxLocalDigits ?? 9;
  return normalizeLocalPhone(local, country).length === max;
}

export function fullPhoneFromLocal(
  local: string,
  country: AuthCountry = AUTH_COUNTRY
): string {
  return `${country.code}${normalizeLocalPhone(local, country)}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
