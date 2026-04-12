import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Reserva } from "@/types/dashboard";

type StatusFilter = "todas" | "confirmada" | "pendiente" | "cancelada";

const statusStyles: Record<string, string> = {
  confirmada: "bg-success/10 text-success border-0",
  pendiente: "bg-warning/10 text-warning border-0",
  cancelada: "bg-destructive/10 text-destructive border-0",
};

const filters: { label: string; value: StatusFilter }[] = [
  { label: "Todas", value: "todas" },
  { label: "Confirmadas", value: "confirmada" },
  { label: "Pendientes", value: "pendiente" },
  { label: "Canceladas", value: "cancelada" },
];

interface ReservationsTableProps {
  reservations: Reserva[];
}

export function ReservationsTable({ reservations }: ReservationsTableProps) {
  const [filter, setFilter] = useState<StatusFilter>("todas");
  const isMobile = useIsMobile();

  const filtered =
    filter === "todas"
      ? reservations
      : reservations.filter((r) => r.status === filter);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base">Últimas Reservas</CardTitle>
          <div className="flex gap-1">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "text-xs h-7 px-2.5",
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            Sin reservas
          </div>
        ) : isMobile ? (
          <div className="divide-y divide-border/50">
            {filtered.map((r) => (
              <div key={r.id} className="px-4 py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{r.client_name}</span>
                  <Badge variant="secondary" className={cn("text-[10px] capitalize shrink-0", statusStyles[r.status])}>
                    {r.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.salas?.name || "—"} · {r.date} · {r.time}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Cliente</TableHead>
                <TableHead>Sala</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead className="pr-5 text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer transition-colors duration-150 hover:bg-accent/50"
                >
                  <TableCell className="pl-5 font-medium text-foreground">{r.client_name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.salas?.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
                  <TableCell className="text-muted-foreground">{r.time}</TableCell>
                  <TableCell className="pr-5 text-right">
                    <Badge variant="secondary" className={cn("text-[11px] capitalize", statusStyles[r.status])}>
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
