export const SIGNUP_ROLES = [
  "acheteur",
  "particulier",
  "boutique",
  "commerceLocal",
  "grandeSurface",
] as const;

export type SignupRole = (typeof SIGNUP_ROLES)[number];

export type SignupRoleOption = {
  id: SignupRole;
  title: string;
  description: string;
};

export const SIGNUP_ROLE_OPTIONS: SignupRoleOption[] = [
  {
    id: "acheteur",
    title: "Acheteur",
    description: "Je veux juste acheter.",
  },
  {
    id: "particulier",
    title: "Particulier",
    description:
      "Je vends ce que je ne porte plus. Mes annonces vont dans Seconde main.",
  },
  {
    id: "boutique",
    title: "Boutique",
    description:
      "Je vends des articles neufs dans toute la ville. Mes annonces vont dans Articles neufs.",
  },
  {
    id: "commerceLocal",
    title: "Commerce local",
    description:
      "Épicerie, éducation, petit commerce de proximité. Tes annonces apparaissent dans Boutiques de quartier.",
  },
  {
    id: "grandeSurface",
    title: "Grande surface spécialisée",
    description:
      "Grosses enseignes et grandes entreprises. Validation manuelle de l’équipe.",
  },
];
