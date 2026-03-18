import { Search, Bell, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Profile } from "@/types/dashboard";

interface TopBarProps {
  profile: Profile;
  onLogout?: () => void;
}

export function TopBar({ profile, onLogout }: TopBarProps) {
  const initials = (profile.company_name || profile.email || "GR")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Bienvenido, {profile.panel_username || profile.company_name || "Usuario"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar reservas, salas..."
            className="w-64 pl-9 bg-card border-border/50 h-9 text-sm"
          />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        {onLogout && (
          <button onClick={onLogout} className="relative flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:text-destructive hover:bg-accent transition-colors" title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </button>
        )}
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
