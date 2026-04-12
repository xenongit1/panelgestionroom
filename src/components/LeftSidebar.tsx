import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  DoorOpen,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navGroups = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", path: "/", icon: LayoutDashboard },
      { title: "Reservas", path: "/reservas", icon: CalendarCheck },
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
  onLogout?: () => void;
}

export function LeftSidebar({ username, companyName, ownerName, email, onLogout }: LeftSidebarProps) {
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
        "relative flex flex-col border-r border-sidebar-border text-foreground transition-all duration-300 shrink-0 h-screen bg-sidebar",
        collapsed ? "w-[72px]" : "w-[224px]"
      )}
    >
      {/* External collapse button */}
      <button
        onClick={() => setSidebarMode(collapsed ? "default" : "icon")}
        className="absolute -right-3 top-6 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-sm transition-colors"
        title={collapsed ? "Expandir" : "Colapsar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Header */}
      <div className="flex h-14 items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 min-w-0">
          <LayoutDashboard className="h-5 w-5 shrink-0 text-foreground" strokeWidth={1.5} />
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground truncate">GestionRoom</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
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
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.title}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className={cn("border-t border-sidebar-border p-3", collapsed ? "flex justify-center" : "")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-foreground text-xs font-semibold">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0">
                    <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/ajustes")}>
                    <Settings className="h-4 w-4 mr-2" strokeWidth={1.5} />
                    Ajustes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

/* Reusable nav content for the mobile Sheet */
export function MobileNavContent({ onNavigate, onLogout }: { onNavigate: (path: string) => void; onLogout?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        <LayoutDashboard className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        <span className="text-sm font-semibold text-foreground">GestionRoom</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      {onLogout && (
        <div className="border-t border-border p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
