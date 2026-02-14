import { create } from "zustand";
import { mockCurrentUser } from "@/lib/mock-data";

interface ProfileState {
  name: string;
  pseudo: string;
  phone: string;
  email: string;
  city: string;
  bio: string;
  avatar: string;
  updateProfile: (data: Partial<Omit<ProfileState, "updateProfile">>) => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  name: mockCurrentUser.name,
  pseudo: mockCurrentUser.pseudo,
  phone: mockCurrentUser.phone,
  email: "amina.bello@email.com",
  city: "Douala, Cameroun",
  bio: mockCurrentUser.bio,
  avatar: mockCurrentUser.avatar,
  updateProfile: (data) => set((state) => ({ ...state, ...data })),
}));
