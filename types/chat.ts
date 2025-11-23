export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
}

export interface ClassificationOption {
  label: string;
  description: string;
}

export interface ClassificationResult extends ClassificationOption {
  confidence: number;
  summary: string;
}

export interface ToolCatalogItem {
  name: string;
  description: string;
  mcpServer?: string;
}

export interface ToolSuggestion {
  name: string;
  reason: string;
  mcpServer?: string;
}

export interface ChatApiResponse {
  title: string;
  assistantReply: string;
  classification: ClassificationResult;
  recommendedTools: ToolSuggestion[];
}
