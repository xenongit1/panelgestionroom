import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { getProfileId } from "@/lib/session";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Sala } from "@/types/dashboard";

interface BlockSlotDialogProps {
  salas: Sala[];
  onBlocked?: () => void;
}

export function BlockSlotDialog({ salas, onBlocked }: BlockSlotDialogProps) {
  const [open, setOpen] = useState(false);
  const [salaId, setSalaId] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const today = new Date().toISOString().split("T")[0];
  const activeSalas = salas.filter((s) => s.active);

  const handleBlock = async () => {
    if (!salaId || !time) {
      toast.error("Selecciona una sala y una hora");
      return;
    }

    const profileId = getProfileId();
    if (!profileId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("panel-crud", {
        body: {
          action: "block-slot",
          profileId,
          sala_id: salaId,
          date: today,
          time: time + ":00",
        },
      });

      if (error) throw error;

      if (data?.error === "slot_occupied") {
        toast.error("Ese hueco ya está ocupado por una reserva o bloqueo existente");
        setLoading(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      toast.success("Hueco bloqueado correctamente");
      setOpen(false);
      setSalaId("");
      setTime("");
      onBlocked?.();
    } catch {
      toast.error("Error al bloquear el hueco");
    }
    setLoading(false);
  };

  const formContent = (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>Sala</Label>
        <Select value={salaId} onValueChange={setSalaId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar sala" />
          </SelectTrigger>
          <SelectContent>
            {activeSalas.map((sala) => (
              <SelectItem key={sala.id} value={sala.id}>
                {sala.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Hora</Label>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
    </div>
  );

  const footerButtons = (
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleBlock} disabled={loading || !salaId || !time}>
        {loading ? "Bloqueando..." : "Bloquear Hueco"}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Lock className="h-4 w-4" />
            Cerrar Hora
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Cerrar Hora — {today}</SheetTitle>
            <SheetDescription>
              Bloquea un hueco para hoy. El slot quedará ocupado y no disponible para reservas públicas.
            </SheetDescription>
          </SheetHeader>
          {formContent}
          <SheetFooter className="flex-row gap-2 pt-2">
            {footerButtons}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Lock className="h-4 w-4" />
          Cerrar Hora (Hoy)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cerrar Hora — {today}</DialogTitle>
          <DialogDescription>
            Bloquea un hueco para hoy. El slot quedará ocupado y no disponible para reservas públicas.
          </DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          {footerButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
