import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICards } from "@/components/KPICards";
import { ReservationsTable } from "@/components/ReservationsTable";
import { NextSessionWidget } from "@/components/dashboard/NextSessionWidget";
import { OccupationCalendar } from "@/components/dashboard/OccupationCalendar";
import { BlockSlotDialog } from "@/components/dashboard/BlockSlotDialog";
import { getProfileId } from "@/lib/session";
import type { DashboardData } from "@/types/dashboard";

const Dashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      {() => <DashboardContent />}
    </DashboardLayout>
  );
};

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
    <div className="space-y-5">
      {/* Mobile-first ordering via CSS order */}
      <div className="order-1">
        <NextSessionWidget session={dashboardData?.nextSession ?? null} />
      </div>

      <div className="flex items-center justify-end order-2">
        <BlockSlotDialog salas={dashboardData?.salas || []} onBlocked={fetchData} />
      </div>

      <div className="order-3">
        <KPICards kpis={dashboardData?.kpis} monthlyStats={dashboardData?.monthlyStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 order-4">
        <ReservationsTable reservations={dashboardData?.reservations || []} />
        <OccupationCalendar days={dashboardData?.weeklyOccupation || []} />
      </div>
    </div>
  );
}

export default Dashboard;
