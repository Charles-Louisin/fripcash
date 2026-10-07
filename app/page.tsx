import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { InfoBanner } from "@/components/info-banner";
import { CategoriesGrid } from "@/components/categories-grid";
import { ProductGrid } from "@/components/product-grid";
import { NewProductsSlider } from "@/components/new-products-slider";
import { CtaSection } from "@/components/cta-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FaqSection } from "@/components/faq-section";
import { NewsletterSection } from "@/components/newsletter-section";
import { AppDownloadSection } from "@/components/app-download-section";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { ShopsStrip } from "@/components/shops-strip";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AppSheet />
      <HeroSection />
      <InfoBanner message="Les frais de port sont calculés lors du paiement." />
      <CategoriesGrid />
      <ShopsStrip
        title="Commerces locaux"
        shopKind="proximite"
        large
        alwaysShow
        href="/recherche?tab=boutiques&type=proximite"
      />
      <ShopsStrip
        title="Enseignes"
        shopKind="enseigne"
        large
        alwaysShow
        href="/recherche?tab=boutiques&type=enseigne"
      />
      <ShopsStrip title="Nouvelles boutiques" createdWithinDays={7} />
      <section className="container mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Articles populaires
        </h2>
        <ProductGrid />
      </section>
      <NewProductsSlider />
      <TestimonialsSection />
      <CtaSection />
      <AppDownloadSection />
      <FaqSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
