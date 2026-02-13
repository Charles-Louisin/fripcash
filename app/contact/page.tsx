"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { useToast } from "@/components/ui/toast";
import { FiHome, FiMail, FiPhone, FiMapPin, FiClock, FiSend } from "react-icons/fi";

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.subject || !form.message) {
      toast("Remplis tous les champs.", "error");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", phone: "", subject: "", message: "" });
      toast("Message envoyé ! Nous te répondrons rapidement.", "success");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />

      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6 pb-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
            <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <FiHome className="h-3.5 w-3.5" />
              Accueil
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Contact</span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
              <FiMail className="h-3.5 w-3.5" />
              Contacte-nous
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Une question ? <span className="text-primary">Écris-nous</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Notre équipe est disponible pour t&apos;aider. Envoie-nous un message
              et nous te répondrons dans les plus brefs délais.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {[
                {
                  icon: FiPhone,
                  title: "Téléphone",
                  line1: "+237 6XX XXX XXX",
                  line2: "Lun - Ven, 8h - 18h",
                },
                {
                  icon: FiMail,
                  title: "Email",
                  line1: "contact@fripcash.com",
                  line2: "Réponse sous 24h",
                },
                {
                  icon: FiMapPin,
                  title: "Adresse",
                  line1: "Douala, Cameroun",
                  line2: "Akwa, Rue de la Joie",
                },
                {
                  icon: FiClock,
                  title: "Horaires",
                  line1: "Lundi - Vendredi : 8h - 18h",
                  line2: "Samedi : 9h - 14h",
                },
              ].map((info) => (
                <div key={info.title} className="flex items-start gap-4 p-4 border border-border rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                    <info.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{info.title}</h3>
                    <p className="text-sm text-muted-foreground">{info.line1}</p>
                    <p className="text-xs text-muted-foreground">{info.line2}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 border border-border rounded-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Envoyer un message</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      placeholder="Ton nom"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="+237 6XX XXX XXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Sujet
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  >
                    <option value="">Sélectionne un sujet</option>
                    <option value="general">Question générale</option>
                    <option value="order">Problème de commande</option>
                    <option value="payment">Paiement / Remboursement</option>
                    <option value="account">Mon compte</option>
                    <option value="report">Signalement</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Décris ta demande en détail..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <FiSend className="h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* FAQ hint */}
          <div className="max-w-5xl mx-auto mt-12 text-center bg-primary/5 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">
              Avant de nous écrire...
            </h3>
            <p className="text-sm text-muted-foreground">
              Consulte notre page{" "}
              <Link href="/securite" className="text-primary font-medium hover:underline">
                Sécurité & Confiance
              </Link>{" "}
              ou nos{" "}
              <Link href="/conditions" className="text-primary font-medium hover:underline">
                Conditions Générales
              </Link>{" "}
              pour trouver des réponses rapides à tes questions.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
