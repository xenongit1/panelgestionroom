import logoWhite from "@/assets/gestionroom-logo-white.png";

interface GestionRoomLogoProps {
  collapsed?: boolean;
  variant?: "light" | "dark";
}

export function GestionRoomLogo({ collapsed = false, variant = "light" }: GestionRoomLogoProps) {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <img
        src={logoWhite}
        alt="GestionRoom"
        className={`h-9 w-9 shrink-0 object-contain ${variant === "dark" ? "invert" : ""}`}
      />
      {!collapsed && (
        <div className="flex flex-col">
          <span
            className={`text-sm font-bold tracking-tight ${
              variant === "dark" ? "text-foreground" : "text-sidebar-accent-foreground"
            }`}
          >
            GestionRoom
          </span>
          <span
            className={`text-[10px] leading-none ${
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
