import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GestionRoomLogo } from "@/components/GestionRoomLogo";

type Step = "key" | "register" | "already_claimed" | "email_taken";

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

      if (fnError) {
        setError("Error de conexión. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      if (data?.error === "already_claimed") {
        setStep("already_claimed");
        setLoading(false);
        return;
      }

      if (data?.error === "email_taken") {
        setStep("email_taken");
        setLoading(false);
        return;
      }

      if (data?.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Auto sign-in
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

  const inputClasses = "border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-primary";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 flex justify-center">
          <GestionRoomLogo variant="light" size="lg" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          {/* Step: Key Entry */}
          {step === "key" && (
            <KeyStep
              accessKey={accessKey}
              setAccessKey={setAccessKey}
              error={error}
              loading={loading}
              onSubmit={handleKeySubmit}
              onLogin={() => navigate("/login")}
            />
          )}

          {/* Step: Register */}
          {step === "register" && (
            <RegisterStep
              validatedProfile={validatedProfile}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={error}
              loading={loading}
              inputClasses={inputClasses}
              onSubmit={handleRegister}
              onBack={() => { setStep("key"); setError(""); }}
            />
          )}

          {/* Step: Already Claimed */}
          {step === "already_claimed" && (
            <InfoStep
              title="Cuenta ya vinculada"
              message="Esta clave ya tiene un administrador asignado. Inicia sesión con tu cuenta existente."
              companyName={validatedProfile?.company_name}
              onLogin={() => navigate("/login")}
              onBack={() => { setStep("key"); setError(""); }}
            />
          )}

          {/* Step: Email Taken */}
          {step === "email_taken" && (
            <InfoStep
              title="Email ya registrado"
              message="Este email ya está registrado en el sistema. Inicia sesión con tu cuenta existente."
              onLogin={() => navigate("/login")}
              onBack={() => { setStep("register"); setError(""); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function KeyStep({ accessKey, setAccessKey, error, loading, onSubmit, onLogin }: {
  accessKey: string; setAccessKey: (v: string) => void;
  error: string; loading: boolean;
  onSubmit: (e: React.FormEvent) => void; onLogin: () => void;
}) {
  return (
    <>
      <h2 className="mb-2 text-center text-xl font-semibold text-white">Activa tu Panel</h2>
      <p className="mb-6 text-center text-sm text-slate-400">Introduce la clave secreta de tu empresa para comenzar.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input type="text" placeholder="EmpresaX-123456" value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)} disabled={loading}
            className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-primary" />
        </div>
        {error && <p className="text-xs font-medium text-red-400">{error}</p>}
        <Button className="w-full" type="submit" disabled={!accessKey.trim() || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verificar Clave <ArrowRight className="ml-1.5 h-4 w-4" /></>}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <button type="button" onClick={onLogin} className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline">
          Ya tengo cuenta — Iniciar sesión
        </button>
      </div>
    </>
  );
}

function RegisterStep({ validatedProfile, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, error, loading, inputClasses, onSubmit, onBack }: {
  validatedProfile: ValidatedProfile | null;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  error: string; loading: boolean; inputClasses: string;
  onSubmit: (e: React.FormEvent) => void; onBack: () => void;
}) {
  return (
    <>
      <div className="mb-4 flex items-center justify-center gap-2 text-emerald-400">
        <CheckCircle2 className="h-5 w-5" />
        <span className="text-sm font-medium">Clave verificada</span>
      </div>
      {validatedProfile?.company_name && (
        <p className="mb-2 text-center text-lg font-semibold text-white">{validatedProfile.company_name}</p>
      )}
      <h2 className="mb-1 text-center text-xl font-semibold text-white">Crear Cuenta de Administrador</h2>
      <p className="mb-6 text-center text-sm text-slate-400">Crea tu cuenta para gestionar el panel.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className={inputClasses} />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className={inputClasses + " pr-10"} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input type={showPassword ? "text" : "password"} placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} className={inputClasses} />
        </div>
        {error && <p className="text-xs font-medium text-red-400">{error}</p>}
        <Button className="w-full" type="submit" disabled={!email || !password || !confirmPassword || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Crear Cuenta <ArrowRight className="ml-1.5 h-4 w-4" /></>}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <button type="button" onClick={onBack} className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline">← Usar otra clave</button>
      </div>
    </>
  );
}

interface ValidatedProfile {
  id: string;
  access_key: string;
  company_name: string | null;
}

function InfoStep({ title, message, companyName, onLogin, onBack }: {
  title: string; message: string; companyName?: string | null;
  onLogin: () => void; onBack: () => void;
}) {
  return (
    <div className="text-center space-y-4">
      {companyName && <p className="text-lg font-semibold text-white">{companyName}</p>}
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="text-sm text-slate-400">{message}</p>
      <Button className="w-full" onClick={onLogin}>
        <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
      </Button>
      <button type="button" onClick={onBack} className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline">← Volver</button>
    </div>
  );
}
