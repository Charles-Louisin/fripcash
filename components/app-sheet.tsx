"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useToast } from "@/components/ui/toast";
import {
  FiBell,
  FiFileText,
  FiSettings,
  FiCreditCard,
  FiShoppingBag,
  FiUser,
  FiLogOut,
  FiAlertCircle,
} from "react-icons/fi";
import {
  GiDress,
  GiPoloShirt,
  GiBabyFace,
  GiSofa,
  GiCircuitry,
  GiGamepad,
  GiTennisBall,
  GiBookshelf,
} from "react-icons/gi";
import { useCategories } from "@/hooks/use-categories";
import { useMe, useLogout } from "@/hooks/use-auth";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Femme: GiDress,
  Homme: GiPoloShirt,
  Enfant: GiBabyFace,
  Maison: GiSofa,
  Électronique: GiCircuitry,
  Loisirs: GiBookshelf,
  Sport: GiTennisBall,
  Divertissement: GiGamepad,
};

const accountLinks = [
  { label: "Mon profil", href: "/dashboard/profil", icon: FiUser },
  { label: "Mes paramètres", href: "/dashboard/parametres", icon: FiSettings },
  { label: "Mon porte-monnaie", href: "/dashboard/porte-monnaie", icon: FiCreditCard },
  { label: "Mes commandes", href: "/dashboard/commandes", icon: FiShoppingBag },
];

export function AppSheet() {
  const { sheetOpen, sheetContent, closeSheet } = useUIStore();
  const { toast } = useToast();
  const { data: user, isFetched } = useMe();
  const logout = useLogout();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("fripcash-token");
  const isLoggedIn = !!user || (hasToken && !isFetched);
  const { data: rawCategories = [] } = useCategories();
  const menuCategories = rawCategories.map((cat: any) => ({
    label: cat.name,
    href: `/produits?category=${encodeURIComponent(cat.name)}`,
    icon: ICON_MAP[cat.name] || GiBookshelf,
  }));

  return (
    <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent
        side="left"
        className="w-full max-w-sm p-0 flex flex-col"
      >
        {/* ── Menu content ── */}
        {sheetContent === "menu" && (
          <>
            {/* Header: Logo */}
            <SheetHeader className="px-6 pt-6 pb-6">
              <SheetTitle className="flex items-center">
                <Image
                  src="/images/fripcash-logo.png"
                  alt="FripCash"
                  width={120}
                  height={120}
                />
              </SheetTitle>
              <SheetDescription className="sr-only">
                Menu de navigation
              </SheetDescription>
            </SheetHeader>

            {/* Actions */}
            <div className="px-6 space-y-3">
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-full" asChild>
                <Link href={isLoggedIn ? "/dashboard/articles" : "/inscription"}>
                  {isLoggedIn ? "Mes articles" : "Vends tes articles"}
                </Link>
              </Button>

              {!isLoggedIn && (
                <Button
                  variant="outline"
                  className="w-full h-12 font-semibold text-base text-primary border-primary hover:bg-primary/5 rounded-full"
                  asChild
                >
                  <Link href="/connexion">S&apos;inscrire | Se connecter</Link>
                </Button>
              )}
              {isLoggedIn && (
                <Button variant="outline" className="w-full h-12 font-semibold text-base rounded-full" asChild>
                  <Link href="/dashboard">Mon tableau de bord</Link>
                </Button>
              )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Divider */}
              <div className="my-5 border-t" />

              {/* Account section - only when logged in */}
              {isLoggedIn && (
                <>
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Mon compte
                  </p>
                  <nav className="space-y-0.5 mb-2">
                    {accountLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeSheet}
                          className="flex items-center gap-3 px-2 py-3 rounded-md text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                        >
                          <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => {
                        closeSheet();
                        logout();
                        toast("Tu es déconnecté.", "info");
                        window.location.href = "/";
                      }}
                      className="flex items-center gap-3 px-2 py-3 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                    >
                      <FiLogOut className="h-5 w-5 shrink-0" />
                      Se déconnecter
                    </button>
                  </nav>
                </>
              )}

              {/* Divider */}
              <div className="my-5 border-t" />

              {/* Browse categories */}
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Parcourir
              </p>
              <nav className="space-y-0.5">
                {menuCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={closeSheet}
                      className="flex items-center gap-3 px-2 py-3 rounded-md text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                    >
                      <Icon className="h-5 w-5 text-primary shrink-0" />
                      {cat.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </>
        )}

        {/* ── Notifications content ── */}
        {sheetContent === "notifications" && (
          <>
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle className="flex items-center gap-2">
                <FiBell className="h-5 w-5" />
                Notifications
              </SheetTitle>
              <SheetDescription className="sr-only">
                Vos notifications
              </SheetDescription>
            </SheetHeader>
            <div className="px-6">
              <p className="text-sm text-muted-foreground">
                Aucune notification pour le moment.
              </p>
            </div>
          </>
        )}

        {/* ── Details content ── */}
        {sheetContent === "details" && (
          <>
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle className="flex items-center gap-2">
                <FiFileText className="h-5 w-5" />
                Détails
              </SheetTitle>
              <SheetDescription className="sr-only">
                Détails de l&apos;article
              </SheetDescription>
            </SheetHeader>
            <div className="px-6">
              <p className="text-sm text-muted-foreground">
                Détails de l&apos;article.
              </p>
            </div>
          </>
        )}
      </SheetContent>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <FiAlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Confirmer la déconnexion</DialogTitle>
            <DialogDescription className="text-center">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-3 sm:justify-center mt-4">
            <Button variant="outline" onClick={() => setLogoutOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setLogoutOpen(false);
                closeSheet();
                logout();
                toast("Tu es déconnecté.", "info");
                window.location.href = "/";
              }}
              className="flex-1"
            >
              Se déconnecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
