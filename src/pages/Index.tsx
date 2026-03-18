import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { TopBar } from "@/components/TopBar";
import { KPICards } from "@/components/KPICards";
import { ReservationsTable } from "@/components/ReservationsTable";
import { AccessDenied } from "@/components/AccessDenied";
import type { Profile, DashboardData } from "@/types/dashboard";

type AccessState = "loading" | "valid" | "invalid" | "expired" | "inactive";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const accessKey = searchParams.get("key");

  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!accessKey) {
      setAccessState("invalid");
      return;
    }

    const validate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("validate-access-key", {
          body: { key: accessKey },
        });

        if (error || !data?.valid) {
          setAccessState(data?.reason || "invalid");
          return;
        }

        setProfile(data.profile);
        setAccessState("valid");

        // Fetch dashboard data
        const { data: dashboard, error: dashError } = await supabase.functions.invoke("dashboard-data", {
          body: { key: accessKey },
        });

        if (!dashError && dashboard) {
          setDashboardData(dashboard);
        }
      } catch {
        setAccessState("invalid");
      }
    };

    validate();
  }, [accessKey]);

  if (accessState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (accessState !== "valid" || !profile) {
    return <AccessDenied reason={accessState as "invalid" | "expired" | "inactive"} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <LeftSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <TopBar profile={profile} />
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
