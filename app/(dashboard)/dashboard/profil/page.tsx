"use client";

import { useRef } from "react";
import {
  FiCamera,
  FiStar,
  FiCalendar,
  FiShoppingBag,
  FiPackage,
  FiMapPin,
  FiMail,
  FiPhone,
  FiEdit2,
  FiCheck,
} from "react-icons/fi";
import { useMe, useUpdateProfile } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { useMyArticles } from "@/hooks/use-articles";
import { useToast } from "@/components/ui/toast";
import { useProfileStore } from "@/stores/profile-store";

export default function ProfilePage() {
  const { showToast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { data: user, isLoading } = useMe();
  const { data: orders = [] } = useMyOrders();
  const { data: articles = [] } = useMyArticles();
  const updateProfileMut = useUpdateProfile();
  const { name, pseudo, phone, email, city, bio, avatar, updateProfile } =
    useProfileStore();

  const salesCount = orders.filter((o) => o.role === "seller").length;
  const purchasesCount = orders.filter((o) => o.role === "buyer").length;
  const articlesCount = articles.length;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("L'image ne doit pas dépasser 2 Mo", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfile({ avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const [firstName, ...lastParts] = name.split(" ");
    const lastName = lastParts.join(" ");
    updateProfileMut.mutate(
      { firstName, lastName, pseudo, phone, city, bio, avatar },
      {
        onSuccess: () => showToast("Profil mis à jour avec succès", "success"),
        onError: (err: any) =>
          showToast(err.message || "Erreur lors de la mise à jour", "error"),
      }
    );
  };

  const stats = [
    {
      label: "Ventes",
      value: salesCount,
      icon: FiShoppingBag,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Achats",
      value: purchasesCount,
      icon: FiPackage,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Annonces",
      value: articlesCount,
      icon: FiStar,
      color: "text-amber-500 bg-amber-50",
    },
    {
      label: "En vente",
      value: articles.filter((a) => a.status === "active").length,
      icon: FiEdit2,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon profil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-foreground leading-tight">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left - Edit Form (wider) */}
        <div className="xl:col-span-3 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-5">Informations personnelles</h3>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-border ring-offset-2 ring-offset-background bg-muted">
                  {avatar && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <FiCamera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Photo de profil</p>
                <p className="text-xs text-muted-foreground">JPG, PNG. Max 2 Mo.</p>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-xs text-primary font-medium mt-1 hover:underline"
                >
                  Changer la photo
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Pseudo</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                    <input
                      type="text"
                      value={pseudo}
                      onChange={(e) => updateProfile({ pseudo: e.target.value })}
                      className="w-full h-11 pl-8 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateProfile({ email: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Téléphone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => updateProfile({ phone: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Localisation</label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => updateProfile({ city: e.target.value })}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    placeholder="Ville, Pays"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) updateProfile({ bio: e.target.value });
                  }}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-colors"
                  placeholder="Parlez de vous..."
                />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/200 caractères</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={updateProfileMut.isPending}
              className="mt-5 h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FiCheck className="h-4 w-4" />
              {updateProfileMut.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>

        {/* Right - Public Preview */}
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground text-sm mb-5">Aperçu public</h3>

            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20 shrink-0 bg-muted">
                  {avatar && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-base truncate">{name}</p>
                  <p className="text-sm text-muted-foreground">@{pseudo}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`h-3.5 w-3.5 ${i < Math.floor(user?.rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="text-xs font-medium text-foreground ml-1">{user?.rating ?? 0}</span>
                    <span className="text-xs text-muted-foreground">({user?.reviewsCount ?? 0})</span>
                  </div>
                </div>
              </div>

              {bio && (
                <p className="text-sm text-muted-foreground mt-4 line-clamp-3">{bio}</p>
              )}

              {city && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                  <FiMapPin className="h-3 w-3" />
                  <span>{city}</span>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <FiCalendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Membre depuis</span>
                <span className="font-medium text-foreground ml-auto">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FiShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Articles en vente</span>
                <span className="font-medium text-foreground ml-auto">{user?.articlesCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FiPackage className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Ventes réalisées</span>
                <span className="font-medium text-foreground ml-auto">{user?.salesCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FiPhone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Téléphone</span>
                <span className="font-medium text-foreground ml-auto">{phone}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h4 className="text-sm font-semibold text-foreground mb-2">Conseils pour ton profil</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Ajoute une photo claire pour gagner la confiance des acheteurs
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Rédige une bio pour te présenter à la communauté
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Vérifie ton numéro pour sécuriser ton compte
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
