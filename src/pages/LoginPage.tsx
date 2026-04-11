import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/AuthLayout";
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

  const inputClasses = "bg-[#FAFAFA] border-[#E2E2E2] text-foreground placeholder:text-[#A0A0A0] pl-10 focus-visible:ring-foreground/20";
  const iconClasses = "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]";

  return (
    <AuthLayout>
      <h2 className="mb-2 text-center text-xl font-semibold text-foreground">Iniciar Sesión</h2>
      <p className="mb-6 text-center text-sm text-[#666]">Accede a tu panel de control.</p>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <User className={iconClasses} strokeWidth={1.5} />
          <Input type="text" placeholder="Nombre de usuario" value={username}
            onChange={(e) => setUsername(e.target.value)} disabled={loading}
            className={inputClasses} autoComplete="username" />
        </div>
        <div className="relative">
          <Lock className={iconClasses} strokeWidth={1.5} />
          <Input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password}
            onChange={(e) => setPassword(e.target.value)} disabled={loading}
            className={inputClasses + " pr-10"} autoComplete="current-password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-foreground">
            {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            className="border-[#D0D0D0] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <label htmlFor="remember" className="text-xs text-[#888] cursor-pointer select-none">
            Mantener sesión iniciada
          </label>
        </div>

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        <Button className="w-full h-11" type="submit" disabled={!username || !password || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Entrar al Panel <ArrowRight className="ml-1.5 h-4 w-4" /></>}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <button type="button" onClick={() => navigate("/activate")}
          className="text-xs text-[#999] underline-offset-4 hover:text-foreground hover:underline">
          Activar nuevo panel
        </button>
      </div>
    </AuthLayout>
  );
}
