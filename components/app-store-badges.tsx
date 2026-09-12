import { FaApple, FaGooglePlay } from "react-icons/fa";

/** Update these when the listings go live. */
export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL || "#";
export const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL || "#";

type AppStoreBadgesProps = {
  className?: string;
  /** `dark` = black badges for light backgrounds; `light` = white for dark panels */
  variant?: "dark" | "light";
  size?: "sm" | "md";
};

export function AppStoreBadges({
  className = "",
  variant = "dark",
  size = "md",
}: AppStoreBadgesProps) {
  const isLight = variant === "light";
  const height = size === "sm" ? "h-10" : "h-11";

  const base =
    "inline-flex items-center gap-2.5 rounded-lg px-3.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const darkStyle = "bg-zinc-950 text-white";
  const lightStyle = "bg-white text-zinc-950";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={APP_STORE_URL}
        target={APP_STORE_URL === "#" ? undefined : "_blank"}
        rel={APP_STORE_URL === "#" ? undefined : "noopener noreferrer"}
        aria-label="Télécharger sur l'App Store"
        className={`${base} ${height} ${isLight ? lightStyle : darkStyle}`}
      >
        <FaApple className="size-6 shrink-0" />
        <span className="flex flex-col items-start leading-none text-left">
          <span className="text-[9px] opacity-80">Télécharger dans</span>
          <span className="text-sm font-semibold tracking-tight">
            l&apos;App Store
          </span>
        </span>
      </a>

      <a
        href={PLAY_STORE_URL}
        target={PLAY_STORE_URL === "#" ? undefined : "_blank"}
        rel={PLAY_STORE_URL === "#" ? undefined : "noopener noreferrer"}
        aria-label="Disponible sur Google Play"
        className={`${base} ${height} ${isLight ? lightStyle : darkStyle}`}
      >
        <FaGooglePlay className="size-5 shrink-0" />
        <span className="flex flex-col items-start leading-none text-left">
          <span className="text-[9px] opacity-80">Disponible sur</span>
          <span className="text-sm font-semibold tracking-tight">
            Google Play
          </span>
        </span>
      </a>
    </div>
  );
}
