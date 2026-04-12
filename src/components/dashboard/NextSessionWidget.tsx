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
      <Card className="border-dashed border-border/60">
        <CardContent className="p-4 flex items-center gap-3 text-center justify-center">
          <Clock className="h-5 w-5 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Sin sesiones pendientes hoy</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Countdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Próximo grupo</span>
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight font-mono">
              {countdown}
            </p>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-border" />

          {/* Details */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{session.client_name}</span>
              <span>· {session.players} jug.</span>
            </span>
            <span className="flex items-center gap-1.5">
              <DoorOpen className="h-3.5 w-3.5" />
              {session.salas?.name || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {session.time?.slice(0, 5)}
            </span>
            {session.notes && (
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="italic truncate max-w-[200px]">{session.notes}</span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
