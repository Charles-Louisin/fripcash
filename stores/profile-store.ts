import { create } from "zustand";

interface ProfileState {
  name: string;
  pseudo: string;
  phone: string;
  email: string;
  city: string;
  bio: string;
  avatar: string;
  updateProfile: (data: Partial<Omit<ProfileState, "updateProfile" | "hydrateFromUser">>) => void;
  hydrateFromUser: (user: any) => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  name: "",
  pseudo: "",
  phone: "",
  email: "",
  city: "",
  bio: "",
  avatar: "",
  updateProfile: (data) => set((state) => ({ ...state, ...data })),
  hydrateFromUser: (user) => {
    if (!user) return;
    set({
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.pseudo || "",
      pseudo: user.pseudo || "",
      phone: user.phone || "",
      email: user.email || "",
      city: user.city || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
    });
  },
}));
