"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import BlurText from "@/components/ui/blur-text";

const funnyTexts = [
  "Oups ! Cette page a été vendue avant ton arrivée.",
  "404 : Article introuvable dans le placard.",
  "On dirait que cette page est partie en fripe !",
  "Cette page a déjà trouvé preneur, désolé !",
  "Même FripCash ne retrouve pas cette page.",
];

export default function NotFound() {
  const router = useRouter();
  const [textIndex, setTextIndex] = useState(0);

  const cycleText = useCallback(() => {
    setTextIndex((prev) => (prev + 1) % funnyTexts.length);
  }, []);

  // Auto-cycle the text every 4 seconds
  useEffect(() => {
    const interval = setInterval(cycleText, 4000);
    return () => clearInterval(interval);
  }, [cycleText]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 grid-cols-1 gap-8 items-center">
        {/* Left — SVG illustration */}
        <div className="flex justify-center lg:justify-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/not-found.svg"
            alt="404 Error"
            className="w-full h-auto max-w-md"
          />
        </div>

        {/* Right — content */}
        <div className="text-center lg:text-left">
          <BlurText
            text="Erreur 404"
            delay={80}
            animateBy="letters"
            direction="top"
            stepDuration={0.25}
            animationKey={`label-${textIndex}`}
            className="text-sm font-medium text-primary tracking-widest uppercase mb-2"
          />

          <BlurText
            text={funnyTexts[textIndex]}
            delay={80}
            animateBy="words"
            direction="top"
            stepDuration={0.3}
            animationKey={textIndex}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4"
          />

          <BlurText
            text="La page que tu cherches est introuvable ou a été déplacée."
            delay={60}
            animateBy="words"
            direction="bottom"
            stepDuration={0.3}
            animationKey={`desc-${textIndex}`}
            className="text-muted-foreground text-base sm:text-lg mb-2"
          />

          <BlurText
            text="(On est presque sûrs que ce n'est pas de ta faute... probablement.)"
            delay={50}
            animateBy="words"
            direction="bottom"
            stepDuration={0.25}
            animationKey={`note-${textIndex}`}
            className="text-muted-foreground/60 text-sm mb-8 italic"
          />

          <div
            className="flex flex-wrap gap-4 justify-center lg:justify-start"
            style={{
              opacity: 0,
              animation: "fade-in-up 0.6s ease forwards",
              animationDelay: "0.8s",
            }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Retour à l&apos;accueil
              <FiArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 border border-primary text-primary font-semibold px-6 py-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Revenir en arrière
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
