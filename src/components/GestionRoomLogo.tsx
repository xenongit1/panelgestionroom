import { Lock, Eye } from "lucide-react";

export function GestionRoomLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
        <Lock className="h-4 w-4 text-sidebar-primary-foreground" />
        <Eye className="absolute -right-0.5 -top-0.5 h-3 w-3 text-sidebar-primary-foreground opacity-80" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">GestionRoom</span>
          <span className="text-[10px] text-sidebar-muted leading-none">Panel de Control</span>
        </div>
      )}
    </div>
  );
}
