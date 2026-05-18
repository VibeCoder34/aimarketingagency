import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in · AdPilot",
  description: "Sign in or create your AdPilot account.",
};

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="auth-meta-page min-h-screen bg-[var(--meta-bg)] font-sans text-[var(--meta-text)] antialiased">
      {children}
    </div>
  );
}
