"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  Bot,
  MessageCircleMore,
  SendHorizontal,
  Server,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";

import {
  CLASSIFICATION_OPTIONS,
  TOOL_CATALOG,
} from "@/lib/classification-config";
import type {
  ChatApiResponse,
  ChatMessage,
  ClassificationResult,
  ToolSuggestion,
} from "@/types/chat";

const modelLabel = process.env.NEXT_PUBLIC_MODEL_LABEL || "Gemma3 @ Ollama";

const initialAssistant: ChatMessage = {
  id: "assistant-intro",
  role: "assistant",
  content:
    "Hi! Drop a message and I'll respond while classifying the chat and suggesting MCP tooling.",
  createdAt: new Date().toISOString(),
};

function nextId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: nextId(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistant]);
  const [input, setInput] = useState("");
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [tools, setTools] = useState<ToolSuggestion[]>([]);
  const [insightTitle, setInsightTitle] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isSending]);

  const canSubmit = input.trim().length > 0 && !isSending;

  const handleSend = useCallback(async () => {
    if (!canSubmit) return;

    const trimmed = input.trim();
    const userMessage = createMessage("user", trimmed);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    const payloadMessages = [...messages, userMessage]
      .filter((msg) => msg.role !== "system")
      .map(({ role, content }) => ({ role, content }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
      }

      const data = (await response.json()) as ChatApiResponse;
      setInsightTitle(data.title);
      setClassification(data.classification);
      setTools(data.recommendedTools);
      setMessages((prev) => [...prev, createMessage("assistant", data.assistantReply)]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          "I could not reach the Ollama service. Please verify that it is running and reachable.",
        ),
      ]);
    } finally {
      setIsSending(false);
    }
  }, [canSubmit, input, messages]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const helperText = useMemo(() => {
    if (error) return error;
    if (!classification) {
      return "Waiting for the first classification...";
    }
    return `${Math.round(classification.confidence * 100)}% confidence in ${classification.label}.`;
  }, [classification, error]);

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 bg-slate-950 px-4 py-8 text-white lg:flex-row lg:px-10">
      <section className="flex flex-1 flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-slate-900/50 backdrop-blur">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Classification Copilot</p>
            <h1 className="text-3xl font-semibold text-white">Chat Insight Workbench</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm font-medium text-emerald-200">
            <Server className="h-4 w-4" />
            {modelLabel}
          </span>
        </header>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-sm font-semibold tracking-wide text-amber-100">Latest classification</span>
          </div>
          {classification ? (
            <div className="mt-3 space-y-2">
              <p className="text-lg font-semibold text-white">
                {insightTitle ?? "Conversation insight"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                  {classification.label}
                </span>
                <span className="text-xs uppercase tracking-widest text-slate-400">
                  {Math.round(classification.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm text-slate-200">{classification.summary}</p>
              <p className="text-xs text-slate-400">{classification.description}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              {insightTitle ?? "Send a message to see how Gemma3 categorizes the conversation."}
            </p>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/5 bg-black/20 p-4">
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const Icon = isUser ? UserRound : Bot;
            const bubbleClass = isUser
              ? "bg-emerald-500/10 border border-emerald-500/30"
              : "bg-white/5 border border-white/10";
            const alignment = isUser ? "items-end" : "items-start";

            return (
              <div
                key={message.id}
                className={clsx("flex flex-col gap-2", alignment)}
                ref={index === messages.length - 1 ? latestMessageRef : undefined}
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <Icon className="h-3 w-3" />
                  {isUser ? "You" : "Assistant"}
                </div>
                <div className={clsx("w-full rounded-2xl px-4 py-3 text-sm leading-relaxed text-slate-100", bubbleClass)}>
                  {message.content}
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Sparkles className="h-4 w-4 animate-spin" />
              Thinking with classification prompt...
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <label htmlFor="composer" className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            <MessageCircleMore className="h-4 w-4" />
            Compose a message
          </label>
          <textarea
            id="composer"
            rows={4}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Explain the conversation or drop a question. Shift+Enter for new line."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>{helperText}</span>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400/90 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-400/30"
            >
              Send
              <SendHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <aside className="lg:w-96">
        <div className="sticky top-8 flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Workflow className="h-4 w-4" />
              Recommended tools
            </div>
            {tools.length ? (
              <ul className="space-y-3">
                {tools.map((tool) => (
                  <li key={`${tool.name}-${tool.mcpServer ?? "na"}`} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                    <div className="flex items-center justify-between text-sm font-semibold text-white">
                      <span>{tool.name}</span>
                      {tool.mcpServer && (
                        <span className="text-xs uppercase tracking-widest text-emerald-300">
                          {tool.mcpServer}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-300">{tool.reason}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No tooling suggested yet.</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Classification palette
            </div>
            <ul className="space-y-3">
              {CLASSIFICATION_OPTIONS.map((option) => (
                <li key={option.label} className="rounded-2xl border border-white/5 bg-white/5 p-3">
                  <p className="text-sm font-semibold text-white">{option.label}</p>
                  <p className="text-xs text-slate-300">{option.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Server className="h-4 w-4" />
              MCP registry snapshot
            </div>
            <ul className="space-y-3">
              {TOOL_CATALOG.map((tool) => (
                <li key={tool.name} className="rounded-2xl border border-white/5 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2 text-sm font-semibold text-white">
                    <span>{tool.name}</span>
                    {tool.mcpServer && (
                      <span className="text-xs uppercase tracking-widest text-slate-300">
                        {tool.mcpServer}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{tool.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
