import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  setToken,
  removeToken,
  readToken,
  fetchMe,
  updateMe,
  signOut,
  adminSignInEmail,
  becomeParticulier,
  ApiError,
  type Me,
} from "@/lib/api";
import {
  clearAdminSession,
  setAdminSession,
} from "@/lib/admin-session";
import { recordLoginSession } from "@/lib/admin-session-tracker";
import { useCartStore } from "@/stores/cart-store";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!readToken();
}

export function mapMeToUiUser(me: Me) {
  const nameParts = (me.displayName || "").trim().split(/\s+/);
  const firstName = nameParts[0] || me.displayName;
  const lastName = nameParts.slice(1).join(" ");

  let role: string = "acheteur";
  if (me.seller) {
    role =
      me.seller.kind === "particulier" ? "vendeurParticulier" : "boutique";
  }
  if (me.isAdmin) role = "admin";

  return {
    _id: me.id,
    id: me.id,
    firstName,
    lastName,
    pseudo: me.displayName,
    phone: me.phone,
    email: null as string | null,
    role,
    shopKind: me.seller?.shopKind ?? null,
    seller: me.seller,
    isAdmin: me.isAdmin,
    canBuy: me.canBuy,
    preferredLocale: me.preferredLocale,
    courier: me.courier,
    walletBalance: 0,
    avatar: undefined as string | undefined,
    createdAt: undefined as string | undefined,
    // UI extras until dedicated stats endpoints exist
    salesCount: 0,
    purchasesCount: 0,
    rating: 0,
    reviewsCount: 0,
    articlesCount: 0,
  };
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const me = await fetchMe();
      return mapMeToUiUser(me);
    },
    enabled: hasToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBecomeParticulier() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (body?: { displayName?: string; bio?: string }) => {
      await becomeParticulier(body);
      return fetchMe();
    },
    onSuccess: (me) => {
      queryClient.setQueryData(["me"], mapMeToUiUser(me));
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  /** Callable for existing UI: `becomeParticulier()` */
  return (body?: { displayName?: string; bio?: string }) =>
    mutation.mutateAsync(body);
}

/** @deprecated Prefer OTP on /connexion */
export function useLogin() {
  return useMutation({
    mutationFn: async (_body: { phone: string; password: string }) => {
      throw new Error("Use OTP login on /connexion");
    },
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const data = await adminSignInEmail(body.email, body.password);
      const me = await fetchMe();
      return {
        success: true as const,
        user: mapMeToUiUser(me),
        email: body.email,
        raw: data,
      };
    },
    onSuccess: (data, variables) => {
      setAdminSession(true);
      queryClient.setQueryData(["me"], data.user);
      recordLoginSession({
        email: variables.email,
        displayName: data.user.pseudo || "Admin",
        role: "admin",
        userId: data.user.id,
      });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (_body: {
      phone: string;
      password: string;
      firstName: string;
      lastName: string;
      pseudo: string;
    }) => {
      throw new Error("Use OTP signup on /inscription");
    },
  });
}

export function useVerifySms() {
  return useMutation({
    mutationFn: async (_body: { phone: string; code: string }) => {
      throw new Error("Use OTP verify on auth pages");
    },
  });
}

export function useResendCode() {
  return useMutation({
    mutationFn: async (_body: { phone: string }) => {
      throw new Error("Use sendOtp from @/lib/api");
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Record<string, string | undefined>) => {
      const name =
        body.name ||
        body.pseudo ||
        [body.firstName, body.lastName].filter(Boolean).join(" ") ||
        undefined;
      const me = await updateMe({
        name,
        preferredLocale: body.preferredLocale as "FR" | "EN" | undefined,
      });
      return { success: true, user: mapMeToUiUser(me) };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return async () => {
    try {
      await signOut();
    } catch {
      removeToken();
    }
    clearAdminSession();
    queryClient.setQueryData(["me"], null);
    queryClient.clear();
    useCartStore.getState().clearCart();
  };
}

export { setToken, ApiError };
