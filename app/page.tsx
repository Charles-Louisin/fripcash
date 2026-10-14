import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { InfoBanner } from "@/components/info-banner";
import { HomeSpotlight } from "@/components/home-spotlight";
import { NewProductsSlider } from "@/components/new-products-slider";
import { CtaSection } from "@/components/cta-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FaqSection } from "@/components/faq-section";
import { NewsletterSection } from "@/components/newsletter-section";
import { AppDownloadSection } from "@/components/app-download-section";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AppSheet />
      <HeroSection />
      <HomeSpotlight />
      <InfoBanner message="Les frais de port sont calculés lors du paiement." />
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
