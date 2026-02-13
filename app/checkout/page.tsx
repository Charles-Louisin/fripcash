"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import {
  FiHome,
  FiShield,
  FiCreditCard,
  FiSmartphone,
  FiTrash2,
  FiArrowLeft,
  FiCheck,
  FiLock,
} from "react-icons/fi";

type PaymentMethod = "mobile-money" | "card" | "wallet";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, removeItem, subtotal, totalWithShipping, clearCart, itemCount } =
    useCartStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? itemCount() : 0;
  const sub = mounted ? subtotal() : 0;
  const total = mounted ? totalWithShipping() : 0;
  const shippingFees = total - sub;
  const displayItems = mounted ? items : [];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile-money");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "Cameroun",
    // Card fields
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    // Mobile money
    mobileNumber: "",
    mobileOperator: "mtn",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePlaceOrder = async () => {
    // Basic validation
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      toast("Remplis tous les champs obligatoires.", "error");
      return;
    }

    if (paymentMethod === "card" && (!form.cardNumber || !form.cardExpiry || !form.cardCvc)) {
      toast("Remplis les informations de ta carte.", "error");
      return;
    }

    if (paymentMethod === "mobile-money" && !form.mobileNumber) {
      toast("Saisis ton numéro Mobile Money.", "error");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setOrderPlaced(true);
    clearCart();
    toast("Commande confirmée !", "success");
  };

  /* ─── Order confirmed screen ─── */
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <AppSheet />

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4 py-20">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mx-auto mb-6">
              <FiCheck className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Commande confirmée !
            </h1>
            <p className="text-muted-foreground mb-2">
              Merci pour ta commande. Tu recevras un email de confirmation avec
              les détails de suivi.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Numéro de commande :{" "}
              <span className="font-semibold text-foreground">
                FC-{Date.now().toString().slice(-8)}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="rounded-full px-6">
                <Link href="/">Continuer mes achats</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-full px-6"
              >
                <Link href="/dashboard/commandes">Voir mes commandes</Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* ─── Loading / Empty cart ─── */
  if (!mounted || count === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <AppSheet />

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4 py-20">
            {!mounted ? (
              <div className="flex items-center justify-center">
                <span className="h-8 w-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Ton panier est vide
                </h1>
                <p className="text-muted-foreground mb-6">
                  Ajoute des articles à ton panier pour passer commande.
                </p>
                <Button asChild className="rounded-full px-6">
                  <Link href="/">Découvrir les articles</Link>
                </Button>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* ─── Checkout page ─── */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />

      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6 pb-20">
          {/* Breadcrumb */}
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
                  Informations de livraison
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
                      placeholder="+237 6XX XXX XXX"
                      className="mt-2 h-12 px-4 text-base rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="jean@exemple.com"
                      className="mt-2 h-12 px-4 text-base rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium">Adresse de livraison *</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="Quartier, rue, numéro..."
                      className="mt-2 h-12 px-4 text-base rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">Ville *</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Douala"
                      className="mt-2 h-12 px-4 text-base rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-sm font-medium">Pays</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      className="mt-2 h-12 px-4 text-base rounded-xl"
                    />
                  </div>
                </div>
              </section>

              {/* Payment method */}
              <section className="border border-border rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Mode de paiement
                </h2>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  {([
                    { id: "mobile-money" as PaymentMethod, icon: FiSmartphone, label: "Mobile Money" },
                    { id: "card" as PaymentMethod, icon: FiCreditCard, label: "Carte" },
                    { id: "wallet" as PaymentMethod, icon: FiShield, label: "Porte-monnaie" },
                  ]).map((pm) => (
                    <button
                      key={pm.id}
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
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {[
                          { id: "mtn", label: "MTN MoMo" },
                          { id: "orange", label: "Orange Money" },
                          { id: "other", label: "Autre" },
                        ].map((op) => (
                          <button
                            key={op.id}
                            onClick={() =>
                              updateField("mobileOperator", op.id)
                            }
                            className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                              form.mobileOperator === op.id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-foreground hover:border-primary/30"
                            }`}
                          >
                            {op.label}
                          </button>
                        ))}
                      </div>
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
                        placeholder="6XX XXX XXX"
                        className="mt-2 h-12 px-4 text-base rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber" className="text-sm font-medium">Numéro de carte *</Label>
                      <Input
                        id="cardNumber"
                        value={form.cardNumber}
                        onChange={(e) =>
                          updateField("cardNumber", e.target.value)
                        }
                        placeholder="4242 4242 4242 4242"
                        className="mt-2 h-12 px-4 text-base rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry" className="text-sm font-medium">Expiration *</Label>
                        <Input
                          id="cardExpiry"
                          value={form.cardExpiry}
                          onChange={(e) =>
                            updateField("cardExpiry", e.target.value)
                          }
                          placeholder="MM/AA"
                          className="mt-2 h-12 px-4 text-base rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvc" className="text-sm font-medium">CVC *</Label>
                        <Input
                          id="cardCvc"
                          value={form.cardCvc}
                          onChange={(e) =>
                            updateField("cardCvc", e.target.value)
                          }
                          placeholder="123"
                          className="mt-2 h-12 px-4 text-base rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "wallet" && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <FiShield className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Solde FripCash : 0,00 &euro;
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Le montant sera débité de ton porte-monnaie FripCash.
                      </p>
                    </div>
                  </div>
                )}
              </section>
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
                        <p className="text-xs text-muted-foreground">
                          Qté : {item.quantity}
                          {item.size ? ` · ${item.size}` : ""}
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">
                          {(item.price * item.quantity).toFixed(2)} &euro;
                        </p>
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

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sous-total ({count} article{count > 1 ? "s" : ""})
                    </span>
                    <span className="font-medium">{sub.toFixed(2)} &euro;</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="font-medium">
                      {shippingFees.toFixed(2)} &euro;
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
                    <span>Total</span>
                    <span className="text-primary">
                      {total.toFixed(2)} &euro;
                    </span>
                  </div>
                </div>

                {/* Place order button */}
                <Button
                  className="w-full h-12 rounded-full font-semibold text-base gap-2"
                  onClick={handlePlaceOrder}
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
                      Payer {total.toFixed(2)} &euro;
                    </>
                  )}
                </Button>

                {/* Security note */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FiShield className="h-3.5 w-3.5 shrink-0" />
                  <p>
                    Paiement 100% sécurisé. Tes données sont protégées.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
