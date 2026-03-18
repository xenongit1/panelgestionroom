import logoWhite from "@/assets/gestionroom-logo-white.png";

interface GestionRoomLogoProps {
  collapsed?: boolean;
  variant?: "light" | "dark";
  size?: "default" | "lg";
}

export function GestionRoomLogo({ collapsed = false, variant = "light", size = "default" }: GestionRoomLogoProps) {
  const isLarge = size === "lg";

  return (
    <div className={`flex items-center ${isLarge ? "flex-col gap-3" : "gap-2.5 px-2"}`}>
      <img
        src={logoWhite}
        alt="GestionRoom"
        className={`shrink-0 object-contain ${isLarge ? "h-16 w-16" : "h-9 w-9"} ${variant === "dark" ? "invert" : ""}`}
      />
      {!collapsed && (
        <div className={`flex flex-col ${isLarge ? "items-center" : ""}`}>
          <span
            className={`font-bold tracking-tight ${isLarge ? "text-xl" : "text-sm"} ${
              variant === "dark" ? "text-foreground" : "text-sidebar-accent-foreground"
            }`}
          >
            GestionRoom
          </span>
          <span
            className={`leading-none ${isLarge ? "text-xs" : "text-[10px]"} ${
              variant === "dark" ? "text-muted-foreground" : "text-sidebar-muted"
            }`}
          >
            Panel de Control
          </span>
        </div>
      )}
    </div>
  );
}
