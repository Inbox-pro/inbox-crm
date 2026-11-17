# External Integrations

**Analysis Date:** 2026-11-17

## APIs & External Services

**Artificial Intelligence & LLMs:**
- Google Gemini API - Conversational assistant, lead scoring heuristics, follow-up generation (`src/services/aiService.ts`)
  - SDK/Client: `@google/genai` v2.4.0
  - Auth: `GEMINI_API_KEY` (configured in `.env` / environment)
  - Current Status: Frontend client mock active with structure mirroring `@google/genai` calls; backend proxy integration architected in `DOCUMENTATION.md`

## Data Storage

**Databases:**
- Current Implementation: In-memory reactive mock database with `localStorage` persistence (`src/mock/db.ts`)
  - Storage key: `nexus_crm_store`, `nexus_crm_date_v5`
  - Multi-tenant isolation: Scoped by `organizationId` (`org_nexus_01`)
- Production Target (per `DOCUMENTATION.md`):
  - Database: MongoDB
  - Client / ORM: Mongoose with tenant query scoping (`organizationId`)

**File Storage:**
- Local filesystem / Static assets only (`public/`, avatar URLs from external CDNs like Unsplash)

**Caching:**
- Browser `localStorage` caching for demo data persistence across sessions (`src/mock/db.ts`)

## Authentication & Identity

**Auth Provider:**
- Custom simulated RBAC Authentication (`src/context/AuthContext.tsx`, `src/services/authService.ts`)
  - Implementation: Session persistence in `localStorage` (`nexus_auth_user`), password verification against `MOCK_USERS` in `src/mock/users.ts`
  - Supported Roles: `Super Admin`, `Admin`, `Manager`, `Sales`, `Viewer`
  - Permission matrix: 23 granular permission flags defined in `src/types/index.ts`

## Monitoring & Observability

**Error Tracking:**
- None configured (recommended: Sentry or OpenTelemetry)

**Logs:**
- Browser console and custom toast notification system (`src/context/ToastContext.tsx`)

## CI/CD & Deployment

**Hosting:**
- Vercel-ready via `vercel.json` SPA rewrite rules
- Local dev host: Vite dev server on port 3000 (`vite.config.ts`)

**CI Pipeline:**
- None configured in repository (recommended: GitHub Actions with `npm run lint` and build validation)

## Environment Configuration

**Required env vars:**
- `GEMINI_API_KEY` - Google AI Studio / Gemini API key
- `VITE_API_BASE_URL` - Endpoint prefix for backend REST services (defaults to `/api`)

**Secrets location:**
- `.env` / `.env.local` (local only; git-ignored via `.gitignore`)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

---

*Integration audit: 2026-11-17*

