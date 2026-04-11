import { AuthBrand } from "./AuthBrand";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-[100dvh] font-sans px-4 py-8 sm:px-6 sm:py-10"
      style={{
        fontFamily: "'Geist', system-ui, sans-serif",
        fontFeatureSettings: '"ss01" 1, "cv01" 1, "cv11" 1',
        backgroundColor: "#F6F6F4",
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.035) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[540px] flex-col items-center justify-center">
        <AuthBrand />

        <div
          className="w-full rounded-[28px] border bg-white px-6 py-7 sm:px-10 sm:py-10"
          style={{
            borderColor: "#E7E5E4",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
