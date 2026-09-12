import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type ActivityEvent,
  type AdminCourier,
  type AdminPartner,
  type AdminReport,
  type AdminStuckOrder,
  type AdminUserSession,
  type AdminWallet,
  type AdminZone,
  analyticsMock,
  initialActivity,
  initialCouriers,
  initialPartners,
  initialReports,
  initialShippingRates,
  initialStuckOrders,
  initialUserSessions,
  initialWallets,
  initialZones,
  shippingKey,
} from "@/lib/admin-platform";

type AdminPlatformState = {
  zones: AdminZone[];
  shippingRates: Record<string, number>;
  couriers: AdminCourier[];
  partners: AdminPartner[];
  wallets: AdminWallet[];
  reports: AdminReport[];
  stuckOrders: AdminStuckOrder[];
  activity: ActivityEvent[];
  commissionRate: number;
  analytics: typeof analyticsMock;
  userSessions: AdminUserSession[];

  addZone: (name: string) => void;
  removeZone: (id: string) => void;
  addQuartier: (zoneId: string, quartier: string) => void;
  removeQuartier: (zoneId: string, quartier: string) => void;
  setShippingRate: (from: string, to: string, price: number) => void;
  addCourier: (courier: Omit<AdminCourier, "id">) => void;
  toggleCourierActive: (id: string) => void;
  reassignOrder: (orderId: string, courierId: string) => void;
  addPartner: (partner: Omit<AdminPartner, "id">) => void;
  removePartner: (id: string) => void;
  releaseEscrow: (walletId: string) => void;
  updateReportStatus: (
    id: string,
    status: AdminReport["status"]
  ) => void;
  setCommissionRate: (rate: number) => void;
  pushActivity: (event: Omit<ActivityEvent, "id">) => void;
  recordSession: (session: Omit<AdminUserSession, "id">) => void;
  revokeSession: (id: string) => void;
  touchSession: (id: string) => void;
};

export const useAdminPlatformStore = create<AdminPlatformState>()(
  persist(
    (set, get) => ({
      zones: initialZones,
      shippingRates: initialShippingRates,
      couriers: initialCouriers,
      partners: initialPartners,
      wallets: initialWallets,
      reports: initialReports,
      stuckOrders: initialStuckOrders,
      activity: initialActivity,
      commissionRate: 8,
      analytics: analyticsMock,
      userSessions: initialUserSessions,

      addZone: (name) => {
        const id = `zone_${Date.now()}`;
        set((state) => ({
          zones: [...state.zones, { id, name, quartiers: [] }],
        }));
      },

      removeZone: (id) => {
        set((state) => ({
          zones: state.zones.filter((z) => z.id !== id),
        }));
      },

      addQuartier: (zoneId, quartier) => {
        set((state) => ({
          zones: state.zones.map((z) =>
            z.id === zoneId && !z.quartiers.includes(quartier)
              ? { ...z, quartiers: [...z.quartiers, quartier] }
              : z
          ),
        }));
      },

      removeQuartier: (zoneId, quartier) => {
        set((state) => ({
          zones: state.zones.map((z) =>
            z.id === zoneId
              ? {
                  ...z,
                  quartiers: z.quartiers.filter((q) => q !== quartier),
                }
              : z
          ),
        }));
      },

      setShippingRate: (from, to, price) => {
        const key = shippingKey(from, to);
        set((state) => ({
          shippingRates: { ...state.shippingRates, [key]: price },
        }));
      },

      addCourier: (courier) => {
        const id = `courier_${Date.now()}`;
        set((state) => ({
          couriers: [...state.couriers, { ...courier, id }],
        }));
        get().pushActivity({
          type: "signup",
          message: `Nouveau livreur enregistré : ${courier.name}`,
          time: "À l'instant",
        });
      },

      toggleCourierActive: (id) => {
        set((state) => ({
          couriers: state.couriers.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c
          ),
        }));
      },

      reassignOrder: (orderId, courierId) => {
        const courier = get().couriers.find((c) => c.id === courierId);
        set((state) => ({
          stuckOrders: state.stuckOrders.map((o) =>
            o.id === orderId ? { ...o, courierId } : o
          ),
        }));
        if (courier) {
          get().pushActivity({
            type: "delivery",
            message: `Commande ${orderId} réassignée à ${courier.name}`,
            time: "À l'instant",
          });
        }
      },

      addPartner: (partner) => {
        const id = `partner_${Date.now()}`;
        set((state) => ({
          partners: [...state.partners, { ...partner, id }],
        }));
      },

      removePartner: (id) => {
        set((state) => ({
          partners: state.partners.filter((p) => p.id !== id),
        }));
      },

      releaseEscrow: (walletId) => {
        set((state) => ({
          wallets: state.wallets.map((w) => {
            if (w.id !== walletId || w.escrowGnf <= 0) return w;
            return {
              ...w,
              balanceGnf: w.balanceGnf + w.escrowGnf,
              escrowGnf: 0,
              lastReleaseLabel: "À l'instant",
            };
          }),
        }));
        get().pushActivity({
          type: "sale",
          message: "Paiement vendeur débloqué (escrow)",
          time: "À l'instant",
        });
      },

      updateReportStatus: (id, status) => {
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        }));
      },

      setCommissionRate: (rate) => set({ commissionRate: rate }),

      pushActivity: (event) => {
        set((state) => ({
          activity: [
            { ...event, id: `act_${Date.now()}` },
            ...state.activity,
          ].slice(0, 20),
        }));
      },

      recordSession: (session) => {
        const id = `sess_${Date.now()}`;
        set((state) => ({
          userSessions: [
            { ...session, id },
            ...state.userSessions.map((s) =>
              s.email === session.email && s.status === "active"
                ? { ...s, status: "ended" as const, lastSeenLabel: "Session remplacée" }
                : s
            ),
          ].slice(0, 100),
        }));
        get().pushActivity({
          type: "signup",
          message: `Connexion ${session.role} : ${session.displayName}`,
          time: "À l'instant",
        });
      },

      revokeSession: (id) => {
        set((state) => ({
          userSessions: state.userSessions.map((s) =>
            s.id === id
              ? { ...s, status: "ended" as const, lastSeenLabel: "Révoquée par admin" }
              : s
          ),
        }));
      },

      touchSession: (id) => {
        set((state) => ({
          userSessions: state.userSessions.map((s) =>
            s.id === id
              ? { ...s, lastSeenLabel: "À l'instant", status: "active" as const }
              : s
          ),
        }));
      },
    }),
    { name: "fripcash-admin-platform-v2" }
  )
);
