import { CalendarCheck, DoorOpen, UserPlus, Users, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { kpiData } from "@/data/mockData";
import { cn } from "@/lib/utils";

const kpis = [
  {
    title: "Reservas Totales",
    subtitle: "Este mes",
    value: kpiData.totalReservations,
    trend: kpiData.totalReservationsTrend,
    icon: CalendarCheck,
    color: "text-primary bg-primary/10",
  },
  {
    title: "Salas Activas",
    subtitle: "En funcionamiento",
    value: kpiData.activeRooms,
    trend: null,
    icon: DoorOpen,
    color: "text-success bg-success/10",
  },
  {
    title: "Clientes Nuevos",
    subtitle: "Primera reserva",
    value: kpiData.newClients,
    trend: kpiData.newClientsTrend,
    icon: UserPlus,
    color: "text-warning bg-warning/10",
  },
  {
    title: "Game Masters",
    subtitle: "Disponibles hoy",
    value: `${kpiData.availableGameMasters}/${kpiData.totalGameMasters}`,
    trend: null,
    icon: Users,
    color: "text-[hsl(264,67%,60%)] bg-[hsl(264,67%,60%)]/10",
  },
];

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
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
            {kpi.trend !== null && (
              <div className="mt-3 flex items-center gap-1">
                {kpi.trend > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    kpi.trend > 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {kpi.trend > 0 ? "+" : ""}
                  {kpi.trend}%
                </span>
                <span className="text-xs text-muted-foreground">vs mes anterior</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
