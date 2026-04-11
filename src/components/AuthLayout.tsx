import { GestionRoomLogo } from "@/components/GestionRoomLogo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundColor: "#F7F7F8",
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="w-full max-w-[480px] animate-in">
        <div className="mb-8 flex justify-center">
          <GestionRoomLogo variant="light" size="lg" />
        </div>

        <div className="rounded-2xl border bg-white p-10" style={{
          borderColor: "#E8E8E8",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
