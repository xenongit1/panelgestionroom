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
import type { GameMaster } from "@/types/dashboard";

export default function GameMastersPage() {
  return (
    <DashboardLayout title="Game Masters">
      {() => <GMContent />}
    </DashboardLayout>
  );
}

function GMContent() {
  const [gms, setGms] = useState<GameMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<GameMaster | null>(null);
  const [form, setForm] = useState({ name: "", available: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await panelCrud("list-game-masters");
      setGms(res.data || []);
    } catch { toast.error("Error al cargar Game Masters"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: "", available: true }); setDialogOpen(true); };
  const openEdit = (gm: GameMaster) => { setEditing(gm); setForm({ name: gm.name, available: gm.available }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    setSaving(true);
    try {
      if (editing) {
        await panelCrud("update-game-master", { id: editing.id, ...form });
        toast.success("Game Master actualizado");
      } else {
        await panelCrud("create-game-master", form);
        toast.success("Game Master creado");
      }
      setDialogOpen(false);
      load();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await panelCrud("delete-game-master", { id: deleteId });
      toast.success("Game Master eliminado");
      setDeleteId(null);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Gestión de Game Masters</CardTitle>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" />Nuevo GM</Button>
        </CardHeader>
        <CardContent className="p-0">
          {gms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <p>No hay Game Masters registrados</p>
              <Button variant="outline" size="sm" onClick={openCreate}>Añadir primero</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gms.map((gm) => (
                  <TableRow key={gm.id}>
                    <TableCell className="pl-6 font-medium">{gm.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={gm.available ? "bg-success/10 text-success border-0" : "bg-destructive/10 text-destructive border-0"}>
                        {gm.available ? "Disponible" : "No disponible"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(gm)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(gm.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar Game Master" : "Nuevo Game Master"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nombre *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} /><Label>Disponible</Label></div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar este Game Master?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
