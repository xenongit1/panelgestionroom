import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { panelCrud } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Reserva, Sala, GameMaster } from "@/types/dashboard";

const statusStyles: Record<string, string> = {
  confirmada: "bg-success/10 text-success border-0",
  pendiente: "bg-warning/10 text-warning border-0",
  cancelada: "bg-destructive/10 text-destructive border-0",
};

const emptyForm = { client_name: "", sala_id: "", date: "", time: "", game_master_id: "", players: 2, status: "pendiente" };

export default function ReservasPage() {
  return (
    <DashboardLayout title="Reservas">
      {({ accessKey }) => <ReservasContent accessKey={accessKey} />}
    </DashboardLayout>
  );
}

function ReservasContent({ accessKey }: { accessKey: string }) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [gms, setGms] = useState<GameMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Reserva | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("todas");

  const load = useCallback(async () => {
    try {
      const [rRes, sRes, gmRes] = await Promise.all([
        panelCrud("list-reservas", accessKey),
        panelCrud("list-salas", accessKey),
        panelCrud("list-game-masters", accessKey),
      ]);
      setReservas(rRes.data || []);
      setSalas(sRes.data || []);
      setGms(gmRes.data || []);
    } catch { toast.error("Error al cargar datos"); }
    setLoading(false);
  }, [accessKey]);

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
      const payload = { ...form, game_master_id: form.game_master_id || null };
      if (editing) {
        await panelCrud("update-reserva", accessKey, { id: editing.id, ...payload });
        toast.success("Reserva actualizada");
      } else {
        await panelCrud("create-reserva", accessKey, payload);
        toast.success("Reserva creada");
      }
      setDialogOpen(false);
      load();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await panelCrud("delete-reserva", accessKey, { id: deleteId });
      toast.success("Reserva eliminada");
      setDeleteId(null);
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
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {["todas", "confirmada", "pendiente", "cancelada"].map((f) => (
                  <Button key={f} variant={filter === f ? "default" : "ghost"} size="sm" onClick={() => setFilter(f)} className="text-xs h-8 capitalize">{f === "todas" ? "Todas" : f + "s"}</Button>
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
                  <TableRow key={r.id}>
                    <TableCell className="pl-6 font-medium">{r.client_name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.salas?.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.date}</TableCell>
                    <TableCell className="text-muted-foreground">{r.time}</TableCell>
                    <TableCell className="text-muted-foreground">{r.game_masters?.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.players}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("text-[11px] capitalize", statusStyles[r.status])}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Reserva" : "Nueva Reserva"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Cliente *</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></div>
            <div><Label>Sala *</Label>
              <Select value={form.sala_id} onValueChange={(v) => setForm({ ...form, sala_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar sala" /></SelectTrigger>
                <SelectContent>{salas.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Fecha *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Hora *</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Game Master</Label>
                <Select value={form.game_master_id} onValueChange={(v) => setForm({ ...form, game_master_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {gms.map((gm) => <SelectItem key={gm.id} value={gm.id}>{gm.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Jugadores</Label><Input type="number" min={1} max={50} value={form.players} onChange={(e) => setForm({ ...form, players: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar esta reserva?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
