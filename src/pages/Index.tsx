import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { TopBar } from "@/components/TopBar";
import { KPICards } from "@/components/KPICards";
import { ReservationsTable } from "@/components/ReservationsTable";

const Dashboard = () => {
  // TODO: Replace with real Supabase license validation
  // For now, renders the dashboard directly with mock data

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Central Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <TopBar />
        <div className="space-y-6">
          <KPICards />
          <ReservationsTable />
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
};

export default Dashboard;
