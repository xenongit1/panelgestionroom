import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { saveSession } from "@/lib/session";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("panel-auth", {
        body: { action: "login", username: username.trim(), password },
      });

      if (fnError) {
        setError("Error de conexión. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      if (data?.error === "invalid_credentials") {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      if (data?.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      saveSession(data.session, remember);
      navigate("/", { replace: true });
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "h-14 bg-[#FBFBFA] border-[#DCDAD7] text-[#111111] text-[15px] placeholder:text-[#9A9A9A] pl-12 rounded-xl shadow-none focus-visible:ring-[3px] focus-visible:ring-black/5 focus-visible:border-[#111111]";

  const iconClasses = "absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9C9C9C]";

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

  return (
    <AuthLayout>
      <h2 className="mb-3 text-center text-[30px] leading-[1.05] sm:text-[34px] font-semibold tracking-[-0.045em] text-[#111111]">
        Iniciar Sesión
      </h2>

      <p className="mx-auto mb-8 max-w-[30ch] text-center text-[15px] leading-6 text-[#66615C]">
        Accede a tu panel de control.
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <User className={iconClasses} strokeWidth={1.5} />
          <Input
            type="text"
            placeholder="Nombre de usuario"
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
            className={inputClasses + " pr-11"}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C9C9C] hover:text-[#111111]"
          >
            {showPassword ? (
              <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} />
            ) : (
              <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            className="border-[#D0D0D0] data-[state=checked]:bg-[#111111] data-[state=checked]:border-[#111111]"
          />
          <label htmlFor="remember" className="text-[14px] font-medium text-[#6F6F6F] cursor-pointer select-none">
            Mantener sesión iniciada
          </label>
        </div>

        {error && <p className="text-[13px] font-medium text-red-500">{error}</p>}

        <Button
          className="w-full h-14 rounded-xl text-[15px] font-medium tracking-[-0.01em] transition-all active:scale-[0.985] disabled:opacity-100 disabled:bg-[#BEBBB7] disabled:text-white"
          type="submit"
          disabled={!canSubmit}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Entrar al Panel
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => navigate("/activate")}
          className="text-[14px] font-medium text-[#8D8D8D] underline-offset-4 hover:text-[#111111] hover:underline"
        >
          Activar nuevo panel
        </button>
      </div>
    </AuthLayout>
  );
}
