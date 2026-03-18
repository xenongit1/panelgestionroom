import { CalendarCheck, DoorOpen, UserPlus, Users, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KPIs } from "@/types/dashboard";

interface KPICardsProps {
  kpis?: KPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const data = kpis || {
    totalReservations: 0,
    activeRooms: 0,
    totalRooms: 0,
    availableGameMasters: 0,
    totalGameMasters: 0,
  };

  const cards = [
    {
      title: "Reservas Totales",
      subtitle: "Últimas registradas",
      value: data.totalReservations,
      icon: CalendarCheck,
      color: "text-primary bg-primary/10",
    },
    {
      title: "Salas Activas",
      subtitle: "En funcionamiento",
      value: `${data.activeRooms}/${data.totalRooms}`,
      icon: DoorOpen,
      color: "text-success bg-success/10",
    },
    {
      title: "Game Masters",
      subtitle: "Disponibles hoy",
      value: `${data.availableGameMasters}/${data.totalGameMasters}`,
      icon: Users,
      color: "text-warning bg-warning/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((kpi) => (
        <Card
          key={kpi.title}
          className="hover:shadow-md transition-shadow duration-150 border-border/50"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground">{kpi.subtitle}</p>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", kpi.color)}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
