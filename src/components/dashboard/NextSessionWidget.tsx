import { useState, useEffect } from "react";
import { Clock, DoorOpen, User, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { NextSession } from "@/types/dashboard";

interface NextSessionWidgetProps {
  session: NextSession | null;
}

function useCountdown(targetTime: string | null) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!targetTime) {
      setRemaining("");
      return;
    }

    const update = () => {
      const now = new Date();
      const [h, m] = targetTime.split(":").map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setRemaining("Ahora");
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      if (hours > 0) {
        setRemaining(`${hours}h ${String(mins).padStart(2, "0")}m`);
      } else {
        setRemaining(`${mins}:${String(secs).padStart(2, "0")}`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return remaining;
}

export function NextSessionWidget({ session }: NextSessionWidgetProps) {
  const countdown = useCountdown(session?.time || null);

  if (!session) {
    return (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Próxima Sesión
        </h3>
        <Card className="border-dashed border-border/60">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2">
            <Clock className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Sin sesiones pendientes hoy</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Próxima Sesión
      </h3>
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5 space-y-3">
          {/* Countdown */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Próximo grupo en</span>
          </div>
          <p className="text-3xl font-bold text-foreground tracking-tight font-mono">
            {countdown}
          </p>

          {/* Details */}
          <div className="space-y-2 pt-1 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground font-medium">{session.client_name}</span>
              <span className="text-muted-foreground">· {session.players} jugadores</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DoorOpen className="h-3.5 w-3.5" />
              <span>{session.salas?.name || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{session.time?.slice(0, 5)}</span>
            </div>
            {session.notes && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span className="italic">{session.notes}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
