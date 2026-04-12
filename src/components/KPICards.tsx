import { CalendarCheck, DoorOpen, Euro, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { KPIs, MonthlyStats } from "@/types/dashboard";

interface KPICardsProps {
  kpis?: KPIs;
  monthlyStats?: MonthlyStats | null;
}

export function KPICards({ kpis, monthlyStats }: KPICardsProps) {
  const data = kpis || {
    totalReservations: 0,
    activeRooms: 0,
    totalRooms: 0,
    availableGameMasters: 0,
    totalGameMasters: 0,
  };
  const monthly = monthlyStats || { totalGroups: 0, estimatedRevenue: 0, occupationEstimate: 0, isEstimated: true };

  const cards = [
    {
      title: "Reservas Totales",
      value: String(data.totalReservations),
      icon: CalendarCheck,
      estimated: false,
    },
    {
      title: "Salas Activas",
      value: `${data.activeRooms}/${data.totalRooms}`,
      icon: DoorOpen,
      estimated: false,
    },
    {
      title: "Facturación",
      value: `${monthly.estimatedRevenue.toLocaleString("es-ES")} €`,
      icon: Euro,
      estimated: true,
    },
    {
      title: "Ocupación",
      value: `${monthly.occupationEstimate}%`,
      icon: BarChart3,
      estimated: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((kpi) => (
        <Card
          key={kpi.title}
          className="border-border/50"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[11px] font-medium text-muted-foreground">{kpi.title}</p>
              </div>
              {kpi.estimated && (
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-0 font-normal"
                >
                  Est.
                </Badge>
              )}
            </div>
            <p className="text-xl font-bold text-foreground tracking-tight">{kpi.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
