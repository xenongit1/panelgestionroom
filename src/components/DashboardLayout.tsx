import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LeftSidebar, MobileNavContent } from "@/components/LeftSidebar";
import { TopBar } from "@/components/TopBar";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getSession, clearSession, type SessionData } from "@/lib/session";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { Profile } from "@/types/dashboard";

interface DashboardLayoutProps {
  children: (props: { profile: Profile; session: SessionData }) => ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title = "Dashboard" }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { contentLayout } = useTheme();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || !currentSession.profile_id || !currentSession.panel_user_id) {
      navigate("/login", { replace: true });
      return;
    }

    const init = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("panel-auth", {
          body: {
            action: "validate_session",
            profile_id: currentSession.profile_id,
            panel_user_id: currentSession.panel_user_id,
          },
        });

        if (error || !data?.valid) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }

        setProfile(data.profile);
        setSession(currentSession);
      } catch {
        clearSession();
        navigate("/login", { replace: true });
        return;
      }
      setLoading(false);
    };

    init();
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      {!isMobile && (
        <LeftSidebar
          username={session.username}
          companyName={profile.company_name}
          ownerName={(profile as any).owner_name}
          email={profile.email}
          onLogout={handleLogout}
        />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <MobileNavContent
              onNavigate={(path) => {
                navigate(path);
                setMobileMenuOpen(false);
              }}
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
      )}

      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className={cn(contentLayout === "centered" && "max-w-6xl mx-auto")}>
          <TopBar
            profile={profile}
            title={title}
            onLogout={handleLogout}
            onMenuOpen={isMobile ? () => setMobileMenuOpen(true) : undefined}
          />
          <div className="space-y-5">
            {children({ profile, session })}
          </div>
        </div>
      </main>
    </div>
  );
}
