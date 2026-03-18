import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GestionRoomLogo } from "@/components/GestionRoomLogo";

type Step = "key" | "register";

interface ValidatedProfile {
  id: string;
  access_key: string;
  company_name: string | null;
}

export default function ActivatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("key");
  const [accessKey, setAccessKey] = useState("");
  const [validatedProfile, setValidatedProfile] = useState<ValidatedProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Registration fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("validate-access-key", {
        body: { key: accessKey.trim() },
      });

      if (fnError || !data?.valid) {
        const reason = data?.reason;
        if (reason === "expired") {
          setError("Tu suscripción ha expirado. Por favor, renuévala en gestionroom.com");
        } else {
          setError("Esta clave no tiene un plan activo asociado o es incorrecta. Contacta con soporte@gestionroom.com");
        }
        setLoading(false);
        return;
      }

      setValidatedProfile({
        id: data.profile.id,
        access_key: accessKey.trim(),
        company_name: data.profile.company_name,
      });
      setStep("register");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("register-owner", {
        body: {
          accessKey: validatedProfile!.access_key,
          email: email.trim(),
          password,
        },
      });

      if (fnError || data?.error) {
        setError(data?.error || "Error al crear la cuenta. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      // Sign in with the newly created credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("Cuenta creada pero error al iniciar sesión. Ve a Login.");
        setLoading(false);
        return;
      }

      localStorage.setItem("gr_panel_activated", "true");
      localStorage.setItem("gr_access_key", validatedProfile!.access_key);
      navigate("/", { replace: true });
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <GestionRoomLogo variant="light" size="lg" />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          {step === "key" ? (
            <>
              <h2 className="mb-2 text-center text-xl font-semibold text-white">
                Activa tu Panel
              </h2>
              <p className="mb-6 text-center text-sm text-slate-400">
                Introduce la clave secreta de tu empresa para comenzar.
              </p>
              <form onSubmit={handleKeySubmit} className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="EmpresaX-123456"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    disabled={loading}
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-primary"
                  />
                </div>
                {error && (
                  <p className="text-xs font-medium text-red-400">{error}</p>
                )}
                <Button className="w-full" type="submit" disabled={!accessKey.trim() || loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verificar Clave
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline"
                >
                  Ya tengo cuenta — Iniciar sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Clave verificada</span>
              </div>
              {validatedProfile?.company_name && (
                <p className="mb-2 text-center text-lg font-semibold text-white">
                  {validatedProfile.company_name}
                </p>
              )}
              <h2 className="mb-1 text-center text-xl font-semibold text-white">
                Crear Cuenta de Administrador
              </h2>
              <p className="mb-6 text-center text-sm text-slate-400">
                Crea tu cuenta para gestionar el panel.
              </p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-primary"
                  />
                </div>
                {error && (
                  <p className="text-xs font-medium text-red-400">{error}</p>
                )}
                <Button className="w-full" type="submit" disabled={!email || !password || !confirmPassword || loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Crear Cuenta
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setStep("key"); setError(""); }}
                  className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline"
                >
                  ← Usar otra clave
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
