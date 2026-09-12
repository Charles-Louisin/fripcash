import { AppStoreBadges } from "@/components/app-store-badges";
import { Smartphone } from "lucide-react";

export function AppDownloadSection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 sm:px-10 sm:py-12">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10" />
        <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-primary/5" />

        <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Smartphone className="size-3.5" />
              Application mobile
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Emporte FripCash partout avec toi
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
              Achète, vends et suis tes livraisons depuis ton téléphone — sur
              iPhone et Android.
            </p>
          </div>

          <AppStoreBadges />
        </div>
      </div>
    </section>
  );
}
