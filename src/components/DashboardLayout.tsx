import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LeftSidebar } from "@/components/LeftSidebar";
import { TopBar } from "@/components/TopBar";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/dashboard";

interface SessionData {
  panel_user_id: string;
  profile_id: string;
  username: string;
  role: string;
  access_key?: string;
}

interface DashboardLayoutProps {
  children: (props: { profile: Profile; session: SessionData; accessKey: string }) => ReactNode;
  title?: string;
  showRightSidebar?: ReactNode;
}

export function DashboardLayout({ children, title = "Dashboard", showRightSidebar }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { contentLayout } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionStr = localStorage.getItem("gr_session");
    if (!sessionStr) {
      const activated = localStorage.getItem("gr_panel_activated");
      navigate(activated ? "/login" : "/activate", { replace: true });
      return;
    }

    let parsed: SessionData;
    try {
      parsed = JSON.parse(sessionStr);
    } catch {
      localStorage.removeItem("gr_session");
      navigate("/activate", { replace: true });
      return;
    }

    if (!parsed.profile_id || !parsed.username) {
      localStorage.removeItem("gr_session");
      navigate("/activate", { replace: true });
      return;
    }

    const accessKey = parsed.access_key || localStorage.getItem("gr_access_key");
    if (!accessKey) {
      navigate("/activate", { replace: true });
      return;
    }

    const init = async () => {
      const { data: valData } = await supabase.functions.invoke("validate-access-key", {
        body: { key: accessKey },
      });

      if (!valData?.valid) {
        localStorage.removeItem("gr_panel_activated");
        localStorage.removeItem("gr_access_key");
        localStorage.removeItem("gr_session");
        navigate("/activate", { replace: true });
        return;
      }

      setProfile(valData.profile);
      setSession(parsed);
      setLoading(false);
    };

    init();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("gr_session");
    localStorage.removeItem("gr_panel_activated");
    localStorage.removeItem("gr_access_key");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!profile || !session) return null;

  const accessKey = session.access_key || localStorage.getItem("gr_access_key") || "";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <LeftSidebar username={session.username} companyName={profile.company_name} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className={cn(contentLayout === "centered" && "max-w-6xl mx-auto")}>
          <TopBar profile={profile} title={title} onLogout={handleLogout} />
          <div className="space-y-6">
            {children({ profile, session, accessKey })}
          </div>
        </div>
      </main>
      {showRightSidebar}
    </div>
  );
}
