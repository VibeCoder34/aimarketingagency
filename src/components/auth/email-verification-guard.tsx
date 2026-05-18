"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { isEmailConfirmed } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function EmailVerificationGuard({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setReady(true);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const confirmed = isEmailConfirmed(user);

  async function handleResend() {
    if (!user?.email) return;
    setResending(true);
    setResendMessage(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setResending(false);
    setResendMessage(
      error ? "Could not resend the email. Try again in a moment." : "Confirmation email sent. Check your inbox.",
    );
  }

  return (
    <>
      {ready && user && !confirmed ? (
        <div
          className="border-b border-amber-200 bg-amber-50 px-6 py-3"
          role="alert"
        >
          <div className="flex flex-wrap items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-950">Email verification required</p>
              <p className="mt-0.5 text-sm text-amber-900/90">
                Confirm your email to use AdPilot. We sent a link to{" "}
                <span className="font-medium">{user.email}</span>. Until you verify, dashboard features are
                disabled.
              </p>
              {resendMessage ? <p className="mt-2 text-xs text-amber-800">{resendMessage}</p> : null}
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="shrink-0 rounded-[var(--adpilot-radius-item)] border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 transition hover:bg-amber-100 disabled:opacity-60"
            >
              {resending ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Sending…
                </span>
              ) : (
                "Resend email"
              )}
            </button>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          ready && user && !confirmed && "pointer-events-none select-none opacity-[0.45]",
        )}
        aria-hidden={ready && user && !confirmed ? true : undefined}
      >
        {children}
      </div>
    </>
  );
}
