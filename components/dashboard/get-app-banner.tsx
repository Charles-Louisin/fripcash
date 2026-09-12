import { Smartphone } from "lucide-react";
import { AppStoreBadges } from "@/components/app-store-badges";

type GetAppBannerProps = {
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
};

/**
 * Pushes advanced role flows (livreur, commerce local, enseigne, sell hub)
 * to the mobile app — website dashboard stays a thin account area.
 */
export function GetAppBanner({
  title = "Fonctions avancées dans l'app",
  description = "Livreur, commerce de proximité, enseignes, import Excel et suivi de missions — c'est dans l'application FripCash.",
  compact = false,
  className = "",
}: GetAppBannerProps) {
  if (compact) {
    return (
      <div
        className={`flex flex-col gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Smartphone className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <AppStoreBadges size="sm" className="shrink-0" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card px-5 py-6 sm:px-6 ${className}`}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-lg space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
            <Smartphone className="size-3" />
            Application mobile
          </div>
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <AppStoreBadges className="shrink-0" />
      </div>
    </div>
  );
}
