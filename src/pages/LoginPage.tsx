import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GestionRoomLogo } from "@/components/GestionRoomLogo";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("Email o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      // Fetch profile to store access_key
      const userId = signInData.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("access_key")
          .eq("id", userId)
          .maybeSingle();
        if (profile?.access_key) {
          localStorage.setItem("gr_access_key", profile.access_key);
        }
      }

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
          <h2 className="mb-2 text-center text-xl font-semibold text-white">
            Iniciar Sesión
          </h2>
          <p className="mb-6 text-center text-sm text-slate-400">
            Accede a tu panel de control.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
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
            {error && (
              <p className="text-xs font-medium text-red-400">{error}</p>
            )}
            <Button className="w-full" type="submit" disabled={!email || !password || loading}>
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
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/activate")}
              className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline"
            >
              Activar nuevo panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
