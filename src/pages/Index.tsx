import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RightSidebar } from "@/components/RightSidebar";
import { KPICards } from "@/components/KPICards";
import { ReservationsTable } from "@/components/ReservationsTable";
import { getProfileId } from "@/lib/session";
import type { DashboardData } from "@/types/dashboard";

const Dashboard = () => {
  return (
    <DashboardLayout
      title="Dashboard"
      showRightSidebar={<RightSidebarWrapper />}
    >
      {() => <DashboardContent />}
    </DashboardLayout>
  );
};

function RightSidebarWrapper() {
  const [todayReservations, setTodayReservations] = useState<any[]>([]);

  useEffect(() => {
    const profileId = getProfileId();
    if (!profileId) return;

    supabase.functions.invoke("dashboard-data", { body: { profileId } }).then(({ data }) => {
      if (data?.todayReservations) setTodayReservations(data.todayReservations);
    });
  }, []);

  return <RightSidebar todayReservations={todayReservations} />;
}

function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileId = getProfileId();
    if (!profileId) return;

    supabase.functions.invoke("dashboard-data", { body: { profileId } }).then(({ data }) => {
      if (data) setDashboardData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <KPICards kpis={dashboardData?.kpis} />
      <ReservationsTable reservations={dashboardData?.reservations || []} />
    </>
  );
}

export default Dashboard;
