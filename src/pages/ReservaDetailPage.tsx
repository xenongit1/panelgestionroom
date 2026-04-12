import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { panelCrud } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Clock,
  Users,
  Gamepad2,
  DoorOpen,
  Save,
  XCircle,
  Trash2,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Reserva } from "@/types/dashboard";

const statusStyles: Record<string, string> = {
  confirmada: "bg-success/10 text-success border-0",
  pendiente: "bg-warning/10 text-warning border-0",
  cancelada: "bg-destructive/10 text-destructive border-0",
  bloqueado: "bg-muted text-muted-foreground border-0",
};

export default function ReservaDetailPage() {
  return (
    <DashboardLayout title="Detalle de Reserva">
      {() => <ReservaDetail />}
    </DashboardLayout>
  );
}

function ReservaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await panelCrud("get-reserva", { id });
      setReserva(res.data);
      setNotes(res.data?.notes || "");
    } catch {
      toast.error("No se pudo cargar la reserva");
      navigate("/reservas");
    }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const saveNotes = async () => {
    if (!reserva) return;
    setSavingNotes(true);
    try {
      await panelCrud("update-reserva", { id: reserva.id, notes });
      toast.success("Nota guardada");
      setReserva({ ...reserva, notes });
    } catch (e: any) { toast.error(e.message); }
    setSavingNotes(false);
  };

  const handleCancel = async () => {
    if (!reserva) return;
    try {
      await panelCrud("update-reserva", { id: reserva.id, status: "cancelada" });
      toast.success("Reserva cancelada");
      setCancelDialog(false);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    if (!reserva) return;
    try {
      await panelCrud("delete-reserva", { id: reserva.id });
      toast.success("Reserva eliminada permanentemente");
      navigate("/reservas");
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <p className="text-muted-foreground">Reserva no encontrada</p>
        <Button variant="outline" onClick={() => navigate("/reservas")}>Volver</Button>
      </div>
    );
  }

  const phone = reserva.client_phone?.replace(/\s/g, "");
  const hasPhone = !!phone;
  const hasEmail = !!reserva.client_email;
  const isCancelled = reserva.status === "cancelada";
  const isBlocked = reserva.status === "bloqueado";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/reservas")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold truncate">{reserva.client_name}</h2>
          <p className="text-sm text-muted-foreground">{reserva.salas?.name || "Sin sala"}</p>
        </div>
        <Badge variant="secondary" className={cn("text-xs capitalize shrink-0", statusStyles[reserva.status])}>
          {reserva.status}
        </Badge>
      </div>

      {/* Quick actions */}
      {!isBlocked && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPhone}
            onClick={() => window.open(`https://wa.me/${phone}`, "_blank")}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPhone}
            asChild={hasPhone}
          >
            {hasPhone ? (
              <a href={`tel:${phone}`} className="gap-2"><Phone className="h-4 w-4" />Llamar</a>
            ) : (
              <span className="gap-2"><Phone className="h-4 w-4" />Llamar</span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasEmail}
            asChild={hasEmail}
          >
            {hasEmail ? (
              <a href={`mailto:${reserva.client_email}`} className="gap-2"><Mail className="h-4 w-4" />Email</a>
            ) : (
              <span className="gap-2"><Mail className="h-4 w-4" />Email</span>
            )}
          </Button>
        </div>
      )}

      {/* Info grid */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={DoorOpen} label="Sala" value={reserva.salas?.name || "—"} />
            <InfoRow icon={Calendar} label="Fecha" value={reserva.date} />
            <InfoRow icon={Clock} label="Hora" value={reserva.time} />
            <InfoRow icon={Users} label="Jugadores" value={String(reserva.players)} />
            <InfoRow icon={Gamepad2} label="Game Master" value={reserva.game_masters?.name || "Sin asignar"} />
            {!isBlocked && <InfoRow icon={Mail} label="Email" value={reserva.client_email || "—"} />}
            {!isBlocked && <InfoRow icon={Phone} label="Teléfono" value={reserva.client_phone || "—"} />}
          </div>
        </CardContent>
      </Card>

      {/* Internal notes */}
      <Card className="border-border/50">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            Nota interna del staff
          </div>
          <Textarea
            placeholder="Añadir comentario interno..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{notes.length}/500</span>
            <Button
              size="sm"
              onClick={saveNotes}
              disabled={savingNotes || notes === (reserva.notes || "")}
              className="gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {savingNotes ? "Guardando..." : "Guardar nota"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions footer */}
      <Separator />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {!isCancelled && !isBlocked && (
          <Button
            variant="destructive"
            onClick={() => setCancelDialog(true)}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancelar reserva
          </Button>
        )}
        <button
          onClick={() => setDeleteDialog(true)}
          className="text-xs text-muted-foreground hover:text-destructive underline transition-colors self-start sm:self-auto"
        >
          Eliminar permanentemente
        </button>
      </div>

      {/* Cancel confirmation */}
      <AlertDialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              La reserva pasará a estado "cancelada". No se eliminará del historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>Sí, cancelar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción borra la reserva del sistema de forma irreversible. ¿Estás seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar para siempre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
