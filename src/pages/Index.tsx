import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { TopBar } from "@/components/TopBar";
import { KPICards } from "@/components/KPICards";
import { ReservationsTable } from "@/components/ReservationsTable";
import type { Profile, DashboardData } from "@/types/dashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionStr = localStorage.getItem("gr_session");
    if (!sessionStr) {
      const activated = localStorage.getItem("gr_panel_activated");
      navigate(activated ? "/login" : "/activate", { replace: true });
      return;
    }

    const init = async () => {
      const accessKey = localStorage.getItem("gr_access_key");
      if (!accessKey) {
        navigate("/activate", { replace: true });
        return;
      }

      // Validate access key and fetch profile
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

      // Fetch dashboard data
      const { data: dashboard } = await supabase.functions.invoke("dashboard-data", {
        body: { key: accessKey },
      });

      if (dashboard) {
        setDashboardData(dashboard);
      }

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

  if (!profile) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <LeftSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <TopBar profile={profile} onLogout={handleLogout} />
        <div className="space-y-6">
          <KPICards kpis={dashboardData?.kpis} />
          <ReservationsTable reservations={dashboardData?.reservations || []} />
        </div>
      </main>
      <RightSidebar todayReservations={dashboardData?.todayReservations || []} />
    </div>
  );
};

export default Dashboard;
