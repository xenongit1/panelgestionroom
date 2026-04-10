import logoWhite from "@/assets/gestionroom-logo-white.png";

interface GestionRoomLogoProps {
  collapsed?: boolean;
  variant?: "light" | "dark";
  size?: "default" | "lg";
}

export function GestionRoomLogo({ collapsed = false, variant = "light", size = "default" }: GestionRoomLogoProps) {
  const isLarge = size === "lg";

  // The source image is white. In light variant (light sidebar bg), invert it to black.
  // In dark variant (dark bg like auth pages), keep it white (no invert).
  // In dark mode with light variant, the sidebar bg is dark, so don't invert.
  const imgClass = variant === "dark"
    ? "" // dark variant = white logo on dark bg, no invert needed
    : "dark:invert-0 invert"; // light variant = invert to black in light mode, keep white in dark mode

  return (
    <div className={`flex items-center ${isLarge ? "flex-col gap-3" : "gap-2.5 px-0"}`}>
      <img
        src={logoWhite}
        alt="GestionRoom"
        className={`shrink-0 object-contain ${isLarge ? "h-16 w-16" : "h-8 w-8"} ${imgClass}`}
      />
      {!collapsed && (
        <div className={`flex flex-col ${isLarge ? "items-center" : ""}`}>
          <span
            className={`font-bold tracking-tight ${isLarge ? "text-xl" : "text-sm"} ${
              variant === "dark" ? "text-white" : "text-foreground"
            }`}
          >
            GestionRoom
          </span>
          {isLarge && (
            <span
              className={`leading-none text-xs ${
                variant === "dark" ? "text-white/60" : "text-muted-foreground"
              }`}
            >
              Panel de Control
            </span>
          )}
        </div>
      )}
    </div>
  );
}
