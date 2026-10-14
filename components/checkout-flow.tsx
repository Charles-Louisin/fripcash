"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import { useCheckout, useAddCartItem, useClearServerCart } from "@/hooks/use-cart";
import { fetchPayment, fetchZones, fetchTariffs } from "@/lib/api";
import { isValidEmail } from "@/lib/auth-country";
import { parseGnMobile } from "@/lib/gn-phone";
import { cartShippingGnf } from "@/lib/shipping-tariff";
import { EmptyStateLottie } from "@/components/empty-state-lottie";
import {
  FiHome,
  FiShield,
  FiCreditCard,
  FiSmartphone,
  FiTrash2,
  FiArrowLeft,
  FiLock,
  FiPlus,
  FiMinus,
  FiChevronDown,
} from "react-icons/fi";

type PaymentMethod = "mobile-money" | "cinetpay";

const MOBILE_OPERATORS = [
  {
    id: "OM_GN",
    label: "Orange Money",
    logo: "/images/payments/orange.svg",
  },
  {
    id: "MTN_GN",
    label: "MTN MoMo",
    logo: "/images/payments/mtn.svg",
  },
] as const;

export function CheckoutFlow() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, removeItem, updateQuantity, subtotal, clearCart, itemCount } =
    useCartStore();
  const checkoutApi = useCheckout();
  const addCartItem = useAddCartItem();
  const clearServerCart = useClearServerCart();
  const { data: zones = [] } = useQuery({
    queryKey: ["catalog-zones"],
    queryFn: fetchZones,
  });
  const { data: tariffs = [] } = useQuery({
    queryKey: ["catalog-tariffs"],
    queryFn: fetchTariffs,
  });
  const activeZones = zones.filter((z) => z.isActive !== false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [toZoneId, setToZoneId] = useState("");
  const [paymentVisible, setPaymentVisible] = useState(false);
  const paymentRef = useRef<HTMLElement>(null);

  const count = mounted ? itemCount() : 0;
  const sub = mounted ? subtotal() : 0;
  const displayItems = mounted ? items : [];
  const shippingFees =
    !mounted || !toZoneId
      ? 0
      : cartShippingGnf(
          tariffs,
          toZoneId,
          displayItems.map((i) => i.zoneId)
        );

  const hasNegotiable = displayItems.some((i) => i.negotiable === true);
  const [offerAmount, setOfferAmount] = useState("");
  const parsedOffer = Number(offerAmount.replace(/\s/g, ""));
  const usingOffer = hasNegotiable && parsedOffer > 0;
  const goodsTotal = usingOffer ? parsedOffer : sub;
  const total = goodsTotal + shippingFees;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile-money");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [operatorModalOpen, setOperatorModalOpen] = useState(false);
  const [waitingPay, setWaitingPay] = useState(false);

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "Guinée",
    mobileNumber: "",
    mobileOperator: "OM_GN",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePlaceOrder = async () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast("Remplis tous les champs obligatoires.", "error");
      return;
    }

    if (!parseGnMobile(form.phone)) {
      toast("Le téléphone de livraison doit être un mobile guinéen Orange (62) ou MTN (65).", "error");
      return;
    }

    if (!form.email.trim() || !isValidEmail(form.email)) {
      toast("Saisis une adresse e-mail valide.", "error");
      return;
    }

    if (!toZoneId) {
      toast("Choisis ta zone de livraison.", "error");
      return;
    }

    if (!form.address.trim()) {
      toast("Remplis ton adresse de livraison.", "error");
      return;
    }

    setPaymentVisible(true);
    requestAnimationFrame(() => {
      paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleProceedToPay = async () => {
    if (paymentMethod === "mobile-money") {
      const mm = parseGnMobile(form.mobileNumber);
      if (!mm) {
        toast("Saisis un numéro Mobile Money guinéen valide (Orange 62 ou MTN 65).", "error");
        return;
      }
      if (mm.operator !== form.mobileOperator) {
        toast(
          form.mobileOperator === "OM_GN"
            ? "Ce numéro n'est pas un Orange Money guinéen (préfixe 62)."
            : "Ce numéro n'est pas un MTN MoMo guinéen (préfixe 65).",
          "error"
        );
        return;
      }
    }

    void submitOrder();
  };

  const selectedOperator = MOBILE_OPERATORS.find((o) => o.id === form.mobileOperator);

  const submitOrder = async () => {
    setIsProcessing(true);

    try {
      try {
        await clearServerCart.mutateAsync();
      } catch {
        /* panier serveur peut déjà être vide */
      }
      for (const item of displayItems) {
        await addCartItem.mutateAsync({
          listingId: String(item.id),
          quantity: item.quantity || 1,
        });
      }

      const fulfillmentMode = "courier";
      const pm =
        paymentMethod === "cinetpay" ? "CINETPAY" : form.mobileOperator;
      const zoneName =
        activeZones.find((z) => z.id === toZoneId)?.nameFr || form.city;

      const res = await checkoutApi.mutateAsync({
        fulfillmentMode,
        paymentMethod: pm,
        address: form.address,
        city: zoneName,
        phone: form.phone,
        name: form.fullName,
        email: form.email.trim(),
        mobileNumber: form.mobileNumber,
        toZoneId: toZoneId || undefined,
        shippingCostGnf: shippingFees,
        offerAmountGnf: usingOffer ? parsedOffer : undefined,
      });
      const payment = (res as any)?.payment;
      const orders = Array.isArray((res as any)?.orders)
        ? (res as any).orders
        : [];
      const createdIds = orders.map(
        (o: any) => o.id || o._id || `ord_${Date.now()}`
      );
      const ref = payment?.merchantTransactionId as string | undefined;

      if (payment?.paymentUrl) {
        toast("Redirection vers CinetPay…", "info");
        window.location.assign(payment.paymentUrl);
        return;
      }

      if (payment?.status === "pending" && ref) {
        setWaitingPay(true);
        toast(payment.message || "Confirme le paiement sur ton téléphone.", "info");
        let settled = payment.status;
        for (let i = 0; i < 40; i += 1) {
          await new Promise((r) => setTimeout(r, 2000));
          const poll = await fetchPayment(ref);
          settled = poll.payment.status;
          if (settled === "success" || settled === "failed" || settled === "expired") break;
        }
        setWaitingPay(false);
        if (settled !== "success") {
          toast(
            settled === "expired"
              ? "Le paiement a expiré. Réessaie."
              : "Le paiement n'a pas été confirmé.",
            "error"
          );
          return;
        }
      } else if (payment?.status && payment.status !== "success") {
        toast(payment.message || "Le paiement n'a pas abouti.", "error");
        return;
      }

      clearCart();
      setOrderNumber(
        createdIds.length === 1
          ? createdIds[0]
          : createdIds.length > 0
            ? `${createdIds.length} commandes`
            : "commande"
      );
      setOrderPlaced(true);
      toast("Paiement sécurisé — fonds bloqués en séquestre jusqu'à la livraison.", "success");
    } catch (err: any) {
      setWaitingPay(false);
      const msg = err?.message || "Erreur lors de la commande.";
      toast(msg, "error");
      if (err?.status === 401 || err?.body?.statusCode === 401) {
        router.push(`/connexion?redirect=${encodeURIComponent("/checkout")}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /* ─── Loading / Empty cart ─── */
  if (!mounted || (count === 0 && !orderPlaced)) {
    return (
      <div className="text-center max-w-md mx-auto px-4 py-10">
        {!mounted ? (
          <div className="flex items-center justify-center">
            <span className="h-8 w-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="w-40 h-40 mx-auto mb-4">
              <EmptyStateLottie />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              Ton panier est vide
            </h1>
            <p className="text-primary mb-6">
              Ajoute des articles à ton panier pour passer commande.
            </p>
            <Button asChild className="rounded-full px-6">
              <Link href="/">Découvrir les articles</Link>
            </Button>
          </>
        )}
      </div>
    );
  }

  /* ─── Checkout page ─── */
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 pt-6 pb-20">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <FiHome className="h-3.5 w-3.5" />
              Accueil
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Paiement</span>
          </nav>
          <div className="flex items-center gap-2 mb-8">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.back()}
            >
              <FiArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Finaliser ta commande
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ─── Left: Forms ─── */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping info */}
              <section className="border border-border rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-6">
                  Tes informations
                </h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Nom complet *</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Jean Dupont"
                      className="mt-2 h-12 px-4 text-base rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+224 6XX XXX XXX"
                      className="mt-2 h-12 px-4 text-base rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="jean@exemple.com"
                      className="mt-2 h-12 px-4 text-base rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="zone" className="text-sm font-medium">Zone de livraison *</Label>
                    <select
                      id="zone"
                      value={toZoneId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setToZoneId(id);
                        const z = activeZones.find((zone) => zone.id === id);
                        if (z) updateField("city", z.nameFr);
                      }}
                      className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-base"
                    >
                      <option value="">Choisir une zone</option>
                      {activeZones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium">Adresse de livraison *</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="Quartier, rue, numéro…"
                      className="mt-2 h-12 px-4 text-base rounded-xl"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Un livreur de l&apos;application te livre à cette adresse.
                    </p>
                  </div>
                </div>
              </section>

              {paymentVisible && (
              <section ref={paymentRef} className="border border-border rounded-2xl p-6 sm:p-8 scroll-mt-24">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Mode de paiement
                </h2>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  {([
                    { id: "mobile-money" as PaymentMethod, icon: FiSmartphone, label: "Mobile Money" },
                    { id: "cinetpay" as PaymentMethod, icon: FiCreditCard, label: "CinetPay" },
                  ]).map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border transition-all text-sm font-medium ${
                        paymentMethod === pm.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      <pm.icon className="h-4 w-4" />
                      {pm.label}
                    </button>
                  ))}
                </div>

                {/* Payment fields */}
                {paymentMethod === "mobile-money" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Opérateur</Label>
                      <button
                        type="button"
                        onClick={() => setOperatorModalOpen(true)}
                        className="mt-2 flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-left"
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          {selectedOperator ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={selectedOperator.logo}
                                alt=""
                                className="h-7 w-7 shrink-0 object-contain rounded-md bg-white border border-border"
                              />
                              <span className="truncate">{selectedOperator.label}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Choisir un opérateur</span>
                          )}
                        </span>
                        <FiChevronDown className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div>
                      <Label htmlFor="mobileNumber" className="text-sm font-medium">
                        Numéro Mobile Money *
                      </Label>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        value={form.mobileNumber}
                        onChange={(e) =>
                          updateField("mobileNumber", e.target.value)
                        }
                        placeholder={form.mobileOperator === "MTN_GN" ? "65X XXX XXX" : "62X XXX XXX"}
                        className="mt-2 h-12 px-4 text-base rounded-xl"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Mobile guinéen uniquement : Orange 62… ou MTN 65… (9 chiffres).
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tu seras redirigé vers CinetPay pour confirmer le paiement. Aucun code OTP n&apos;est saisi ici.
                    </p>
                  </div>
                )}

                {paymentMethod === "cinetpay" && (
                  <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">Visa / Mastercard via CinetPay</p>
                    <p className="text-xs text-muted-foreground">
                      Tu seras redirigé vers la page sécurisée CinetPay. FripCash ne collecte jamais le numéro de carte.
                    </p>
                  </div>
                )}

                {hasNegotiable && (
                  <div className="mt-5 space-y-2 border-t pt-4">
                    <Label className="text-sm font-medium">Faire une offre</Label>
                    <p className="text-xs text-muted-foreground">
                      Au moins un article accepte la négociation. Laisse vide pour payer le prix affiché.
                    </p>
                    <Input
                      type="number"
                      min={1}
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder={`Prix actuel ${sub.toLocaleString("fr-FR")} GNF`}
                      className="h-12 rounded-xl"
                    />
                  </div>
                )}

                <Button
                  className="w-full h-12 rounded-full font-semibold text-base gap-2 mt-6"
                  onClick={handleProceedToPay}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <FiLock className="h-4 w-4" />
                      Procéder au paiement
                    </>
                  )}
                </Button>
              </section>
              )}

              {!paymentVisible && (
              <div className="lg:hidden">
                <Button
                  className="w-full h-12 rounded-full font-semibold text-base gap-2"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  <FiLock className="h-4 w-4" />
                  Continuer vers le paiement
                </Button>
              </div>
              )}
            </div>

            {/* ─── Right: Order summary ─── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 border border-border rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-foreground">
                  Résumé de la commande
                </h2>

                {/* Items */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {displayItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-2 rounded-lg"
                    >
                      <div className="relative w-14 h-14 rounded-md overflow-hidden bg-muted shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.brand}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.brand}
                        </p>
                        {item.size ? (
                          <p className="text-xs text-muted-foreground">{item.size}</p>
                        ) : null}
                        <p className="text-sm font-semibold text-foreground mt-0.5">
                          {(item.price * item.quantity).toLocaleString("fr-FR")} GNF
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted"
                            aria-label="Diminuer"
                          >
                            <FiMinus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted"
                            aria-label="Augmenter"
                          >
                            <FiPlus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 self-start p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-foreground">Livraison par un livreur FripCash</p>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sous-total ({count} article{count > 1 ? "s" : ""})
                    </span>
                    <span className="font-medium">{sub.toLocaleString("fr-FR")} GNF</span>
                  </div>
                  {usingOffer && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Offre</span>
                      <span className="font-medium text-primary">
                        {parsedOffer.toLocaleString("fr-FR")} GNF
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="font-medium">
                      {shippingFees.toLocaleString("fr-FR")} GNF
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
                    <span>Total</span>
                    <span className="text-primary">
                      {total.toLocaleString("fr-FR")} GNF
                    </span>
                  </div>
                </div>

                {!paymentVisible && (
                <Button
                  className="hidden lg:flex w-full h-12 rounded-full font-semibold text-base gap-2"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  <FiLock className="h-4 w-4" />
                  Continuer vers le paiement
                </Button>
                )}

                {/* Security note */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FiShield className="h-3.5 w-3.5 shrink-0" />
                  <p>
                    Paiement bloqué en séquestre jusqu&apos;à confirmation de réception.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      <Dialog open={waitingPay} onOpenChange={() => undefined}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation Mobile Money</DialogTitle>
            <DialogDescription>
              Confirme le paiement sur ton téléphone. Cette fenêtre se ferme dès que CinetPay valide la transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <span className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={operatorModalOpen} onOpenChange={setOperatorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choisir un opérateur</DialogTitle>
            <DialogDescription>
              Orange Money ou MTN MoMo — les seuls moyens Mobile Money CinetPay en Guinée.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {MOBILE_OPERATORS.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => {
                  updateField("mobileOperator", op.id);
                  setOperatorModalOpen(false);
                }}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  form.mobileOperator === op.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={op.logo}
                  alt=""
                  className="h-10 w-10 object-contain rounded-md bg-white border border-border"
                />
                <span className="font-medium">{op.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={orderPlaced} onOpenChange={(open) => !open && router.push("/")}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mx-auto mb-2">
              <FiLock className="h-8 w-8 text-amber-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Paiement en séquestre
            </DialogTitle>
            <DialogDescription className="text-center">
              Ton paiement a été reçu et{" "}
              <span className="font-semibold text-foreground">bloqué en toute sécurité</span>{" "}
              jusqu&apos;à ce que tu confirmes la réception de l&apos;article.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">N° de commande</span>
              <span className="font-semibold text-foreground">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span className="font-medium text-foreground">Livreur FripCash</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut du paiement</span>
              <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                <FiLock className="h-3.5 w-3.5" />
                Bloqué en séquestre
              </span>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/commandes">Suivre ma commande</Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/">Continuer mes achats</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
