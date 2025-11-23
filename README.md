# Chat Classification Copilot

A Next.js 16 + Tailwind 4 workspace styled after the shadcn.ai chat experience. Each message is sent to your Ollama instance (Gemma3 by default) and returns three artifacts: the assistant reply, a conversation label with summary + confidence, and suggested MCP tools/servers to continue the work.

## Requirements

- Node.js 18.18+ (or 20+)
- npm 10+
- An accessible Ollama endpoint running the `Gemma3` model (adjust the `.env` values if you host elsewhere)

## Setup

1. Copy the environment template and supply your values:

       cp .env.example .env.local

   | Variable | Description |
   | --- | --- |
   | `OLLAMA_BASE_URL` | Base URL for the Ollama REST API (e.g., `http://localhost:11434`). |
   | `OLLAMA_MODEL` | Model identifier to query. Defaults to `Gemma3`. |
   | `NEXT_PUBLIC_MODEL_LABEL` | Optional friendly label that shows up in the UI header. |

2. Install dependencies:

       npm install

3. Start the dev server and open `http://localhost:3000`:

       npm run dev

## How it works

- `app/api/chat/route.ts` posts the entire chat transcript to Ollama, enforcing a JSON-only response that includes `assistantReply`, `classification`, and `recommendedTools`.
- `lib/classification-config.ts` centralizes the allowed labels/descriptions and the MCP/tool catalog so both the LLM prompt and the UI stay in sync.
- `components/chat-panel.tsx` renders the chat stream, the classification highlight, and the live tool recommendations in a shadcn-style layout.

## Customizing

- Change the label set or tool registry by editing `CLASSIFICATION_OPTIONS` and `TOOL_CATALOG` inside `lib/classification-config.ts`.
- Point at a different model or endpoint by tweaking `OLLAMA_MODEL`, `OLLAMA_BASE_URL`, and `NEXT_PUBLIC_MODEL_LABEL` in `.env.local` (restart `npm run dev` after editing env vars).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with hot reload. |
| `npm run build` | Produce an optimized production build. |
| `npm run start` | Serve the production build locally. |
| `npm run lint` | Run ESLint using the Next.js config. |

## Troubleshooting

- **No classification returned** – ensure the Ollama endpoint is reachable and `Gemma3` is pulled (`ollama pull gemma3`).
- **500 from `/api/chat`** – check the terminal for the exact error (TLS, DNS, auth, etc.).
- **Tool suggestions feel off** – refine the descriptions in `lib/classification-config.ts` so the prompt has clearer guidance.

