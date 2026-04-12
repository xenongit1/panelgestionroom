import { useState, useEffect, useCallback, useRef } from "react";
import { panelCrud } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Camera, Upload, Trash2, Send, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Photo {
  id: string;
  file_path: string;
  url: string | null;
  created_at: string;
}

interface FotoFinishSectionProps {
  reservaId: string;
  profileId: string;
}

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function FotoFinishSection({ reservaId, profileId }: FotoFinishSectionProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPhotos = useCallback(async () => {
    try {
      const res = await panelCrud("list-reserva-photos", { reserva_id: reservaId });
      setPhotos(res.data || []);
    } catch {
      /* silent — section is non-critical */
    }
    setLoading(false);
  }, [reservaId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      toast.error(`Máximo ${MAX_PHOTOS} fotos por reserva`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);

    for (const file of filesToUpload) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Formato no válido: ${file.name}. Usa JPG, PNG o WebP.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} supera los 5MB`);
        continue;
      }

      setUploading(true);
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const uuid = crypto.randomUUID();
        const filePath = `${profileId}/${reservaId}/${uuid}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("finish-photos")
          .upload(filePath, file, { contentType: file.type });

        if (uploadError) throw uploadError;

        const res = await panelCrud("add-reserva-photo", {
          reserva_id: reservaId,
          file_path: filePath,
        });

        setPhotos((prev) => [...prev, res.data]);
        toast.success("Foto subida");
      } catch (err: any) {
        const msg = err?.message || "Error al subir foto";
        if (msg.includes("max_photos_reached")) {
          toast.error(`Máximo ${MAX_PHOTOS} fotos alcanzado`);
        } else {
          toast.error(msg);
        }
      }
      setUploading(false);
    }

    // Reset input
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await panelCrud("delete-reserva-photo", {
        id: deleteTarget.id,
        reserva_id: reservaId,
      });
      setPhotos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Foto eliminada");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar foto");
    }
    setDeleteTarget(null);
  };

  const handleSend = () => {
    toast.info("El envío por email se activará en una próxima actualización.", {
      duration: 4000,
    });
  };

  const canUpload = photos.length < MAX_PHOTOS;

  return (
    <>
      <Card className="border-border/50">
        <CardContent className="pt-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Foto Finish</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {photos.length}/{MAX_PHOTOS} fotos
            </span>
          </div>

          {/* Thumbnails grid */}
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <ImageIcon className="h-8 w-8 opacity-50" />
              <p className="text-sm">Sube las fotos de la sesión</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border/50"
                >
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt="Foto de sesión"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    onClick={() => setDeleteTarget(photo)}
                    className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                    title="Eliminar foto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={!canUpload || uploading}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Subiendo..." : "Subir fotos"}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSend}
                disabled={photos.length === 0}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Enviar Fotos
              </Button>
              <Badge
                variant="secondary"
                className="text-[10px] bg-muted text-muted-foreground border-0"
              >
                Próximamente
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta foto?</AlertDialogTitle>
            <AlertDialogDescription>
              La foto se eliminará permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
