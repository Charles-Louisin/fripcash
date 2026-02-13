"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FiArrowRight, FiPlayCircle } from "react-icons/fi";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.png"
          alt="Vêtements sur cintres"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col items-start justify-center min-h-[520px] md:min-h-[600px] text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl">
            Prêt à transformer ce que tu as déjà en{" "}
            <span className="text-primary">cash</span> ?
          </h1>

          <div className="flex flex-col sm:flex-row items-start gap-4 mt-10">
            {/* Primary CTA */}
            <Link href="/inscription" className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-semibold text-base pl-7 pr-2 h-13 rounded-full transition-colors">
              Commencer à vendre
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5">
                <FiArrowRight className="h-4 w-4" />
              </span>
            </Link>

            {/* How it works - opens dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white font-semibold text-base px-8 h-12 rounded-full gap-2"
                >
                  <FiPlayCircle className="h-5 w-5" />
                  Découvrir comment ça marche
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Comment ça marche ?
                  </DialogTitle>
                  <DialogDescription>
                    Vends tes articles en quelques étapes simples.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Prends en photo
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Prends quelques photos de l&apos;article que tu veux
                        vendre. Ajoute un titre, une description et fixe ton
                        prix.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Publie ton annonce
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ton article est visible par des milliers d&apos;acheteurs.
                        Tu reçois des messages et des offres directement.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Envoie et reçois ton argent
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Une fois vendu, envoie le colis. Le paiement est
                        sécurisé et transféré directement sur ton compte.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button className="w-full rounded-full h-11 font-semibold gap-2" asChild>
                    <Link href="/inscription">
                      Commencer à vendre
                      <FiArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Link
                    href="/comment-ca-marche"
                    className="text-sm text-center font-medium text-primary hover:underline"
                  >
                    Voir le guide complet
                  </Link>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
}
