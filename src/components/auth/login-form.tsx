"use client";

import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { getAuthErrorMessage, isValidEmail, isValidPassword } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type AuthTab = "sign-in" | "sign-up";

type PasswordFieldProps = {
  id: string;
  name: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
};

function PasswordField({ id, name, autoComplete, value, onChange, disabled, hasError }: PasswordFieldProps) {
  return (
    <div className="relative">
      <Lock
        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8A8D91]"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        id={id}
        name={name}
        type="password"
        autoComplete={autoComplete}
        placeholder="••••••••"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border bg-[#F5F6F7] py-3 pl-11 pr-4 text-[15px] text-[#1C1E21] outline-none transition",
          "placeholder:text-[#8A8D91]",
          "focus:border-[#0866FF] focus:bg-white focus:ring-2 focus:ring-[#0866FF]/20",
          hasError ? "border-[#E41E3F] focus:border-[#E41E3F] focus:ring-[#E41E3F]/15" : "border-[#CCD0D5]",
          disabled && "opacity-70",
        )}
      />
    </div>
  );
}

function LegalFinePrint({ mode }: { mode: AuthTab }) {
  const verb = mode === "sign-in" ? "continuing" : "signing up";
  return (
    <p className="mt-6 text-center text-[12px] leading-relaxed text-[#65676B]">
      By {verb}, you agree to AdPilot&apos;s{" "}
      <a href="/terms" className="font-medium text-[#0866FF] hover:underline">
        Terms of Service
      </a>{" "}
      and{" "}
      <a href="/privacy" className="font-medium text-[#0866FF] hover:underline">
        Privacy Policy
      </a>
      .
    </p>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [tab, setTab] = useState<AuthTab>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emailRedirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError("Something went wrong. Try again.");
    }
    if (searchParams.get("verified") === "1") {
      setSuccess("Your email is confirmed. You can sign in now.");
    }
  }, [searchParams]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  function switchTab(next: AuthTab) {
    setTab(next);
    setPassword("");
    setError(null);
    setSuccess(null);
  }

  function inputClass(hasFieldError: boolean, withIcon = false) {
    return cn(
      "w-full rounded-lg border bg-[#F5F6F7] py-3 pr-4 text-[15px] text-[#1C1E21] outline-none transition",
      "placeholder:text-[#8A8D91]",
      "focus:border-[#0866FF] focus:bg-white focus:ring-2 focus:ring-[#0866FF]/20",
      hasFieldError ? "border-[#E41E3F] focus:border-[#E41E3F] focus:ring-[#E41E3F]/15" : "border-[#CCD0D5]",
      isLoading && "opacity-70",
      withIcon ? "pl-11" : "px-4",
    );
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your work email to continue.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setIsLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    setIsLoading(false);

    if (authError) {
      setError(getAuthErrorMessage(authError.message));
      return;
    }

    router.replace("/dashboard");
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();
    const trimmedAgency = agencyName.trim();

    if (!trimmedName) {
      setError("Enter your full name.");
      return;
    }
    if (!trimmedEmail) {
      setError("Enter your work email to continue.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!trimmedAgency) {
      setError("Enter your agency name.");
      return;
    }
    if (!isValidPassword(password)) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: trimmedName,
          agency_name: trimmedAgency,
        },
      },
    });
    setIsLoading(false);

    if (authError) {
      setError(getAuthErrorMessage(authError.message));
      return;
    }

    if (data.session) {
      await supabase.rpc("ensure_user_workspace");
      router.replace("/dashboard");
      return;
    }

    setSuccess("Account created. Check your email to confirm your address, then sign in.");
    setPassword("");
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (error) setError(null);
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-8 flex flex-col items-center text-center lg:hidden">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0866FF] to-[#5B4FCF] shadow-lg shadow-[#0866FF]/25">
          <span className="text-lg font-bold text-white">A</span>
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#65676B]">AdPilot</p>
      </div>

      <div className="rounded-2xl border border-[#DADDE1] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-9">
        <div className="hidden lg:block">
          <p className="text-[22px] font-bold tracking-tight text-[#1877F2]">AdPilot</p>
        </div>

        <div className="mt-0 flex border-b border-[#DADDE1] lg:mt-6">
          <button
            type="button"
            onClick={() => switchTab("sign-in")}
            className={cn(
              "flex-1 border-b-2 pb-3 text-[15px] font-semibold transition",
              tab === "sign-in"
                ? "border-[#0866FF] text-[#0866FF]"
                : "border-transparent text-[#65676B] hover:text-[#1C1E21]",
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchTab("sign-up")}
            className={cn(
              "flex-1 border-b-2 pb-3 text-[15px] font-semibold transition",
              tab === "sign-up"
                ? "border-[#0866FF] text-[#0866FF]"
                : "border-transparent text-[#65676B] hover:text-[#1C1E21]",
            )}
          >
            Sign Up
          </button>
        </div>

        <div className="mt-6">
          {tab === "sign-in" ? (
            <>
              <h1 className="text-[22px] font-bold tracking-tight text-[#1C1E21]">Welcome back</h1>
              <p className="mt-2 text-[15px] leading-snug text-[#65676B]">Sign in to your AdPilot account</p>
            </>
          ) : (
            <>
              <h1 className="text-[22px] font-bold tracking-tight text-[#1C1E21]">Create your account</h1>
              <p className="mt-2 text-[15px] leading-snug text-[#65676B]">
                Start your free trial. No credit card needed.
              </p>
            </>
          )}
        </div>

        {success ? (
          <p className="mt-7 text-[15px] leading-snug text-[#65676B]" role="status">
            {success}
          </p>
        ) : null}

        {!success && tab === "sign-in" ? (
          <form onSubmit={handleSignIn} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="sign-in-email" className="mb-1.5 block text-[13px] font-semibold text-[#1C1E21]">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8A8D91]"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <input
                  id="sign-in-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@agency.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isLoading}
                  className={inputClass(!!error, true)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="sign-in-password" className="mb-1.5 block text-[13px] font-semibold text-[#1C1E21]">
                Password
              </label>
              <PasswordField
                id="sign-in-password"
                name="sign-in-password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                hasError={!!error}
              />
            </div>

            {error ? (
              <p className="text-[13px] text-[#E41E3F]" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[15px] font-semibold text-white transition",
                "bg-[#0866FF] hover:bg-[#0554D4] active:bg-[#0447B8]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866FF]",
                "disabled:pointer-events-none disabled:opacity-60",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                </>
              )}
            </button>

            <p className="text-center text-[13px] text-[#65676B]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchTab("sign-up")}
                className="font-semibold text-[#0866FF] hover:underline"
              >
                Sign up
              </button>
            </p>
          </form>
        ) : null}

        {!success && tab === "sign-up" ? (
          <form onSubmit={handleSignUp} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="full-name" className="mb-1.5 block text-[13px] font-semibold text-[#1C1E21]">
                Full Name
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                className={inputClass(!!error)}
              />
            </div>

            <div>
              <label htmlFor="sign-up-email" className="mb-1.5 block text-[13px] font-semibold text-[#1C1E21]">
                Work Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8A8D91]"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <input
                  id="sign-up-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@agency.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isLoading}
                  className={inputClass(!!error, true)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="agency-name" className="mb-1.5 block text-[13px] font-semibold text-[#1C1E21]">
                Agency Name
              </label>
              <input
                id="agency-name"
                name="agencyName"
                type="text"
                autoComplete="organization"
                placeholder="Your agency name"
                value={agencyName}
                onChange={(e) => {
                  setAgencyName(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                className={inputClass(!!error)}
              />
            </div>

            <div>
              <label htmlFor="sign-up-password" className="mb-1.5 block text-[13px] font-semibold text-[#1C1E21]">
                Password
              </label>
              <PasswordField
                id="sign-up-password"
                name="new-password"
                autoComplete="new-password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                hasError={!!error}
              />
              <p className="mt-1 text-[12px] text-[#8A8D91]">At least 8 characters</p>
            </div>

            {error ? (
              <p className="text-[13px] text-[#E41E3F]" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[15px] font-semibold text-white transition",
                "bg-[#0866FF] hover:bg-[#0554D4] active:bg-[#0447B8]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866FF]",
                "disabled:pointer-events-none disabled:opacity-60",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                </>
              )}
            </button>

            <p className="text-center text-[13px] text-[#65676B]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchTab("sign-in")}
                className="font-semibold text-[#0866FF] hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        ) : null}

        <LegalFinePrint mode={tab} />
      </div>
    </div>
  );
}
