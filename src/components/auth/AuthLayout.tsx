import { AuthBrand } from "./AuthBrand";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center p-5 sm:p-6 font-sans"
      style={{
        fontFamily: "'Geist', system-ui, sans-serif",
        backgroundColor: "#F7F7F8",
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    >
      <div className="w-full max-w-[500px]">
        <AuthBrand />
        <div
          className="rounded-2xl p-6 sm:p-10 bg-white"
          style={{
            border: "1px solid #E8E8E8",
            boxShadow:
              "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
