import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, ArrowRight, Loader2, User, Lock, Eye, EyeOff, CheckCircle2, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GestionRoomLogo } from "@/components/GestionRoomLogo";

type Step = "key" | "register" | "has_owner";

export default function ActivatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("key");
  const [accessKey, setAccessKey] = useState("");
  const [profileId, setProfileId] = useState("");
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = "border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-primary";

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
          setError("Tu suscripción ha expirado. Renuévala en gestionroom.com");
        } else {
          setError("Clave incorrecta o sin plan activo. Contacta soporte@gestionroom.com");
        }
        setLoading(false);
        return;
      }

      setProfileId(data.profile.id);
      setCompanyName(data.profile.company_name);
      localStorage.setItem("gr_access_key", accessKey.trim());

      if (data.has_owner) {
        setStep("has_owner");
      } else {
        setStep("register");
      }
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
    if (!username.trim()) {
      setError("El nombre de usuario es obligatorio.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("panel-auth", {
        body: {
          action: "register",
          profileId,
          username: username.trim(),
          password,
        },
      });

      if (fnError) {
        setError("Error de conexión. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      if (data?.error === "already_claimed") {
        setStep("has_owner");
        setLoading(false);
        return;
      }

      if (data?.error === "username_taken") {
        setError("Este nombre de usuario ya está en uso.");
        setLoading(false);
        return;
      }

      if (data?.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Save session
      localStorage.setItem("gr_session", JSON.stringify(data.session));
      localStorage.setItem("gr_panel_activated", "true");
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
        <div className="mb-8 flex justify-center">
          <GestionRoomLogo variant="light" size="lg" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          {step === "key" && (
            <>
              <h2 className="mb-2 text-center text-xl font-semibold text-white">Activa tu Panel</h2>
              <p className="mb-6 text-center text-sm text-slate-400">Introduce la clave secreta de tu empresa para comenzar.</p>
              <form onSubmit={handleKeySubmit} className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input type="text" placeholder="EmpresaX-123456" value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)} disabled={loading}
                    className={inputClasses} />
                </div>
                {error && <p className="text-xs font-medium text-red-400">{error}</p>}
                <Button className="w-full" type="submit" disabled={!accessKey.trim() || loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verificar Clave <ArrowRight className="ml-1.5 h-4 w-4" /></>}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <button type="button" onClick={() => navigate("/login")} className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline">
                  Ya tengo cuenta — Iniciar sesión
                </button>
              </div>
            </>
          )}

          {step === "register" && (
            <>
              <div className="mb-4 flex items-center justify-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Clave verificada</span>
              </div>
              {companyName && (
                <p className="mb-2 text-center text-lg font-semibold text-white">{companyName}</p>
              )}
              <h2 className="mb-1 text-center text-xl font-semibold text-white">Crear Cuenta de Administrador</h2>
              <p className="mb-6 text-center text-sm text-slate-400">Crea tu usuario y contraseña para gestionar el panel.</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input type="text" placeholder="Nombre de usuario" value={username}
                    onChange={(e) => setUsername(e.target.value)} disabled={loading}
                    className={inputClasses} autoComplete="username" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password}
                    onChange={(e) => setPassword(e.target.value)} disabled={loading}
                    className={inputClasses + " pr-10"} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input type={showPassword ? "text" : "password"} placeholder="Confirmar contraseña" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading}
                    className={inputClasses} autoComplete="new-password" />
                </div>
                {error && <p className="text-xs font-medium text-red-400">{error}</p>}
                <Button className="w-full" type="submit" disabled={!username || !password || !confirmPassword || loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Crear Cuenta <ArrowRight className="ml-1.5 h-4 w-4" /></>}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => { setStep("key"); setError(""); }}
                  className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline">← Usar otra clave</button>
              </div>
            </>
          )}

          {step === "has_owner" && (
            <div className="text-center space-y-4">
              {companyName && <p className="text-lg font-semibold text-white">{companyName}</p>}
              <h2 className="text-xl font-semibold text-white">Administrador existente</h2>
              <p className="text-sm text-slate-400">Esta llave ya tiene un administrador. Identifícate para entrar.</p>
              <Button className="w-full" onClick={() => navigate("/login")}>
                <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
              </Button>
              <button type="button" onClick={() => { setStep("key"); setError(""); }}
                className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline">← Usar otra clave</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
