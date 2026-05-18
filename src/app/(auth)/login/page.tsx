import { Suspense } from "react";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <AuthMarketingPanel />

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <Suspense fallback={<div className="w-full max-w-[400px]" aria-hidden />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
