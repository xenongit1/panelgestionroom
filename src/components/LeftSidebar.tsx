import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  DoorOpen,
  Users,
  Settings,
  CreditCard,
  ExternalLink,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  MoreVertical,
} from "lucide-react";
import { GestionRoomLogo } from "./GestionRoomLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";

const navGroups = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", path: "/", icon: LayoutDashboard },
      { title: "Reservas", path: "/reservas", icon: CalendarCheck, badge: "New" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { title: "Salas", path: "/salas", icon: DoorOpen },
      { title: "Game Masters", path: "/game-masters", icon: Users },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Ajustes", path: "/ajustes", icon: Settings },
    ],
  },
];

interface LeftSidebarProps {
  username: string;
  companyName: string | null;
  ownerName?: string | null;
  email?: string | null;
}

export function LeftSidebar({ username, companyName, ownerName, email }: LeftSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarMode, setSidebarMode } = useTheme();
  const collapsed = sidebarMode === "icon";

  const displayName = ownerName || companyName || username || "Usuario";
  const displayEmail = email || `${username}@gestionroom.com`;

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-all duration-300 shrink-0 h-screen",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Header: Logo + Collapse toggle */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
        <GestionRoomLogo collapsed={collapsed} />
        <button
          onClick={() => setSidebarMode(collapsed ? "default" : "icon")}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.title}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Unlock card */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl bg-muted/50 border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Unlock Everything</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Accede a todas las funcionalidades premium y gestiona tu escape room sin límites.
          </p>
          <Button
            size="sm"
            className="w-full text-xs h-8"
            onClick={() => window.open("https://gestionroom.com/precios", "_blank")}
          >
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
            Get Full Access
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}

      {/* User footer */}
      <div className={cn("border-t border-sidebar-border p-3", collapsed ? "flex justify-center" : "")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {displayEmail}
                </p>
              </div>
              <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0">
                <MoreVertical className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
