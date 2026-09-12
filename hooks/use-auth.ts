import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setToken, removeToken } from "@/lib/api";
import { clearAdminSession, setAdminSession, enableAdminDemoSession } from "@/lib/admin-session";
import { recordLoginSession } from "@/lib/admin-session-tracker";
import { useCartStore } from "@/stores/cart-store";
import { useAccountUpgradeStore } from "@/stores/account-upgrade-store";
import { buildSellerSnapshot } from "@/lib/account-capabilities";
import { delay, mockMe, mockMeExtras } from "@/lib/consumer-mock-data";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("fripcash-token");
}

function demoUser(overrides: Record<string, unknown> = {}) {
  const upgrade = useAccountUpgradeStore.getState();
  const seller = buildSellerSnapshot({
    role: upgrade.role,
    shopKind: upgrade.shopKind,
    verificationStatus: upgrade.verificationStatus,
  });

  return {
    ...mockMe,
    ...mockMeExtras,
    _id: upgrade.userId,
    id: upgrade.userId,
    role: upgrade.role,
    shopKind: upgrade.shopKind,
    seller,
    ...overrides,
  };
}

export function useMe() {
  const role = useAccountUpgradeStore((s) => s.role);
  const shopKind = useAccountUpgradeStore((s) => s.shopKind);
  const verificationStatus = useAccountUpgradeStore((s) => s.verificationStatus);

  return useQuery({
    queryKey: ["me", role, shopKind, verificationStatus],
    queryFn: () => delay(demoUser()),
    enabled: hasToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBecomeParticulier() {
  const queryClient = useQueryClient();
  const becomeParticulier = useAccountUpgradeStore((s) => s.becomeParticulier);

  return () => {
    becomeParticulier();
    queryClient.invalidateQueries({ queryKey: ["me"] });
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_body: { phone: string; password: string }) => {
      const user = demoUser();
      return delay({ success: true, token: "mock-token", user });
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["me"], data.user);
      recordLoginSession({
        email: data.user.email ?? data.user.phone,
        displayName: data.user.pseudo,
        role: data.user.role === "acheteur" ? "acheteur" : "particulier",
      });
    },
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      return delay({
        success: true,
        token: "mock-admin-token",
        user: {
          email: body.email,
          firstName: "Super",
          lastName: "Admin",
          role: "admin",
        },
      });
    },
    onSuccess: (data, variables) => {
      setToken(data.token);
      setAdminSession(true);
      queryClient.setQueryData(["me"], data.user);
      recordLoginSession({
        email: variables.email,
        displayName: "Super Admin",
        role: "admin",
        userId: "admin_1",
      });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (body: {
      phone: string;
      password: string;
      firstName: string;
      lastName: string;
      pseudo: string;
    }) =>
      delay({
        success: true,
        message: "Compte créé (démo)",
        user: demoUser({
          ...body,
          role: "acheteur",
          _id: `u_${Date.now()}`,
          id: `u_${Date.now()}`,
        }),
        token: "mock-token",
      }),
  });
}

export function useVerifySms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_body: { phone: string; code: string }) =>
      delay({ success: true, token: "mock-token", user: demoUser() }),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useResendCode() {
  return useMutation({
    mutationFn: async (_body: { phone: string }) =>
      delay({ success: true, message: "Code renvoyé (démo)", verificationCode: "123456" }),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Record<string, string>) =>
      delay({ success: true, user: demoUser(body) }),
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    removeToken();
    clearAdminSession();
    queryClient.setQueryData(["me"], null);
    queryClient.clear();
    useCartStore.getState().clearCart();
  };
}

/** Re-export for admin-login demo button compatibility. */
export { enableAdminDemoSession };
