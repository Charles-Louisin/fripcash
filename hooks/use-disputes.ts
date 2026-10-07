import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  openDispute,
  fetchMyDisputes,
  addDisputeEvidence,
  addDisputeMessage,
  closeDispute,
  reopenDispute,
  readToken,
} from "@/lib/api";

function hasToken() {
  if (typeof window === "undefined") return false;
  return !!readToken();
}

function asArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    return (data as any).items;
  }
  return [];
}

export function useCreateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { orderId: string; reason: string }) =>
      openDispute(body.orderId, body.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
}

export function useDisputes() {
  return useQuery({
    queryKey: ["disputes"],
    queryFn: async () => asArray(await fetchMyDisputes()),
    enabled: hasToken(),
  });
}

export function useAddDisputeEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      id: string;
      url: string;
      storageKey?: string;
      uploaderRole?: string;
    }) => addDisputeEvidence(body.id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disputes"] }),
  });
}

export function useAddDisputeMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      id: string;
      body: string;
      kind?: string;
      attachments?: Array<{
        url: string;
        storageKey?: string;
        mimeType?: string;
        name?: string;
      }>;
    }) => addDisputeMessage(body.id, body.body, {
      kind: body.kind,
      attachments: body.attachments,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disputes"] }),
  });
}

export function useCloseDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => closeDispute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disputes"] }),
  });
}

export function useReopenDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reopenDispute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disputes"] }),
  });
}
