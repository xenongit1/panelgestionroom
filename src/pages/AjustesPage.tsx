import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { panelCrud } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { getProfileId } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AjustesPage() {
  return (
    <DashboardLayout title="Ajustes">
      {({ profile, session }) => (
        <div className="space-y-6 max-w-2xl">
          <CompanyNameForm initialName={profile.company_name || ""} />
          <ChangePasswordForm username={session.username} />
        </div>
      )}
    </DashboardLayout>
  );
}

function CompanyNameForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("El nombre no puede estar vacío"); return; }
    setSaving(true);
    try {
      await panelCrud("update-profile", { company_name: name.trim() });
      toast.success("Nombre actualizado");
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Nombre del Escape Room</CardTitle>
        <CardDescription>El nombre que se mostrará en tu panel y a tus clientes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Nombre de la empresa</Label><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></div>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm({ username }: { username: string }) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = async () => {
    if (!current || !newPw || !confirm) { toast.error("Completa todos los campos"); return; }
    if (newPw.length < 6) { toast.error("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    if (newPw !== confirm) { toast.error("Las contraseñas no coinciden"); return; }
    setSaving(true);
    try {
      const profileId = getProfileId();
      const { data, error } = await supabase.functions.invoke("panel-auth", {
        body: { action: "change_password", profileId, username, currentPassword: current, newPassword: newPw },
      });
      if (error) throw new Error("Error de conexión");
      if (data?.error) throw new Error(data.error === "invalid_credentials" ? "La contraseña actual es incorrecta" : data.error);
      toast.success("Contraseña actualizada");
      setCurrent(""); setNewPw(""); setConfirm("");
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Cambiar Contraseña</CardTitle>
        <CardDescription>Actualiza la contraseña de acceso al panel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Contraseña actual</Label><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
        <div><Label>Nueva contraseña</Label><Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
        <div><Label>Confirmar nueva contraseña</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
        <Button onClick={handleChange} disabled={saving}>{saving ? "Cambiando..." : "Cambiar contraseña"}</Button>
      </CardContent>
    </Card>
  );
}
