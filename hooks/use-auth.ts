import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, setToken, removeToken } from "@/lib/api";
import { useCartStore } from "@/stores/cart-store";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("fripcash-token");
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await authApi.getMe();
      return res.user;
    },
    enabled: hasToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { phone: string; password: string }) =>
      authApi.login(body),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      authApi.adminLogin(body),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: {
      phone: string;
      password: string;
      firstName: string;
      lastName: string;
      pseudo: string;
    }) => authApi.register(body),
  });
}

export function useVerifySms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { phone: string; code: string }) =>
      authApi.verifySms(body),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useResendCode() {
  return useMutation({
    mutationFn: (body: { phone: string }) => authApi.resendCode(body),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, string>) =>
      authApi.updateProfile(body),
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    removeToken();
    queryClient.setQueryData(["me"], null);
    queryClient.clear();
    useCartStore.getState().clearCart();
  };
}
