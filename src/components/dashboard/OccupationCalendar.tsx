import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WeeklyDay } from "@/types/dashboard";

interface OccupationCalendarProps {
  days: WeeklyDay[];
}

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

function getOccupationColor(count: number, capacity: number): string {
  if (capacity === 0) return "bg-muted";
  const rate = count / capacity;
  if (rate >= 0.7) return "bg-emerald-500";
  if (rate >= 0.3) return "bg-amber-400";
  if (count > 0) return "bg-muted-foreground/30";
  return "bg-muted";
}

function getOccupationLabel(count: number, capacity: number): string {
  if (capacity === 0) return "Sin salas";
  const rate = Math.round((count / capacity) * 100);
  return `${count} reservas (${rate}%)`;
}

export function OccupationCalendar({ days }: OccupationCalendarProps) {
  if (!days || days.length === 0) return null;

  // Pad the first row to start on the correct weekday
  const firstDate = new Date(days[0].date + "T00:00:00");
  // JS: 0=Sun, we want 0=Mon
  const startDow = (firstDate.getDay() + 6) % 7;

  const cells: (WeeklyDay | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  cells.push(...days);
  // Pad to fill last row
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (WeeklyDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Ocupación — Próximos 14 días</h3>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Alta
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Media
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" /> Baja
            </span>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {rows.flat().map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }
            const dayNum = new Date(cell.date + "T00:00:00").getDate();
            const isToday = cell.date === today;
            return (
              <div
                key={cell.date}
                title={getOccupationLabel(cell.count, cell.capacity)}
                className={cn(
                  "aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 text-xs transition-colors cursor-default",
                  isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                )}
              >
                <span className={cn("text-[11px] font-medium", isToday ? "text-foreground" : "text-muted-foreground")}>
                  {dayNum}
                </span>
                <span className={cn("h-2 w-2 rounded-full", getOccupationColor(cell.count, cell.capacity))} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
