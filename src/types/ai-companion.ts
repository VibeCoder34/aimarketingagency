export type AiPageKey =
  | "overview"
  | "campaigns"
  | "campaign-detail"
  | "ai-insights"
  | "creatives"
  | "reports"
  | "analytics"
  | "alerts"
  | "settings";

export type AiOutputType =
  | "report"
  | "creative_brief"
  | "optimization_plan"
  | "client_message"
  | "campaign_diagnosis"
  | "task_list"
  | "executive_summary";

export type AiOutputStatus = "Draft" | "Suggested" | "Ready" | "Applied";

export type AiGeneratedOutput = {
  id: string;
  type: AiOutputType;
  title: string;
  description: string;
  status: AiOutputStatus;
  preview?: string;
};

export type AiSuggestedAction = {
  id: string;
  label: string;
};

export type AiPageContext = {
  contextLine: string;
  insight: string;
  suggestedActions: AiSuggestedAction[];
};

export type AiConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AiActionResponse = {
  assistantMessage: string;
  output?: AiGeneratedOutput;
};

export type AiOutputActionState = {
  saved?: boolean;
  addedToReport?: boolean;
  copied?: boolean;
  taskCreated?: boolean;
  dismissed?: boolean;
};
