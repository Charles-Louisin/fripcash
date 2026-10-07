import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminMe,
  fetchPlatformSettings,
  updatePlatformSettings,
  fetchAuditLogs,
  fetchSellerVerifications,
  approveSellerVerification,
  rejectSellerVerification,
  sendAdminShopVerificationMessage,
  fetchAdminOrgKyc,
  fetchAdminIndividualKyc,
  approveOrgKyc,
  rejectOrgKyc,
  requestOrgKycResubmission,
  approveIndividualKyc,
  rejectIndividualKyc,
  resolveDispute,
  provisionAudience,
  hideReview,
  hideComment,
  createCategory,
  updateCategory,
  deleteCategory,
  createZone,
  updateZone,
  deleteZone,
  fetchCategories,
  fetchZones,
  listingImageUrl,
  fetchPublicStats,
  fetchSalesChart,
  fetchAdminListings,
  updateAdminListing,
  fetchAdminOrders,
  fetchAdminDisputes,
  fetchAdminWallets,
  fetchAdminSessions,
  fetchAdminReports,
  fetchAdminPartners,
  fetchAdminCouriers,
  updateAdminCourier,
  fetchAdminTariffs,
  saveAdminTariffs,
  fetchAdminRapports,
  fetchAdminStats,
  markDisputeReview,
  resolveAdminReport,
  askDisputeParty,
  fetchAuthAdminUser,
  fetchAuthAdminUsers,
  createAuthAdminUser,
  updateAuthAdminUser,
  setAuthAdminRole,
  setAuthAdminPassword,
  removeAuthAdminUser,
  listAuthAdminUserSessions,
  revokeAuthAdminUserSession,
  revokeAuthAdminUserSessions,
  banAuthUser,
  unbanAuthUser,
} from "@/lib/api";

function asArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    return (data as any).items;
  }
  return [];
}

export function useAdminMe() {
  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: fetchAdminMe,
  });
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: ["admin", "platform-settings"],
    queryFn: fetchPlatformSettings,
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePlatformSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "platform-settings"] });
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: async () => asArray(await fetchAuditLogs()),
  });
}

export function useSellerVerifications() {
  return useQuery({
    queryKey: ["admin", "seller-verifications"],
    queryFn: async () => asArray(await fetchSellerVerifications()),
  });
}

export function useApproveSellerVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewerNote }: { id: string; reviewerNote?: string }) =>
      approveSellerVerification(id, reviewerNote),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "seller-verifications"],
      });
    },
  });
}

export function useRejectSellerVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewerNote }: { id: string; reviewerNote?: string }) =>
      rejectSellerVerification(id, reviewerNote),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "seller-verifications"],
      });
    },
  });
}

export function useAdminShopVerificationMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
      attachments,
    }: {
      id: string;
      body: string;
      attachments?: Array<{
        url: string;
        storageKey?: string;
        mimeType?: string;
        name?: string;
      }>;
    }) => sendAdminShopVerificationMessage(id, { body, attachments }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "seller-verifications"],
      });
    },
  });
}

export function useAdminOrgKyc() {
  return useQuery({
    queryKey: ["admin", "kyc", "organizations"],
    queryFn: async () => asArray(await fetchAdminOrgKyc()),
  });
}

export function useAdminIndividualKyc() {
  return useQuery({
    queryKey: ["admin", "kyc", "individuals"],
    queryFn: async () => asArray(await fetchAdminIndividualKyc()),
  });
}

export function useReviewOrgKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      reviewerNote,
    }: {
      id: string;
      action: "approve" | "reject" | "resubmit";
      reviewerNote?: string;
    }) => {
      if (action === "approve") return approveOrgKyc(id, reviewerNote);
      if (action === "reject") return rejectOrgKyc(id, reviewerNote);
      return requestOrgKycResubmission(id, reviewerNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
  });
}

export function useReviewIndividualKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      reviewerNote,
    }: {
      id: string;
      action: "approve" | "reject";
      reviewerNote?: string;
    }) => {
      if (action === "approve") return approveIndividualKyc(id, reviewerNote);
      return rejectIndividualKyc(id, reviewerNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
  });
}

