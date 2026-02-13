"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export function CtaSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="relative overflow-hidden bg-primary rounded-2xl px-6 py-16 sm:px-12 sm:py-20 md:px-20">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Prêt à vider ton placard ?
          </h2>

          <p className="mt-4 text-white/80 text-base sm:text-lg max-w-lg leading-relaxed">
            Rejoins des milliers de vendeurs sur FripCash. C&apos;est gratuit,
            rapide et sécurisé.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link href="/inscription" className="group flex items-center gap-3 bg-white hover:bg-white/95 text-primary font-semibold text-base pl-7 pr-2 h-13 rounded-full transition-colors">
              Commencer à vendre
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-white transition-transform group-hover:translate-x-0.5">
                <FiArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <Link href="/eco-responsabilite" className="text-white/90 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors">
              En savoir plus
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
