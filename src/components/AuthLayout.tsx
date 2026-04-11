interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center p-5 sm:p-4"
      style={{
        fontFamily: "'Geist', system-ui, sans-serif",
        backgroundColor: "#F7F7F8",
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="w-full max-w-[480px] animate-in">
        <div className="mb-6 flex flex-col items-center gap-2.5">
          <img
            src="/logo-mark-dark.svg"
            alt="GestionRoom"
            className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
          />
          <div className="flex flex-col items-center">
            <span className="text-[22px] sm:text-2xl font-semibold tracking-[-0.02em] text-foreground">
              GestionRoom
            </span>
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.12em] text-[#999] leading-none">
              Panel de Control
            </span>
          </div>
        </div>

        <div
          className="rounded-xl sm:rounded-2xl border p-6 sm:p-10 bg-white"
          style={{
            borderColor: "#EBEBEB",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