export function useAskDisputeParty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      message,
      kind,
      requestedKinds,
    }: {
      id: string;
      message: string;
      kind?: string;
      requestedKinds?: string[];
    }) => askDisputeParty(id, message, { kind, requestedKinds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
}

export function useResolveAdminDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      resolution,
      note,
      buyerPercent,
      sellerPercent,
    }: {
      id: string;
      resolution: "resolved_buyer" | "resolved_seller" | "partial_refund";
      note: string;
      buyerPercent?: number;
      sellerPercent?: number;
    }) => resolveDispute(id, { resolution, note, buyerPercent, sellerPercent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useProvisionAudience() {
  return useMutation({
    mutationFn: ({
      userId,
      audience,
    }: {
      userId: string;
      audience: "CONSUMER" | "ADMIN" | "COURIER";
    }) => provisionAudience(userId, audience),
  });
}

export function useHideReview() {
  return useMutation({ mutationFn: (id: string) => hideReview(id) });
}

export function useHideComment() {
  return useMutation({ mutationFn: (id: string) => hideComment(id) });
}

export function useAdminCatalogCategories() {
  return useQuery({
    queryKey: ["admin", "catalog", "categories"],
    queryFn: fetchCategories,
  });
}

export function useAdminCatalogZones() {
  return useQuery({
    queryKey: ["admin", "catalog", "zones"],
    queryFn: fetchZones,
  });
}

export function useAdminCategoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };
  return {
    create: useMutation({ mutationFn: createCategory, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
        updateCategory(id, body as any),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteCategory(id),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminZoneMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
  return {
    create: useMutation({ mutationFn: createZone, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
        updateZone(id, body as any),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteZone(id),
      onSuccess: invalidate,
    }),
  };
}

/** Dashboard overview — live GET /admin/stats. */
export function useAdminDashboard(days?: number) {
  return useQuery({
    queryKey: ["admin", "dashboard", days ?? 30],
    queryFn: () => fetchAdminStats(days ?? 30),
    staleTime: 60_000,
  });
}

/** @deprecated Prefer useAdminDashboard */
export function useAdminStats() {
  return useAdminDashboard();
}

export function useAdminChartData(days?: number) {
  return useQuery({
    queryKey: ["admin", "dashboard", days ?? 30],
    queryFn: () => fetchAdminStats(days ?? 30),
    select: (d: any) =>
      (d?.chart?.transactions ?? []) as {
        date: string;
        revenus: number;
        commissions: number;
      }[],
    staleTime: 60_000,
  });
}

export function useUserChartData(range?: string) {
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  return useQuery({
    queryKey: ["user", "chart-data", days],
    queryFn: () => fetchSalesChart(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: fetchPublicStats,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAdminUsers(params?: {
  status?: string;
  q?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const q = params?.q?.trim();
      const res = await fetchAuthAdminUsers({
        limit: 100,
        ...(q
          ? {
              searchValue: q,
              searchField: q.includes("@") ? "email" : "name",
              searchOperator: "contains" as const,
            }
          : {}),
      });

      const mapKindToRole = (u: {
        userKind?: string;
        authAudience?: string;
        role?: string | null;
        seller?: { kind?: string; shopKind?: string | null } | null;
      }) => {
        const kind = String(u.userKind || u.authAudience || "").toUpperCase();
        if (kind === "ADMIN" || u.role === "admin") return "admin";
        if (kind === "COURIER" || u.authAudience === "COURIER") return "livreur";
        const shop = u.seller?.shopKind;
        if (shop === "enseigne") return "enseigne";
        if (shop === "proximite") return "commerce";
        if (u.seller?.kind === "boutique") return "boutique";
        if (u.seller?.kind === "particulier") return "particulier";
        return "acheteur";
      };

      let rows = (res.users || []).map((u) => {
        const parts = String(u.name || "").trim().split(/\s+/);
        const firstName = parts[0] || u.name || "—";
        const lastName = parts.slice(1).join(" ");
        const pseudo =
          u.email?.split("@")[0] ||
          u.phoneNumber?.replace(/\D/g, "").slice(-6) ||
          u.id.slice(-6);
        return {
          _id: u.id,
          id: u.id,
          firstName,
          lastName,
          pseudo,
          email: u.email,
          phone: u.phoneNumber || "—",
          avatar: u.image || undefined,
          status: u.banned ? "banned" : "active",
          role: mapKindToRole(u),
          authRole: u.role || "user",
          userKind: u.userKind,
          authAudience: u.authAudience,
          shopKind: u.seller?.shopKind,
          articlesCount: 0,
          createdAt: u.createdAt,
          raw: u,
        };
      });

      if (params?.status === "banned") {
        rows = rows.filter((r) => r.status === "banned");
      } else if (params?.status === "active") {
        rows = rows.filter((r) => r.status === "active");
      } else if (params?.status === "pending") {
        rows = rows.filter((r) => r.status === "pending");
      }

      // Client search also covers phone when Better Auth search is email/name only
      if (q && !q.includes("@")) {
        const qq = q.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.firstName.toLowerCase().includes(qq) ||
            r.lastName.toLowerCase().includes(qq) ||
            r.pseudo.toLowerCase().includes(qq) ||
            r.email.toLowerCase().includes(qq) ||
            String(r.phone).includes(q)
        );
      }

      return { data: rows, total: res.total ?? rows.length };
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (status === "banned") {
        return banAuthUser(id);
      }
      if (status === "active") {
        return unbanAuthUser(id);
      }
      throw new Error(`Statut non supporté: ${status}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

function invalidateUsers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
}

export function useCreateAuthAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAuthAdminUser,
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useUpdateAuthAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Record<string, unknown>;
    }) => updateAuthAdminUser(userId, data),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useSetAuthAdminRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: string | string[];
    }) => setAuthAdminRole(userId, role),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useSetAuthAdminPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      newPassword,
    }: {
      userId: string;
      newPassword: string;
    }) => setAuthAdminPassword(userId, newPassword),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useRemoveAuthAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeAuthAdminUser(userId),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useAuthAdminUserSessions(userId: string | null) {
  return useQuery({
    queryKey: ["admin", "user-sessions", userId],
    queryFn: () => listAuthAdminUserSessions(userId!),
    enabled: !!userId,
  });
}

export function useRevokeAuthAdminUserSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionToken: string) =>
      revokeAuthAdminUserSession(sessionToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user-sessions"] });
    },
  });
}

export function useRevokeAuthAdminUserSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => revokeAuthAdminUserSessions(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user-sessions"] });
    },
  });
}

export function useAdminArticles(params?: {
  status?: string;
  q?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["admin", "articles", params],
    queryFn: async () => {
      const UI_TO_API_STATUS: Record<string, string> = {
        pending: "DRAFT",
        active: "ACTIVE",
        approved: "ACTIVE",
        rejected: "REJECTED",
        flagged: "FLAGGED",
        sold: "SOLD",
        draft: "DRAFT",
      };
      const apiStatus = params?.status
        ? UI_TO_API_STATUS[params.status.toLowerCase()] ||
          params.status.toUpperCase()
        : "ALL";

      const listings = await fetchAdminListings({ status: apiStatus });

      const mapUiStatus = (status: string) => {
        const s = status.toUpperCase();
        if (s === "DRAFT") return "pending";
        if (s === "ACTIVE") return "active";
        if (s === "SOLD" || s === "SOLD_OUT") return "sold";
        if (s === "REJECTED") return "rejected";
        if (s === "FLAGGED") return "flagged";
        return status.toLowerCase();
      };

      let rows = listings.map((l) => ({
        _id: l.id,
        id: l.id,
        title: l.title,
        description: l.description || "",
        price: l.priceGnf,
        quantity: l.quantity,
        status: mapUiStatus(String(l.status || "")),
        apiStatus: String(l.status || "").toUpperCase(),
        destination: l.destination,
        listingDestination: l.destination,
        condition: l.conditionNote || "",
        images: (l.media || [])
          .map((m) => listingImageUrl(m))
          .filter(Boolean) as string[],
        seller: {
          id: l.sellerProfile?.id || l.sellerProfileId,
          userId: l.sellerProfile?.userId,
          kind: l.sellerProfile?.sellerKind || null,
          pseudo:
            l.sellerProfile?.displayName ||
            l.sellerProfile?.sellerKind ||
            l.sellerProfileId?.slice(-6) ||
            "Vendeur",
          verificationStatus: l.sellerProfile?.verificationStatus || null,
        },
        category: l.category?.nameFr || null,
        createdAt: l.createdAt,
        publishedAt: l.publishedAt,
        raw: l,
      }));

      // Resolve seller display names (list payload only has sellerKind).
      const userIds = [
        ...new Set(
          rows
            .map((r) => r.seller.userId)
            .filter((id): id is string => !!id)
        ),
      ];
      if (userIds.length > 0) {
        const nameByUserId = new Map<string, string>();
        await Promise.all(
          userIds.map(async (userId) => {
            try {
              const user = await fetchAuthAdminUser(userId);
              if (user?.name) nameByUserId.set(userId, user.name);
            } catch {
              /* keep kind fallback */
            }
          })
        );
        rows = rows.map((r) => {
          const name = r.seller.userId
            ? nameByUserId.get(r.seller.userId)
            : undefined;
          if (!name) return r;
          return {
            ...r,
            seller: { ...r.seller, pseudo: name },
          };
        });
      }

      if (params?.q) {
        const q = params.q.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.seller.pseudo.toLowerCase().includes(q)
        );
      }
      return { data: rows, total: rows.length };
    },
  });
}

export function useUpdateArticleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const STATUS_MAP: Record<string, string> = {
        active: "ACTIVE",
        approved: "ACTIVE",
        rejected: "REJECTED",
        flagged: "FLAGGED",
        pending: "DRAFT",
        sold: "SOLD",
      };
      const apiStatus = STATUS_MAP[status.toLowerCase()] || status.toUpperCase();
      return updateAdminListing(id, { status: apiStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useAdminOrders(params?: {
  status?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: async () => {
      const rows = asArray(await fetchAdminOrders()).map((o: any) => ({
        ...o,
        _id: o.id || o._id,
        amount: o.amountGnf ?? o.amount ?? 0,
        commission: o.commissionGnf ?? o.commission ?? 0,
        article: o.listing || o.article,
        shippingCost: o.shippingCostGnf ?? o.shippingCost ?? 0,
      }));
      return { data: rows, total: rows.length };
    },
  });
}

export function useAdminDisputes(params?: {
  status?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["admin", "disputes", params],
    queryFn: async () => {
      const rows = asArray(await fetchAdminDisputes());
      return { data: rows, total: rows.length };
    },
  });
}

export function useAdminWallets() {
  return useQuery({
    queryKey: ["admin", "wallets"],
    queryFn: async () => asArray(await fetchAdminWallets()),
  });
}

export function useAdminLiveSessions() {
  return useQuery({
    queryKey: ["admin", "sessions"],
    queryFn: async () => asArray(await fetchAdminSessions()),
  });
}

export function useAdminSignalements() {
  return useQuery({
    queryKey: ["admin", "signalements"],
    queryFn: async () => asArray(await fetchAdminReports()),
  });
}

export function useAdminPartners() {
  return useQuery({
    queryKey: ["admin", "partners"],
    queryFn: async () => asArray(await fetchAdminPartners()),
  });
}

export function useAdminCouriers() {
  return useQuery({
    queryKey: ["admin", "couriers"],
    queryFn: async () => asArray(await fetchAdminCouriers()),
  });
}

export function useUpdateAdminCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      zoneId?: string | null;
      zoneIds?: string[];
      isAvailable?: boolean;
      status?: string;
    }) => updateAdminCourier(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "couriers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
    },
  });
}

export function useAdminTariffs() {
  return useQuery({
    queryKey: ["admin", "tariffs"],
    queryFn: fetchAdminTariffs,
  });
}

export function useSaveAdminTariffs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      items: Array<{ fromZoneId: string; toZoneId: string; amountGnf: number }>
    ) => saveAdminTariffs(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tariffs"] });
    },
  });
}

export function useAdminRapports() {
  return useQuery({
    queryKey: ["admin", "rapports"],
    queryFn: fetchAdminRapports,
  });
}

export function useMarkDisputeReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      markDisputeReview(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useResolveAdminReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveAdminReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "signalements"] });
    },
  });
}

export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: string;
      note?: string;
    }) => {
      if (
        status === "resolved_buyer" ||
        status === "resolved_seller" ||
        status === "partial_refund"
      ) {
        return resolveDispute(id, {
          resolution: status as
            | "resolved_buyer"
            | "resolved_seller"
            | "partial_refund",
          note: note || "Résolu",
        });
      }
      if (status === "under_review") {
        return markDisputeReview(id, note);
      }
      return { success: true, id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
