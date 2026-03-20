import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { panelCrud } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Sala } from "@/types/dashboard";

const emptySala = { name: "", theme: "", difficulty: 3, capacity: 6, active: true };

export default function SalasPage() {
  return (
    <DashboardLayout title="Salas">
      {({ accessKey }) => <SalasContent accessKey={accessKey} />}
    </DashboardLayout>
  );
}

function SalasContent({ accessKey }: { accessKey: string }) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Sala | null>(null);
  const [form, setForm] = useState(emptySala);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await panelCrud("list-salas", accessKey);
      setSalas(res.data || []);
    } catch { toast.error("Error al cargar salas"); }
    setLoading(false);
  }, [accessKey]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptySala); setDialogOpen(true); };
  const openEdit = (s: Sala) => { setEditing(s); setForm({ name: s.name, theme: s.theme || "", difficulty: s.difficulty, capacity: s.capacity, active: s.active }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    setSaving(true);
    try {
      if (editing) {
        await panelCrud("update-sala", accessKey, { id: editing.id, ...form });
        toast.success("Sala actualizada");
      } else {
        await panelCrud("create-sala", accessKey, form);
        toast.success("Sala creada");
      }
      setDialogOpen(false);
      load();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await panelCrud("delete-sala", accessKey, { id: deleteId });
      toast.success("Sala eliminada");
      setDeleteId(null);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Gestión de Salas</CardTitle>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" />Nueva Sala</Button>
        </CardHeader>
        <CardContent className="p-0">
          {salas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <p>No hay salas configuradas</p>
              <Button variant="outline" size="sm" onClick={openCreate}>Crear primera sala</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Nombre</TableHead>
                  <TableHead>Temática</TableHead>
                  <TableHead>Dificultad</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salas.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-6 font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.theme || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.difficulty}/5</TableCell>
                    <TableCell className="text-muted-foreground">{s.capacity} pers.</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={s.active ? "bg-success/10 text-success border-0" : "bg-destructive/10 text-destructive border-0"}>
                        {s.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Sala" : "Nueva Sala"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nombre *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Temática</Label><Input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Dificultad (1-5)</Label><Input type="number" min={1} max={5} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })} /></div>
              <div><Label>Capacidad</Label><Input type="number" min={1} max={50} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Activa</Label></div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar esta sala?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
