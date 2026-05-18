import type { User } from "@supabase/supabase-js";

export function isEmailConfirmed(user: User | null | undefined): boolean {
  return Boolean(user?.email_confirmed_at);
}

export function getAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("email not confirmed") || lower.includes("email not verified")) {
    return "Please confirm your email before signing in. Check your inbox for the confirmation link.";
  }
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "Incorrect email or password. Try again.";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (lower.includes("password") && (lower.includes("short") || lower.includes("least"))) {
    return "Password must be at least 8 characters.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (lower.includes("invalid") && lower.includes("email")) {
    return "Enter a valid email address.";
  }

  return "Something went wrong. Try again.";
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}
