import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockProfile } from "@/data/mockData";

export function TopBar() {
  return (
    <div className="flex items-center justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Bienvenido, {mockProfile.owner_name}
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
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            3
          </span>
        </button>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            AV
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
