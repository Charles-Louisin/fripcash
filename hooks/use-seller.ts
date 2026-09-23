import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyForShop,
  fetchSellerVerification,
  closeParticulier,
  closeShop,
  downgradeToParticulier,
  updateBundleSettings,
  setVacation,
  fetchProductLibrary,
  createLibraryItem,
  queueExcelImport,
  fetchMyKyc,
  submitMyKyc,
  uploadMyKycDocument,
  fetchMe,
} from "@/lib/api";
import { SHOP_KIND_TO_API } from "@/lib/api/mappers";
import { mapMeToUiUser } from "@/hooks/use-auth";

async function refreshMe(
  queryClient: ReturnType<typeof useQueryClient>
) {
  const me = await fetchMe();
  queryClient.setQueryData(["me"], mapMeToUiUser(me));
  return me;
}

export function useApplyForShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      shopKind: "standard" | "proximite" | "enseigne" | string;
      name: string;
      description?: string;
    }) => {
      const shopKind = (SHOP_KIND_TO_API[body.shopKind] ||
        body.shopKind.toUpperCase()) as "STANDARD" | "PROXIMITE" | "ENSEIGNE";
      await applyForShop({
        shopKind,
        name: body.name,
        description: body.description,
      });
      return refreshMe(queryClient);
    },
  });
}

export function useSellerVerification() {
  return useQuery({
    queryKey: ["seller", "verification"],
    queryFn: fetchSellerVerification,
  });
}

export function useCloseParticulier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await closeParticulier();
      return refreshMe(queryClient);
    },
  });
}

export function useCloseShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await closeShop();
      return refreshMe(queryClient);
    },
  });
}

export function useDowngradeToParticulier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await downgradeToParticulier();
      return refreshMe(queryClient);
    },
  });
}

export function useUpdateBundleSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBundleSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useSetVacation() {
  return useMutation({ mutationFn: setVacation });
}

export function useProductLibrary() {
  return useQuery({
    queryKey: ["seller", "library"],
    queryFn: fetchProductLibrary,
  });
}

export function useCreateLibraryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLibraryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "library"] });
    },
  });
}

export function useExcelImport() {
  return useMutation({
    mutationFn: (objectKey: string) => queueExcelImport(objectKey),
  });
}

export function useMyKyc() {
  return useQuery({
    queryKey: ["kyc", "me"],
    queryFn: fetchMyKyc,
  });
}

export function useSubmitMyKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body?: { note?: string }) => submitMyKyc(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
    },
  });
}

export function useUploadMyKycDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadMyKycDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
    },
  });
}
