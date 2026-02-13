import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side — image panel */}
      <div className="relative hidden lg:flex lg:w-1/2">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=1600&fit=crop)",
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content on image */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="FripCash"
              width={120}
              height={120}
            />
          </Link>

          {/* Text */}
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Bienvenue sur FripCash
            </h2>
            <p className="mt-3 text-white/80 text-base max-w-sm leading-relaxed">
              Achète et vends des articles de seconde main en toute simplicité
              et sécurité.
            </p>
          </div>
        </div>
      </div>

      {/* Right side — form panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="FripCash"
              width={100}
              height={100}
            />
          </Link>
        </div>

        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary hover:underline transition-colors mb-6"
          >
            <FiArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
