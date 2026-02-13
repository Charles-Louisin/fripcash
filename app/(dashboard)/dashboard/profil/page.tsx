"use client";

import { useState } from "react";
import { FiCamera, FiStar, FiCalendar } from "react-icons/fi";
import { mockCurrentUser } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";

export default function ProfilePage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: mockCurrentUser.name,
    pseudo: mockCurrentUser.pseudo,
    phone: mockCurrentUser.phone,
    bio: mockCurrentUser.bio,
  });

  const handleSave = () => {
    showToast("Profil mis à jour avec succès", "success");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon profil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez vos informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Informations personnelles</h3>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mockCurrentUser.avatar} alt={mockCurrentUser.name} className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <FiCamera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Photo de profil</p>
                <p className="text-xs text-muted-foreground">JPG, PNG. Max 2 Mo.</p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Pseudo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                    <input
                      type="text"
                      value={form.pseudo}
                      onChange={(e) => setForm({ ...form, pseudo: e.target.value })}
                      className="w-full h-10 pl-7 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Parlez de vous..."
                />
                <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/200 caractères</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="mt-4 h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Enregistrer les modifications
            </button>
          </div>
        </div>

        {/* Right - Public Preview */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground text-sm mb-4">Aperçu public</h3>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mockCurrentUser.avatar} alt={mockCurrentUser.name} className="w-full h-full object-cover" />
              </div>
              <p className="font-semibold text-foreground">{form.name}</p>
              <p className="text-sm text-muted-foreground">@{form.pseudo}</p>

              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(mockCurrentUser.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                  />
                ))}
                <span className="text-sm font-medium text-foreground ml-1">{mockCurrentUser.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{mockCurrentUser.reviewsCount} avis</p>
            </div>

            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FiCalendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Membre depuis</span>
                <span className="font-medium text-foreground ml-auto">
                  {new Date(mockCurrentUser.joinedDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ventes</span>
                <span className="font-medium text-foreground">{mockCurrentUser.salesCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Achats</span>
                <span className="font-medium text-foreground">{mockCurrentUser.purchasesCount}</span>
              </div>
            </div>
          </div>

          {form.bio && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground text-sm mb-2">Bio</h3>
              <p className="text-sm text-muted-foreground">{form.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
