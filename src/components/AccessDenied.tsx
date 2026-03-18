import { ShieldX, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GestionRoomLogo } from "./GestionRoomLogo";

interface AccessDeniedProps {
  reason: "invalid" | "expired" | "inactive";
}

export function AccessDenied({ reason }: AccessDeniedProps) {
  const messages = {
    invalid: {
      title: "Acceso Denegado",
      description: "La clave de acceso proporcionada no es válida. Verifica tu enlace o contacta con soporte.",
    },
    expired: {
      title: "Suscripción Expirada",
      description: "Tu plan ha expirado. Renueva tu suscripción para seguir accediendo al panel.",
    },
    inactive: {
      title: "Cuenta Inactiva",
      description: "Tu cuenta está actualmente inactiva. Contacta con soporte o renueva tu plan.",
    },
  };

  const { title, description } = messages[reason];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardContent className="flex flex-col items-center p-8 text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <GestionRoomLogo />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <Button
            className="w-full"
            onClick={() => window.location.href = "https://gestionroom.com/precios"}
          >
            Ver Planes y Precios
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
