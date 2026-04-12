import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RightSidebar } from "@/components/RightSidebar";
import { KPICards } from "@/components/KPICards";
import { ReservationsTable } from "@/components/ReservationsTable";
import { MonthlyKPIs } from "@/components/dashboard/MonthlyKPIs";
import { OccupationCalendar } from "@/components/dashboard/OccupationCalendar";
import { BlockSlotDialog } from "@/components/dashboard/BlockSlotDialog";
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
  const [nextSession, setNextSession] = useState<any>(null);

  useEffect(() => {
    const profileId = getProfileId();
    if (!profileId) return;

    supabase.functions.invoke("dashboard-data", { body: { profileId } }).then(({ data }) => {
      if (data?.todayReservations) setTodayReservations(data.todayReservations);
      if (data?.nextSession !== undefined) setNextSession(data.nextSession);
    });
  }, []);

  return <RightSidebar todayReservations={todayReservations} nextSession={nextSession} />;
}

function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    const profileId = getProfileId();
    if (!profileId) return;

    supabase.functions.invoke("dashboard-data", { body: { profileId } }).then(({ data }) => {
      if (data) setDashboardData(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Action bar */}
      <div className="flex items-center justify-end">
        <BlockSlotDialog salas={dashboardData?.salas || []} onBlocked={fetchData} />
      </div>

      <KPICards kpis={dashboardData?.kpis} />
      <MonthlyKPIs stats={dashboardData?.monthlyStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReservationsTable reservations={dashboardData?.reservations || []} />
        </div>
        <div>
          <OccupationCalendar days={dashboardData?.weeklyOccupation || []} />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
