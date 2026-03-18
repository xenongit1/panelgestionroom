import { useState } from "react";
import { ShieldX, ArrowRight, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GestionRoomLogo } from "./GestionRoomLogo";

interface AccessDeniedProps {
  reason: "invalid" | "expired" | "inactive";
  onKeySubmit?: (key: string) => void;
  isValidating?: boolean;
}

export function AccessDenied({ reason, onKeySubmit, isValidating }: AccessDeniedProps) {
  const [key, setKey] = useState("");

  const messages = {
    invalid: {
      title: "Acceso al Panel",
      description: "Introduce tu clave secreta para acceder al panel de gestión.",
    },
    expired: {
      title: "Suscripción Expirada",
      description: "Tu plan ha expirado. Renueva tu suscripción o introduce otra clave.",
    },
    inactive: {
      title: "Cuenta Inactiva",
      description: "Tu cuenta está inactiva. Contacta con soporte o introduce otra clave.",
    },
  };

  const { title, description } = messages[reason];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim() && onKeySubmit) {
      onKeySubmit(key.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardContent className="flex flex-col items-center p-8 text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <GestionRoomLogo />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <Input
              type="text"
              placeholder="Introduce tu clave secreta"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={isValidating}
              className="text-center"
            />
            <Button className="w-full" type="submit" disabled={!key.trim() || isValidating}>
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>
          {(reason === "expired" || reason === "inactive") && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = "https://gestionroom.com/precios"}
            >
              Ver Planes y Precios
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
