import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import { LuPhoneCall } from "react-icons/lu";
import { MdLocationOn } from "react-icons/md";

export function Footer() {
  return (
    <div className="relative w-full">
      {/* Overlapping curved top */}
      <div className="absolute -top-8 left-0 w-full z-10 flex">
        <div className="w-full h-16 bg-background rounded-tl-[3rem] rounded-tr-[3rem] shadow-md" />
      </div>

      <footer
        className="relative w-full bg-background text-foreground pt-20 pb-6 px-4 sm:px-6 lg:px-8 z-20"
        style={{ borderTopLeftRadius: "3rem", borderTopRightRadius: "3rem" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand & Social */}
            <div>
              <Link href="/" className="inline-block mb-3 -my-12">
                <Image
                  src="/images/logo.png"
                  alt="FripCash"
                  width={300}
                  height={300}
                  className="h-36 w-auto"
                />
              </Link>
              <p className="mb-6 text-muted-foreground text-sm leading-relaxed">
                Ta plateforme de confiance pour acheter et vendre des articles de
                seconde main. Donne une seconde vie à tes vêtements et gagne de
                l&apos;argent facilement.
              </p>
              <div className="flex gap-3 mb-6">
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                >
                  <FaInstagram />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                >
                  <FaTwitter />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                >
                  <FaLinkedinIn />
                </a>
              </div>
            </div>

            {/* Entreprise */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-foreground">
                Entreprise
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/a-propos"
                    className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors"
                  >
                    À propos de FripCash
                  </Link>
                </li>
                <li>
                  <Link
                    href="/securite"
                    className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors"
                  >
                    Sécurité &amp; Confiance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/eco-responsabilite"
                    className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors"
                  >
                    Eco-Responsabilité
                  </Link>
                </li>
                <li>
                  <Link
                    href="/confidentialite"
                    className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors"
                  >
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                    href="/conditions"
                    className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors"
                  >
                    Conditions générales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/parametres"
                    className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors"
                  >
                    Se désinscrire de la newsletter
                  </Link>
                </li>
              </ul>
            </div>

            {/* Comment ça marche */}
            <div>
              <Link href="/comment-ca-marche" className="text-lg font-bold mb-3 text-foreground hover:text-primary transition-colors block">
                Comment ça marche
              </Link>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/paiement-bloque"
                    className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors"
                  >
                    Paiement bloqué
                  </Link>
                </li>
                <li>
                  <Link
                    href="/commission"
                    className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors"
                  >
                    Commission
                  </Link>
                </li>
                <li>
                  <Link
                    href="/livraison"
                    className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors"
                  >
                    Livraison
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info Row */}
          <div className="border-t border-border pt-6 pb-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div className="flex items-center gap-3">
              <TfiEmail className="text-primary text-lg" />
              <div>
                <div className="font-bold text-xs text-muted-foreground">
                  EMAIL
                </div>
                <div className="text-foreground">support@fripcash.com</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LuPhoneCall className="text-primary text-lg" />
              <div>
                <div className="font-bold text-xs text-muted-foreground">
                  TÉLÉPHONE
                </div>
                <div className="text-foreground">+237 673 74 61 33</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MdLocationOn className="text-primary text-lg" />
              <div>
                <div className="font-bold text-xs text-muted-foreground">
                  ADRESSE
                </div>
                <div className="text-foreground">Cameroun</div>
              </div>
            </div>
          </div>


          {/* Copyright */}
          <div className="border-t border-border mt-4 pt-4 flex flex-col items-center justify-center gap-4">
            <span className="text-muted-foreground text-base font-semibold">
              © {new Date().getFullYear()} FripCash. Tous droits réservés.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
