"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PageToolbarAction = {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export type PageToolbarConfig = {
  meta?: ReactNode;
  primaryAction?: PageToolbarAction;
  secondaryAction?: PageToolbarAction;
  showExport?: boolean;
  showDateRange?: boolean;
  showAccount?: boolean;
};

type PageToolbarContextValue = {
  config: PageToolbarConfig;
  setConfig: (config: PageToolbarConfig) => void;
};

const PageToolbarContext = createContext<PageToolbarContextValue | null>(null);

export function PageToolbarProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PageToolbarConfig>({});

  const value = useMemo(() => ({ config, setConfig }), [config]);

  return <PageToolbarContext.Provider value={value}>{children}</PageToolbarContext.Provider>;
}

export function usePageToolbarContext() {
  const ctx = useContext(PageToolbarContext);
  if (!ctx) throw new Error("usePageToolbarContext must be used within PageToolbarProvider");
  return ctx;
}

/** Registers page-specific toolbar actions on the global Topbar (renders nothing). */
export function PageToolbarSetup({
  meta,
  primaryAction,
  secondaryAction,
  showExport = true,
  showDateRange = true,
  showAccount = true,
}: PageToolbarConfig) {
  const { setConfig } = usePageToolbarContext();

  useLayoutEffect(() => {
    setConfig({
      meta,
      primaryAction,
      secondaryAction,
      showExport,
      showDateRange,
      showAccount,
    });
  }, [setConfig, meta, primaryAction, secondaryAction, showExport, showDateRange, showAccount]);

  useEffect(() => () => setConfig({}), [setConfig]);

  return null;
}
