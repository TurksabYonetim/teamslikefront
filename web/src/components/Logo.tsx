import logoFull from "@/assets/logo/teamslike_logo_light.svg";
import logoIcon from "@/assets/logo/teamslike_icon.svg";

/**
 * TeamsLike markası.
 * - variant="full": ikon + "Teamslike" yazısı (açık zeminler için)
 * - variant="icon": yalnızca mavi sohbet-balonu ikonu
 */
export function Logo({
  className,
  variant = "full",
  alt = "TeamsLike",
}: {
  className?: string;
  variant?: "full" | "icon";
  alt?: string;
}) {
  const src = variant === "icon" ? logoIcon : logoFull;
  return (
    <img
      src={src}
      alt={alt}
      className={className ?? (variant === "icon" ? "w-8 h-8" : "h-9")}
    />
  );
}
