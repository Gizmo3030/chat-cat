import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { formatClassificationPrompt } from "@/lib/classification-config";
import type { ChatApiResponse, Role } from "@/types/chat";

const roles = ["user", "assistant", "system"] as const satisfies Role[];

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(roles),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

const DEFAULT_BASE_URL = "https://www.ollama.gizmosdomain.com";
const DEFAULT_MODEL = "Gemma3";

function getBaseUrl() {
  const configured = process.env.OLLAMA_BASE_URL?.trim();
  if (!configured) return DEFAULT_BASE_URL;
  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

function parseAssistantPayload(raw: unknown): ChatApiResponse {
  if (typeof raw !== "string") {
    throw new Error("Ollama response did not include assistant content");
  }

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Could not locate JSON payload in assistant response");
  }

  const jsonText = raw.slice(start, end + 1);
  const parsed = JSON.parse(jsonText) as Partial<ChatApiResponse>;

  if (!parsed.title || !parsed.assistantReply || !parsed.classification) {
    throw new Error("Assistant response missing required fields");
  }

  if (!Array.isArray(parsed.recommendedTools)) {
    parsed.recommendedTools = [];
  }

  return parsed as ChatApiResponse;
}

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl();
  const model = process.env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL;

  let body: z.infer<typeof bodySchema>;
  try {
    const json = await request.json();
    body = bodySchema.parse(json);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid payload", details: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }

  try {
    const systemPrompt = formatClassificationPrompt();
    const payload = {
      model,
      stream: false,
      messages: [{ role: "system" as const, content: systemPrompt }, ...body.messages],
    };

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    const rawContent = data?.message?.content ?? data?.response;
    const parsed = parseAssistantPayload(rawContent);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("/api/chat", error);
    return NextResponse.json(
      { error: "Failed to reach Ollama", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
