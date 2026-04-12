import { Euro, Users, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MonthlyStats } from "@/types/dashboard";

interface MonthlyKPIsProps {
  stats?: MonthlyStats | null;
}

export function MonthlyKPIs({ stats }: MonthlyKPIsProps) {
  const data = stats || { totalGroups: 0, estimatedRevenue: 0, occupationEstimate: 0, isEstimated: true };

  const cards = [
    {
      title: "Facturación del Mes",
      value: `${data.estimatedRevenue.toLocaleString("es-ES")} €`,
      icon: Euro,
      color: "text-emerald-600 bg-emerald-500/10",
      estimated: true,
      estimateLabel: "Estimado",
    },
    {
      title: "Grupos del Mes",
      value: data.totalGroups,
      icon: Users,
      color: "text-blue-600 bg-blue-500/10",
      estimated: false,
      estimateLabel: "",
    },
    {
      title: "Ocupación del Mes",
      value: `${data.occupationEstimate}%`,
      icon: BarChart3,
      color: "text-amber-600 bg-amber-500/10",
      estimated: true,
      estimateLabel: "Estimada",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow duration-150 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                  {card.estimated && (
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-0 font-normal"
                    >
                      {card.estimateLabel}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground tracking-tight">{card.value}</p>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", card.color)}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
