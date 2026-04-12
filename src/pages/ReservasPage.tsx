import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { panelCrud } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Eye, Phone, Mail, MessageCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Reserva, Sala, GameMaster } from "@/types/dashboard";

const statusStyles: Record<string, string> = {
  confirmada: "bg-success/10 text-success border-0",
  pendiente: "bg-warning/10 text-warning border-0",
  cancelada: "bg-destructive/10 text-destructive border-0",
  bloqueado: "bg-muted text-muted-foreground border-0",
};

const emptyForm = {
  client_name: "", sala_id: "", date: "", time: "",
  game_master_id: "", players: 2, status: "pendiente",
  client_email: "", client_phone: "", notes: "",
};

const FILTERS = [
  { label: "Todas", value: "todas" },
  { label: "Confirmadas", value: "confirmada" },
  { label: "Pendientes", value: "pendiente" },
  { label: "Canceladas", value: "cancelada" },
  { label: "Bloqueadas", value: "bloqueado" },
];

export default function ReservasPage() {
  return (
    <DashboardLayout title="Reservas">
      {() => <ReservasContent />}
    </DashboardLayout>
  );
}

function ReservasContent() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [gms, setGms] = useState<GameMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Reserva | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("todas");

  const load = useCallback(async () => {
    try {
      const [rRes, sRes, gmRes] = await Promise.all([
        panelCrud("list-reservas"),
        panelCrud("list-salas"),
        panelCrud("list-game-masters"),
      ]);
      setReservas(rRes.data || []);
      setSalas(sRes.data || []);
      setGms(gmRes.data || []);
    } catch { toast.error("Error al cargar datos"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (r: Reserva) => {
    setEditing(r);
    setForm({
      client_name: r.client_name,
      sala_id: r.sala_id,
      date: r.date,
      time: r.time,
      game_master_id: r.game_master_id || "",
      players: r.players,
      status: r.status,
      client_email: r.client_email || "",
      client_phone: r.client_phone || "",
      notes: r.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.client_name.trim() || !form.sala_id || !form.date || !form.time) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        game_master_id: form.game_master_id || null,
        client_email: form.client_email || null,
        client_phone: form.client_phone || null,
        notes: form.notes || null,
      };
      if (editing) {
        await panelCrud("update-reserva", { id: editing.id, ...payload });
        toast.success("Reserva actualizada");
      } else {
        await panelCrud("create-reserva", payload);
        toast.success("Reserva creada");
      }
      setDialogOpen(false);
      load();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await panelCrud("update-reserva", { id: cancelId, status: "cancelada" });
      toast.success("Reserva cancelada");
      setCancelId(null);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = filter === "todas" ? reservas : reservas.filter((r) => r.status === filter);

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <>
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">Gestión de Reservas</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1 flex-wrap">
                {FILTERS.map((f) => (
                  <Button
                    key={f.value}
                    variant={filter === f.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(f.value)}
                    className="text-xs h-8"
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
              <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" />Nueva</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <p>No hay reservas</p>
              <Button variant="outline" size="sm" onClick={openCreate}>Crear primera reserva</Button>
            </div>
          ) : isMobile ? (
            <div className="divide-y divide-border/50">
              {filtered.map((r) => (
                <MobileReservaCard
                  key={r.id}
                  reserva={r}
                  onDetail={() => navigate(`/reservas/${r.id}`)}
                  onEdit={() => openEdit(r)}
                  onCancel={() => setCancelId(r.id)}
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Cliente</TableHead>
                  <TableHead>Sala</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Game Master</TableHead>
                  <TableHead>Jugadores</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <DesktopReservaRow
                    key={r.id}
                    reserva={r}
                    onDetail={() => navigate(`/reservas/${r.id}`)}
                    onEdit={() => openEdit(r)}
                    onCancel={() => setCancelId(r.id)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit — Sheet on mobile, Dialog on desktop */}
      {isMobile ? (
        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[92vh] overflow-y-auto">
            <SheetHeader><SheetTitle>{editing ? "Editar Reserva" : "Nueva Reserva"}</SheetTitle></SheetHeader>
            <ReservaFormFields form={form} setForm={setForm} salas={salas} gms={gms} />
            <SheetFooter className="pt-2"><Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Guardando..." : "Guardar"}</Button></SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar Reserva" : "Nueva Reserva"}</DialogTitle></DialogHeader>
            <ReservaFormFields form={form} setForm={setForm} salas={salas} gms={gms} />
            <DialogFooter><Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel confirmation */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>La reserva pasará a estado "cancelada" y se mantendrá en el historial.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>Sí, cancelar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ── Desktop row ── */
interface RowProps {
  reserva: Reserva;
  onDetail: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

function DesktopReservaRow({ reserva: r, onDetail, onEdit, onCancel }: RowProps) {
  const phone = r.client_phone?.replace(/\s/g, "");
  const isCancelled = r.status === "cancelada";
  const isBlocked = r.status === "bloqueado";

  return (
    <TableRow>
      <TableCell className="pl-6 font-medium">{r.client_name}</TableCell>
      <TableCell className="text-muted-foreground">{r.salas?.name || "—"}</TableCell>
      <TableCell className="text-muted-foreground">{r.date}</TableCell>
      <TableCell className="text-muted-foreground">{r.time}</TableCell>
      <TableCell className="text-muted-foreground">{r.game_masters?.name || "—"}</TableCell>
      <TableCell className="text-muted-foreground">{r.players}</TableCell>
      <TableCell>
        <Badge variant="secondary" className={cn("text-[11px] capitalize", statusStyles[r.status])}>{r.status}</Badge>
      </TableCell>
      <TableCell className="pr-6 text-right">
        <div className="inline-flex items-center gap-0.5">
          {!isBlocked && phone && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {!isBlocked && phone && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={`tel:${phone}`} title="Llamar"><Phone className="h-3.5 w-3.5" /></a>
            </Button>
          )}
          {!isBlocked && r.client_email && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={`mailto:${r.client_email}`} title="Email"><Mail className="h-3.5 w-3.5" /></a>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDetail} title="Ver detalle">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Editar">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {!isCancelled && !isBlocked && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onCancel} title="Cancelar">
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ── Mobile card ── */
function MobileReservaCard({ reserva: r, onDetail, onEdit, onCancel }: RowProps) {
  const phone = r.client_phone?.replace(/\s/g, "");
  const isCancelled = r.status === "cancelada";
  const isBlocked = r.status === "bloqueado";

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium truncate">{r.client_name}</p>
          <p className="text-xs text-muted-foreground">{r.salas?.name || "—"} · {r.date} · {r.time}</p>
        </div>
        <Badge variant="secondary" className={cn("text-[11px] capitalize shrink-0", statusStyles[r.status])}>
          {r.status}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground">
        {r.players} jugadores · {r.game_masters?.name || "Sin GM"}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onDetail} className="gap-1.5 h-9">
          <Eye className="h-3.5 w-3.5" />Ver detalle
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5 h-9">
          <Pencil className="h-3.5 w-3.5" />Editar
        </Button>
        {!isBlocked && phone && (
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /></a>
          </Button>
        )}
        {!isBlocked && phone && (
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <a href={`tel:${phone}`}><Phone className="h-4 w-4" /></a>
          </Button>
        )}
        {!isCancelled && !isBlocked && (
          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={onCancel}>
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
