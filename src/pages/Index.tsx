import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RightSidebar } from "@/components/RightSidebar";
import { KPICards } from "@/components/KPICards";
import { ReservationsTable } from "@/components/ReservationsTable";
import type { DashboardData } from "@/types/dashboard";

const Dashboard = () => {
  return (
    <DashboardLayout
      title="Dashboard"
      showRightSidebar={<RightSidebarWrapper />}
    >
      {({ accessKey }) => <DashboardContent accessKey={accessKey} />}
    </DashboardLayout>
  );
};

function RightSidebarWrapper() {
  // Will be populated by DashboardContent via shared state - simplified: fetch own data
  const [todayReservations, setTodayReservations] = useState<any[]>([]);

  useEffect(() => {
    const sessionStr = localStorage.getItem("gr_session");
    const accessKey = sessionStr ? JSON.parse(sessionStr).access_key : localStorage.getItem("gr_access_key");
    if (!accessKey) return;

    supabase.functions.invoke("dashboard-data", { body: { key: accessKey } }).then(({ data }) => {
      if (data?.todayReservations) setTodayReservations(data.todayReservations);
    });
  }, []);

  return <RightSidebar todayReservations={todayReservations} />;
}

function DashboardContent({ accessKey }: { accessKey: string }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.functions.invoke("dashboard-data", { body: { key: accessKey } }).then(({ data }) => {
      if (data) setDashboardData(data);
      setLoading(false);
    });
  }, [accessKey]);

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
