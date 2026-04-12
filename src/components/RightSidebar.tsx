import { Badge } from "@/components/ui/badge";
import { Clock, DoorOpen, User, Zap } from "lucide-react";
import { NextSessionWidget } from "@/components/dashboard/NextSessionWidget";
import type { Reserva, NextSession } from "@/types/dashboard";

interface RightSidebarProps {
  todayReservations: Reserva[];
  nextSession?: NextSession | null;
}

export function RightSidebar({ todayReservations, nextSession }: RightSidebarProps) {
  return (
    <aside className="hidden xl:flex w-[300px] shrink-0 flex-col border-l bg-card p-5 space-y-6 overflow-y-auto">
      {/* Próxima Sesión */}
      <NextSessionWidget session={nextSession ?? null} />

      {/* Integraciones */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Integraciones
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Stripe</p>
              <p className="text-xs text-muted-foreground">Pagos y facturación</p>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0">
              Conectado
            </Badge>
          </div>
        </div>
      </div>

      {/* Próximas Reservas Hoy */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Próximas Reservas — Hoy
        </h3>
        {todayReservations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sin reservas para hoy</p>
        ) : (
          <div className="space-y-1">
            {todayReservations.map((res, i) => (
              <div
                key={res.id}
                className="relative flex gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors group"
              >
                {i < todayReservations.length - 1 && (
                  <div className="absolute left-[23px] top-[38px] bottom-[-4px] w-px bg-border" />
                )}
                <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                  {res.status === "bloqueado" ? (
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{res.time}</span>
                    <Badge
                      variant="secondary"
                      className={
                        res.status === "bloqueado"
                          ? "text-[10px] bg-muted text-muted-foreground border-0"
                          : res.status === "confirmada"
                          ? "text-[10px] bg-emerald-500/10 text-emerald-600 border-0"
                          : res.status === "pendiente"
                          ? "text-[10px] bg-amber-400/10 text-amber-600 border-0"
                          : "text-[10px] bg-destructive/10 text-destructive border-0"
                      }
                    >
                      {res.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <DoorOpen className="h-3 w-3" />
                    <span className="truncate">{res.salas?.name || "—"}</span>
                  </div>
                  {res.status !== "bloqueado" && (
                    <>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{res.game_masters?.name || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{res.players} jugadores — {res.client_name}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
