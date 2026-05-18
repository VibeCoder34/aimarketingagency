import { BarChart3, Layers, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "All your clients, one place",
    description:
      "Connect multiple Meta ad accounts and manage campaigns, creatives, and spend across every client portfolio in one dashboard.",
  },
  {
    icon: Sparkles,
    title: "AI that actually does the work",
    description:
      "Get instant performance analysis, optimization recommendations, and creative suggestions — powered by AI trained on what moves ROAS.",
  },
  {
    icon: BarChart3,
    title: "Reports your clients will love",
    description:
      "Auto-generated reports with ROAS, CPM, CTR, and spend breakdowns. Clients get clarity, you get hours back.",
  },
] as const;

export function AuthMarketingPanel() {
  return (
    <aside className="relative hidden w-[min(480px,42vw)] shrink-0 overflow-hidden lg:flex lg:flex-col lg:justify-between">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0866FF] via-[#0554D4] to-[#5B4FCF]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, white 0%, transparent 45%), radial-gradient(circle at 80% 70%, #A855F7 0%, transparent 50%)",
        }}
        aria-hidden
      />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#0668E1]/40 blur-3xl" aria-hidden />

      <div className="relative flex flex-1 flex-col p-10 xl:p-12">
        <div>
          <p className="text-lg font-bold tracking-tight text-white">AdPilot</p>
        </div>

        <div className="mt-auto pt-16">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
            AI-POWERED AD MANAGEMENT
          </p>
          <h2 className="mt-5 max-w-sm text-3xl font-bold leading-tight tracking-tight text-white xl:text-[2rem] xl:leading-[1.15]">
            Stop guessing. Start scaling.
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/80">
            AdPilot gives your agency AI-powered insights, automated reports, and creative recommendations — so you
            can focus on growing client ROAS, not babysitting dashboards.
          </p>

          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm leading-snug text-white/75">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-12 text-xs text-white/50">
          AdPilot is an independent platform built for performance marketing agencies.
        </p>
      </div>
    </aside>
  );
}
