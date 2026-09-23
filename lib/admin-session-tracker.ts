/**
 * Login session recording — no-op until an admin sessions API exists.
 * Kept so auth pages don't need conditional imports.
 */
export function recordLoginSession(_params: {
  email: string;
  displayName?: string;
  role?: string;
  userId?: string;
}) {
  /* intentionally empty — was writing to a mock zustand store */
}
