import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  KeyRound,
  ArrowRight,
  Loader2,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  LogIn,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { saveSession } from "@/lib/session";

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

  const [bizName, setBizName] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const inputClasses =
    "h-14 bg-[#FCFCFB] border-[#E5E5E5] text-[#111111] text-[15px] placeholder:text-[#A0A0A0] pl-12 rounded-xl shadow-none focus-visible:ring-[3px] focus-visible:ring-black/5 focus-visible:border-[#111111]";

  const iconClasses = "absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A1A1A1]";

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessKey.trim()) {
      setError("Introduce tu clave de acceso.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("validate-access-key", {
        body: { key: accessKey.trim() },
      });

      if (fnError) {
        console.error("validate-access-key fnError:", fnError);
        setError("Error de conexión. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      if (!data?.valid) {
        const reason = data?.reason;

        if (reason === "missing_key") {
          setError("Introduce tu clave de acceso.");
        } else if (reason === "expired") {
          setError("Tu suscripción ha expirado. Renuévala en gestionroom.com");
        } else if (reason === "invalid") {
          setError("Clave incorrecta. Verifica tu clave o contacta soporte@gestionroom.com");
        } else {
          setError("Error al verificar la clave. Inténtalo de nuevo.");
        }

        setLoading(false);
        return;
      }

      setProfileId(data.profile?.id);
      setCompanyName(data.profile?.company_name || null);

      if (data.key_used || data.has_owner) {
        setStep("has_owner");
      } else {
        if (data.profile?.company_name) setBizName(data.profile.company_name);
        if (data.profile?.company_email) setBizEmail(data.profile.company_email);
        if (data.profile?.company_phone) setBizPhone(data.profile.company_phone);
        if (data.profile?.country) setCountry(data.profile.country);
        if (data.profile?.city) setCity(data.profile.city);

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
          accessKey: accessKey.trim(),
          company_name: bizName.trim() || undefined,
          company_email: bizEmail.trim() || undefined,
          company_phone: bizPhone.trim() || undefined,
          country: country.trim() || undefined,
          city: city.trim() || undefined,
        },
      });

      if (fnError) {
        setError("Error de conexión. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      if (data?.error === "already_claimed" || data?.error === "already_used") {
        setStep("has_owner");
        setLoading(false);
        return;
      }

      if (data?.error === "username_taken") {
        setError("Este nombre de usuario ya está en uso.");
        setLoading(false);
        return;
      }

      if (data?.error === "unauthorized") {
        setError("No autorizado. Verifica tu clave de acceso e inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      if (data?.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      saveSession(data.session, true);
      navigate("/", { replace: true });
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {step === "key" && (
        <>
          <h2 className="mb-3 text-center text-[30px] leading-[1.05] sm:text-[34px] font-semibold tracking-[-0.045em] text-[#111111]">
            Activa tu Panel
          </h2>

          <p className="mx-auto mb-8 max-w-[32ch] text-center text-[15px] leading-6 text-[#66615C]">
            Introduce la clave de acceso de tu empresa para comenzar.
          </p>

          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div className="relative">
              <KeyRound className={iconClasses} strokeWidth={1.5} />
              <Input
                type="text"
                placeholder="XXXXXX-000000"
                value={accessKey}
                onChange={(e) => {
                  setAccessKey(e.target.value);
                  if (error) setError("");
                }}
                disabled={loading}
                className={inputClasses}
              />
            </div>

            {error && <p className="text-[13px] font-medium text-red-500">{error}</p>}

            <Button
              className="w-full h-14 rounded-xl text-[15px] font-medium tracking-[-0.01em] active:scale-[0.985] transition-all"
              type="submit"
              disabled={loading}
            >
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

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[14px] font-medium text-[#8D8D8D] underline-offset-4 hover:text-[#111111] hover:underline"
            >
              Ya tengo cuenta — Iniciar sesión
            </button>
          </div>
        </>
      )}

      {step === "register" && (
        <>
          <div className="mb-5 flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            <span className="text-[13px] font-medium text-emerald-700">Clave verificada</span>
          </div>

          {companyName && (
            <p className="mb-2 text-center text-[18px] sm:text-[20px] font-semibold tracking-[-0.03em] text-[#111111]">
              {companyName}
            </p>
          )}

          <h2 className="mb-3 text-center text-[30px] leading-[1.05] sm:text-[34px] font-semibold tracking-[-0.045em] text-[#111111]">
            Crear Cuenta de Administrador
          </h2>

          <p className="mx-auto mb-8 max-w-[34ch] text-center text-[15px] leading-6 text-[#66615C]">
            Crea tu usuario y completa los datos principales de tu negocio.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className={iconClasses} strokeWidth={1.5} />
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className={inputClasses}
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <Lock className={iconClasses} strokeWidth={1.5} />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={inputClasses + " pr-10"}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1A1] hover:text-[#111111]"
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} />
                ) : (
                  <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />
                )}
              </button>
            </div>

            <div className="relative">
              <Lock className={iconClasses} strokeWidth={1.5} />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className={inputClasses}
                autoComplete="new-password"
              />
            </div>

            <div className="border-t border-[#ECEAE8] pt-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#9A9A9A]">
                Datos del negocio
              </p>
            </div>

            <div className="relative">
              <Building2 className={iconClasses} strokeWidth={1.5} />
              <Input
                type="text"
                placeholder="Escape Factory Madrid"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                disabled={loading}
                className={inputClasses}
              />
            </div>

            <div className="relative">
              <Mail className={iconClasses} strokeWidth={1.5} />
              <Input
                type="email"
                placeholder="nombre@tuempresa.com"
                value={bizEmail}
                onChange={(e) => setBizEmail(e.target.value)}
                disabled={loading}
                className={inputClasses}
              />
            </div>

            <div className="relative">
              <Phone className={iconClasses} strokeWidth={1.5} />
              <Input
                type="tel"
                placeholder="+34 600 123 456"
                value={bizPhone}
                onChange={(e) => setBizPhone(e.target.value)}
                disabled={loading}
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Globe className={iconClasses} strokeWidth={1.5} />
                <Input
                  type="text"
                  placeholder="España"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                />
              </div>

              <div className="relative">
                <MapPin className={iconClasses} strokeWidth={1.5} />
                <Input
                  type="text"
                  placeholder="Madrid"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                />
              </div>
            </div>

            {error && <p className="text-[13px] font-medium text-red-500">{error}</p>}

            <Button
              className="w-full h-14 rounded-xl text-[15px] font-medium tracking-[-0.01em] active:scale-[0.985] transition-all"
              type="submit"
              disabled={!username || !password || !confirmPassword || loading}
            >
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

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setStep("key");
                setError("");
              }}
              className="text-[14px] font-medium text-[#8D8D8D] underline-offset-4 hover:text-[#111111] hover:underline"
            >
              ← Usar otra clave
            </button>
          </div>
        </>
      )}

      {step === "has_owner" && (
        <div className="text-center">
          {companyName && (
            <p className="mb-2 text-[18px] sm:text-[20px] font-semibold tracking-[-0.03em] text-[#111111]">
              {companyName}
            </p>
          )}

          <h2 className="mb-3 text-center text-[30px] leading-[1.05] sm:text-[34px] font-semibold tracking-[-0.045em] text-[#111111]">
            Panel ya activado
          </h2>

          <p className="mx-auto mb-8 max-w-[34ch] text-center text-[15px] leading-6 text-[#66615C]">
            Este panel ya tiene un administrador configurado. Inicia sesión para acceder.
          </p>

          <Button
            className="w-full h-14 rounded-xl text-[15px] font-medium tracking-[-0.01em] active:scale-[0.985] transition-all"
            onClick={() => navigate("/login")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar Sesión
          </Button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setStep("key");
                setError("");
              }}
              className="text-[14px] font-medium text-[#8D8D8D] underline-offset-4 hover:text-[#111111] hover:underline"
            >
              ← Usar otra clave
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
