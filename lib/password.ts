export function passwordError(password: string): string | null {
  if (password.length < 8) return "8 caractères minimum.";
  if (password.length > 128) return "Mot de passe trop long.";
  if (!/[A-Za-zÀ-ÿ]/.test(password)) return "Ajoute au moins une lettre.";
  if (!/[0-9]/.test(password)) return "Ajoute au moins un chiffre.";
  return null;
}

export function passwordsMatchError(
  password: string,
  confirm: string
): string | null {
  if (password !== confirm) return "Les mots de passe ne correspondent pas.";
  return null;
}
