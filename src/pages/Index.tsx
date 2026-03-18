import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { TopBar } from "@/components/TopBar";
import { KPICards } from "@/components/KPICards";
import { ReservationsTable } from "@/components/ReservationsTable";
import { AccessDenied } from "@/components/AccessDenied";
import type { Profile, DashboardData } from "@/types/dashboard";

const STORAGE_KEY = "gr_access_key";

type AccessState = "loading" | "valid" | "invalid" | "expired" | "inactive";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKey = searchParams.get("key");
  const savedKey = localStorage.getItem(STORAGE_KEY);
  const initialKey = urlKey || savedKey;

  const [accessState, setAccessState] = useState<AccessState>(initialKey ? "loading" : "invalid");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validate = useCallback(async (accessKey: string) => {
    setIsValidating(true);
    setErrorMessage("");
    try {
      const { data, error } = await supabase.functions.invoke("validate-access-key", {
        body: { key: accessKey },
      });

      if (error || !data?.valid) {
        const reason = data?.reason || "invalid";
        setAccessState(reason);
        localStorage.removeItem(STORAGE_KEY);
        if (reason === "invalid") {
          setErrorMessage("Clave errónea. Por favor, contacta al soporte.");
        } else if (reason === "expired") {
          setErrorMessage("Tu suscripción ha expirado. Por favor, renuévala en gestionroom.com");
        }
        setIsValidating(false);
        return;
      }

      // Valid — persist key
      localStorage.setItem(STORAGE_KEY, accessKey);
      setProfile(data.profile);
      setSearchParams({ key: accessKey }, { replace: true });

      // Fetch dashboard data before showing the dashboard
      const { data: dashboard, error: dashError } = await supabase.functions.invoke("dashboard-data", {
        body: { key: accessKey },
      });

      if (!dashError && dashboard) {
        setDashboardData(dashboard);
      }

      setAccessState("valid");
    } catch {
      setAccessState("invalid");
      localStorage.removeItem(STORAGE_KEY);
      setErrorMessage("Clave errónea. Por favor, contacta al soporte.");
    } finally {
      setIsValidating(false);
    }
  }, [setSearchParams]);

  useEffect(() => {
    if (initialKey) {
      validate(initialKey);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    return (
      <AccessDenied
        reason={accessState as "invalid" | "expired" | "inactive"}
        onKeySubmit={validate}
        isValidating={isValidating}
        errorMessage={errorMessage}
      />
    );
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
