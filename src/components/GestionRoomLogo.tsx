interface GestionRoomLogoProps {
  collapsed?: boolean;
  variant?: "light" | "dark";
  size?: "default" | "lg";
}

export function GestionRoomLogo({ collapsed = false, variant = "light", size = "default" }: GestionRoomLogoProps) {
  const isLarge = size === "lg";
  const logoSrc = variant === "dark" ? "/logo-mark-light.svg" : "/logo-mark-dark.svg";

  return (
    <div className={`flex items-center ${isLarge ? "flex-col gap-3" : "gap-2.5 px-0"}`}>
      <img
        src={logoSrc}
        alt="GestionRoom"
        className={`shrink-0 object-contain ${isLarge ? "h-16 w-16" : "h-8 w-8"}`}
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
