import type { ClassificationOption, ToolCatalogItem } from "@/types/chat";

export const CLASSIFICATION_OPTIONS: ClassificationOption[] = [
  {
    label: "Bug Report",
    description:
      "Something is broken, throwing errors, or not behaving as documented.",
  },
  {
    label: "Feature Request",
    description:
      "User wants a new capability, enhancement, or change in behavior.",
  },
  {
    label: "Integration Support",
    description:
      "Need help wiring services, APIs, environments, or tooling together.",
  },
  {
    label: "Optimization & Best Practices",
    description:
      "Looking to improve performance, reliability, or developer workflow.",
  },
  {
    label: "Business Intake (BITS)",
    description:
      "Requests that must be logged or triaged through the Business Intake Ticketing System.",
  },
  {
    label: "Room & Facilities Scheduling (Archibus)",
    description:
      "Anything tied to reserving spaces, managing facilities, or Archibus workflows.",
  },
  {
    label: "Project Governance (PMOCE)",
    description:
      "Program/portfolio tracking, milestones, budgets, or approvals within the PMOCE suite.",
  },
  {
    label: "General Q&A",
    description:
      "Exploratory questions, clarification, or casual conversation.",
  },
];

export const TOOL_CATALOG: ToolCatalogItem[] = [
  {
    name: "filesystem",
    description: "Read, edit, or create project files and assets.",
    mcpServer: "filesystem",
  },
  {
    name: "git",
    description: "Inspect history, branches, or staged changes.",
    mcpServer: "git",
  },
  {
    name: "terminal",
    description: "Run builds, tests, or framework CLIs via shell commands.",
    mcpServer: "shell",
  },
  {
    name: "web-search",
    description: "Look up documentation or external references.",
    mcpServer: "search",
  },
  {
    name: "browser",
    description: "Preview running apps or visit remote dashboards.",
    mcpServer: "browser",
  },
  {
    name: "BITS",
    description: "Business Intake Ticketing System for logging and tracking enterprise requests.",
    mcpServer: "bits",
  },
  {
    name: "Archibus",
    description: "Facilities and room reservation platform used for workspace scheduling.",
    mcpServer: "archibus",
  },
  {
    name: "PMOCE",
    description: "Project management suite covering portfolio plans, budgets, and approvals.",
    mcpServer: "pmoce",
  },
];

export function formatClassificationPrompt(): string {
  const labels = CLASSIFICATION_OPTIONS.map(
    (option) => `- ${option.label}: ${option.description}`,
  ).join("\n");

  const tools = TOOL_CATALOG.map((tool) => {
    const mcp = tool.mcpServer ? ` (MCP: ${tool.mcpServer})` : "";
    return `- ${tool.name}${mcp}: ${tool.description}`;
  }).join("\n");

  return `You must respond with valid minified JSON using this TypeScript type:\n` +
    `type ChatInsight = {\n` +
    `  title: string; // short, punchy, emojis allowed\n` +
    `  assistantReply: string;\n` +
    `  classification: { label: string; description: string; confidence: number; summary: string; };\n` +
    `  recommendedTools: { name: string; reason: string; mcpServer?: string; }[];\n` +
    `};\n` +
    `Allowed classifications:\n${labels}\n` +
    `Choose the single best label and include its description plus a 0-1 confidence score.\n` +
    `Craft “title” as a concise headline (<= 8 words) that may include emojis if helpful.\n` +
    `Use the following tool & MCP catalog when suggesting tooling (omit if none apply):\n${tools}\n` +
    `Never add commentary outside of the JSON payload.`;
}
