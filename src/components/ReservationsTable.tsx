import { useState } from "react";
import { mockReservations } from "@/data/mockData";
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

export function ReservationsTable() {
  const [filter, setFilter] = useState<StatusFilter>("todas");

  const filtered =
    filter === "todas"
      ? mockReservations
      : mockReservations.filter((r) => r.status === filter);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg">Últimas Reservas</CardTitle>
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "text-xs h-8",
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
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Cliente</TableHead>
              <TableHead>Sala</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Game Master</TableHead>
              <TableHead className="pr-6 text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow
                key={r.id}
                className="cursor-pointer transition-colors duration-150 hover:bg-accent/50"
              >
                <TableCell className="pl-6 font-medium text-foreground">{r.client}</TableCell>
                <TableCell className="text-muted-foreground">{r.room}</TableCell>
                <TableCell className="text-muted-foreground">{r.date}</TableCell>
                <TableCell className="text-muted-foreground">{r.time}</TableCell>
                <TableCell className="text-muted-foreground">{r.gameMaster}</TableCell>
                <TableCell className="pr-6 text-right">
                  <Badge variant="secondary" className={cn("text-[11px] capitalize", statusStyles[r.status])}>
                    {r.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
