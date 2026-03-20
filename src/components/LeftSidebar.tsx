import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  DoorOpen,
  Users,
  Settings,
  CreditCard,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { GestionRoomLogo } from "./GestionRoomLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Reservas", path: "/reservas", icon: CalendarCheck },
  { title: "Salas", path: "/salas", icon: DoorOpen },
  { title: "Game Masters", path: "/game-masters", icon: Users },
  { title: "Ajustes", path: "/ajustes", icon: Settings },
];

interface LeftSidebarProps {
  username: string;
  companyName: string | null;
}

export function LeftSidebar({ username, companyName }: LeftSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const initials = (companyName || username || "GR")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 relative shrink-0",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm hover:bg-accent transition-colors"
      >
        <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
      </button>

      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
        <GestionRoomLogo collapsed={collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </button>
          );
        })}
      </nav>

      {/* Profile section */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 bg-sidebar-primary">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-accent-foreground truncate">
                {companyName || "Mi Negocio"}
              </p>
              <p className="text-xs text-sidebar-muted truncate">@{username}</p>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground text-xs"
            onClick={() => window.open("https://gestionroom.com/precios", "_blank")}
          >
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
            Gestionar Suscripción
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </aside>
  );
}
