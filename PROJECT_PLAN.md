# Project Plan — AI-Driven Chatbot System (Monorepo with Next.js)

## 1) Goals & Constraints

### Primary goal
Build a **clean, simple, generic** AI-driven chatbot platform in a **monolithic Next.js repository** that can be:
- hosted in a GitHub repository,
- deployed on Vercel for frontend/API routes,
- run without any database (CSV files only).

### Constraints from requirements
- Keep architecture super simple.
- No external database; use CSV files as storage.
- Include lots of sample data.
- Avoid unnecessary complexity and use simple technology choices.

---

## 2) High-Level Architecture (Simple Monolith)

A single Next.js app (App Router) with:
- **UI pages/components** for chatbot interaction and basic admin-like views.
- **API routes** for chat, feedback, and dataset access.
- **CSV data layer** using local files under `/data`.
- **Service layer** in `/lib` for prompt handling, CSV parsing, and simple response logic.

### Suggested structure

```text
/ (repo root)
├─ app/
│  ├─ page.tsx                 # Chat UI
│  ├─ history/page.tsx         # Conversation history view
│  ├─ datasets/page.tsx        # View sample datasets
│  └─ api/
│     ├─ chat/route.ts         # Chat endpoint
│     ├─ feedback/route.ts     # Save ratings/comments to CSV
│     └─ sessions/route.ts     # Read/write session CSV rows
├─ components/
│  ├─ ChatWindow.tsx
│  ├─ MessageBubble.tsx
│  └─ InputBar.tsx
├─ lib/
│  ├─ csv.ts                   # CSV read/write helpers
│  ├─ chatbot.ts               # Simple response generation pipeline
│  ├─ retrieval.ts             # Simple keyword retrieval from CSV knowledge base
│  └─ types.ts
├─ data/
│  ├─ knowledge_base.csv
│  ├─ faq.csv
│  ├─ intents.csv
│  ├─ sessions.csv
│  ├─ messages.csv
│  └─ feedback.csv
├─ public/
│  └─ sample-prompts.json
├─ package.json
├─ README.md
└─ .env.example
```

---

## 3) Functional Scope (MVP)

### End-user features
1. Chat interface with user + assistant messages.
2. Start a new chat session.
3. See recent conversation history.
4. Basic response generation using:
   - rule/intent matching,
   - keyword retrieval from CSV knowledge base,
   - optional fallback response.

### Optional (still simple)
5. Thumbs up/down feedback per response saved to CSV.
6. Lightweight dataset viewer page for transparency/debugging.

### Explicitly out of scope (to stay simple)
- Authentication/authorization.
- Real-time websockets.
- External vector databases.
- Complex orchestration/multi-agent frameworks.

---

## 4) Data Model in CSV (No DB)

### `knowledge_base.csv`
- `id`, `category`, `title`, `content`, `keywords`

### `faq.csv`
- `id`, `question`, `answer`, `tags`

### `intents.csv`
- `id`, `intent`, `sample_utterance`, `response_template`

### `sessions.csv`
- `session_id`, `created_at`, `last_active_at`, `topic`

### `messages.csv`
- `message_id`, `session_id`, `role`, `text`, `timestamp`

### `feedback.csv`
- `feedback_id`, `message_id`, `rating`, `comment`, `timestamp`

### Sample data volume target
- 100–300 knowledge base rows
- 50–100 FAQ rows
- 50+ intent/utterance rows
- 30+ sample sessions with messages
- 50+ feedback rows

This gives realistic demo data while keeping files manageable.

---

## 5) Chatbot Logic (Simple AI-driven behavior)

Response pipeline per user message:
1. Normalize text (lowercase, trim, basic token split).
2. Try direct intent match from `intents.csv`.
3. If no intent confidence, run keyword match over `faq.csv` and `knowledge_base.csv`.
4. Return best matching answer/content snippet.
5. If no meaningful match, return generic fallback.
6. Store user and assistant turns to `messages.csv`.

This is intentionally deterministic/simple and can later be upgraded to call an LLM API with minimal refactor.

---

## 6) API Design (Minimal)

### `POST /api/chat`
Input:
```json
{ "sessionId": "string", "message": "string" }
```
Output:
```json
{ "reply": "string", "messageId": "string", "sources": [] }
```

### `GET /api/sessions?sessionId=...`
- Fetch session metadata and messages.

### `POST /api/sessions`
- Create new session row.

### `POST /api/feedback`
- Save rating/comment for assistant message.

---

## 7) UI Plan (Next.js)

### Main page (`/`)
- Minimal chat layout (header, message list, input).
- New chat button.
- Optional quick prompt chips.

### History page (`/history`)
- List of session IDs and timestamps.
- Click to inspect messages.

### Datasets page (`/datasets`)
- Read-only tables for CSV previews.

Design goal: clean neutral styling with plain CSS/Tailwind (keep dependency footprint low).

---

## 8) Deployment Plan

### GitHub
- Single monorepo with clean README and setup instructions.

### Vercel
- Deploy Next.js app directly.
- Ensure API routes work in serverless mode.
- Use writable temp/file strategy notes for production behavior:
  - For persistent CSV writes in production, recommend a small external store or periodic export flow.
  - For demo simplicity, local CSV write support is fine for local/dev and basic demos.

---

## 9) Implementation Phases

### Phase 1 — Scaffold
- Initialize Next.js TypeScript project.
- Add base folder structure and utility modules.

### Phase 2 — CSV Data Layer
- Build robust CSV read/write helpers.
- Add seed/sample CSV files with strong demo coverage.

### Phase 3 — Chat Engine
- Implement intent + keyword retrieval logic.
- Add chat API route and message persistence.

### Phase 4 — Frontend
- Build chat page, history page, dataset page.
- Keep UI intentionally minimal.

### Phase 5 — Feedback & Polish
- Add feedback endpoint/UI hooks.
- Improve empty/error states.
- Add README with local + Vercel deployment steps.

---

## 10) Acceptance Criteria

1. Project runs with `npm install && npm run dev`.
2. User can chat and get deterministic responses.
3. Sessions/messages/feedback are stored and readable via CSV.
4. Repo includes substantial realistic sample CSV data.
5. App deploys on Vercel without custom infra.
6. Codebase remains simple, readable, and generic.

---

## 11) Risks & Mitigations (Lightweight)

- **CSV concurrency limits**: keep single-writer assumptions for demo.
- **Serverless file write behavior**: document that persistent writes may need alternate storage in production.
- **Data size growth**: keep CSV files moderate and paginate preview pages.

---

## 12) What I Need From You to Start Coding

Please approve this plan and confirm these defaults:
1. **Styling choice**: Tailwind CSS or plain CSS modules.
2. **Chat intelligence mode**: deterministic CSV retrieval only, or include optional OpenAI API hook behind env flag.
3. **Sample data size**: small (~100 rows) or larger (~300+ rows).

Once approved, I’ll implement exactly this MVP in a clean, minimal monolithic Next.js repo.
