"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  AI_ACTION_RESPONSES,
  AI_PAGE_CONTEXTS,
  getContextLine,
  getGenericChatResponse,
  resolvePageKey,
} from "@/lib/mock/ai-companion.mock";
import type {
  AiConversationMessage,
  AiGeneratedOutput,
  AiOutputActionState,
  AiPageKey,
} from "@/types/ai-companion";

type OutputWithState = AiGeneratedOutput & { actionState: AiOutputActionState };

type AiCompanionContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  pageKey: AiPageKey;
  contextLine: string;
  insight: string;
  suggestedActions: { id: string; label: string }[];
  messages: AiConversationMessage[];
  outputs: OutputWithState[];
  campaignName?: string;
  setCampaignContext: (name: string | undefined) => void;
  runSuggestedAction: (actionId: string, label?: string) => void;
  sendMessage: (text: string) => void;
  runInlineAction: (actionId: string, label?: string) => void;
  updateOutputAction: (outputId: string, action: keyof AiOutputActionState) => void;
};

const AiCompanionContext = createContext<AiCompanionContextValue | null>(null);

function uid() {
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AICompanionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const pageKey = resolvePageKey(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiConversationMessage[]>([]);
  const [outputs, setOutputs] = useState<OutputWithState[]>([]);
  const [campaignName, setCampaignName] = useState<string | undefined>();

  const pageContext = AI_PAGE_CONTEXTS[pageKey];
  const contextLine = getContextLine(pageKey, campaignName);

  useEffect(() => {
    if (pageKey !== "campaign-detail") setCampaignName(undefined);
  }, [pageKey]);

  const appendExchange = useCallback((userLabel: string, response: { assistantMessage: string; output?: AiGeneratedOutput }) => {
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", content: userLabel },
      { id: uid(), role: "assistant", content: response.assistantMessage },
    ]);
    if (response.output) {
      setOutputs((prev) => {
        if (prev.some((o) => o.id === response.output!.id)) return prev;
        return [...prev, { ...response.output!, actionState: {} }];
      });
    }
  }, []);

  const runSuggestedAction = useCallback(
    (actionId: string, label?: string) => {
      const response = AI_ACTION_RESPONSES[actionId] ?? {
        assistantMessage: "I've prepared a response based on your current account context.",
      };
      const actionLabel = label ?? AI_PAGE_CONTEXTS[pageKey].suggestedActions.find((a) => a.id === actionId)?.label ?? actionId;
      appendExchange(actionLabel, response);
      setIsOpen(true);
    },
    [appendExchange, pageKey],
  );

  const runInlineAction = useCallback(
    (actionId: string, label?: string) => {
      runSuggestedAction(actionId, label);
    },
    [runSuggestedAction],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const response = getGenericChatResponse(pageKey, trimmed);
      appendExchange(trimmed, response);
    },
    [appendExchange, pageKey],
  );

  const updateOutputAction = useCallback((outputId: string, action: keyof AiOutputActionState) => {
    setOutputs((prev) =>
      prev.map((o) =>
        o.id === outputId
          ? {
              ...o,
              actionState: {
                ...o.actionState,
                [action]: true,
                ...(action === "dismissed" ? { dismissed: true } : {}),
              },
            }
          : o,
      ),
    );
  }, []);

  const value = useMemo<AiCompanionContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((v) => !v),
      pageKey,
      contextLine,
      insight: pageContext.insight,
      suggestedActions: pageContext.suggestedActions,
      messages,
      outputs: outputs.filter((o) => !o.actionState.dismissed),
      campaignName,
      setCampaignContext: setCampaignName,
      runSuggestedAction,
      sendMessage,
      runInlineAction,
      updateOutputAction,
    }),
    [
      isOpen,
      pageKey,
      contextLine,
      pageContext,
      messages,
      outputs,
      campaignName,
      runSuggestedAction,
      sendMessage,
      runInlineAction,
      updateOutputAction,
    ],
  );

  return <AiCompanionContext.Provider value={value}>{children}</AiCompanionContext.Provider>;
}

export function useAICompanion() {
  const ctx = useContext(AiCompanionContext);
  if (!ctx) throw new Error("useAICompanion must be used within AICompanionProvider");
  return ctx;
}

export function useAICompanionOptional() {
  return useContext(AiCompanionContext);
}
