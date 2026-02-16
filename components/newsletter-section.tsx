"use client";

import { useState } from "react";
import { FiSend, FiCheck } from "react-icons/fi";
import { useToast } from "@/components/ui/toast";
import { newsletterApi } from "@/lib/api";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      const res = await newsletterApi.subscribe(email);
      setSubmitted(true);
      setEmail("");
      toast(res.message || "Merci ! Tu es inscrit à la newsletter.");
    } catch (err: any) {
      toast(err?.message || "Une erreur est survenue. Réessaie.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=600&fit=crop)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Newsletter
          </span>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Reste informé des{" "}
            <span className="text-primary">bons plans</span>
          </h2>

          <p className="mt-3 text-white/80 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Inscris-toi à notre newsletter pour recevoir les meilleures offres,
            les nouveautés et des conseils pour vendre plus vite.
          </p>

          {submitted ? (
            <div className="mt-8 flex items-center justify-center gap-2 text-primary font-semibold text-lg">
              <FiCheck className="h-5 w-5" />
              Merci ! Tu es maintenant inscrit.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 max-w-md mx-auto px-2"
            >
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ton adresse email"
                  required
                  className="w-full h-12 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm pl-5 pr-14 text-sm text-white placeholder:text-white/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-50"
                  aria-label="S'inscrire"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiSend className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
