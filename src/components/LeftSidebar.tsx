import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  DoorOpen,
  Users,
  Settings,
  Eye,
  EyeOff,
  Copy,
  CreditCard,
  ChevronLeft,
} from "lucide-react";
import { GestionRoomLogo } from "./GestionRoomLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockProfile } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Reservas", path: "/reservas", icon: CalendarCheck },
  { title: "Salas", path: "/salas", icon: DoorOpen },
  { title: "Game Masters", path: "/game-masters", icon: Users },
  { title: "Ajustes", path: "/ajustes", icon: Settings },
];

export function LeftSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(mockProfile.access_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                AV
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-accent-foreground truncate">
                {mockProfile.business_name}
              </p>
              <p className="text-xs text-sidebar-muted truncate">{mockProfile.owner_name}</p>
            </div>
          </div>

          {/* Access Key */}
          <div className="rounded-md bg-sidebar-accent/50 p-2.5 space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-sidebar-muted">
              Clave de Acceso
            </p>
            <div className="flex items-center gap-1.5">
              <code
                className={cn(
                  "flex-1 text-xs font-mono text-sidebar-accent-foreground transition-all",
                  !showKey && "blur-md select-none"
                )}
              >
                {mockProfile.access_key}
              </code>
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-1 rounded hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-accent-foreground transition-colors"
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={copyKey}
                className="p-1 rounded hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-accent-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            {copied && (
              <p className="text-[10px] text-sidebar-primary animate-in fade-in">¡Copiada!</p>
            )}
          </div>

          <Button
            size="sm"
            className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground text-xs"
          >
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
            Gestionar Suscripción
          </Button>
        </div>
      )}
    </aside>
  );
}
