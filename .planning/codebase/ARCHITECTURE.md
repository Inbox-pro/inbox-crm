<!-- refreshed: 2026-11-17 -->
# Architecture

**Analysis Date:** 2026-11-17

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Presentation Layer (React 19 SPA)                  │
├──────────────────┬──────────────────┬──────────────────┬────────────────┤
│    Dashboard     │  Leads & Deals   │ Contacts & Corps │  AI Assistant  │
│ `src/pages/      │ `src/pages/      │ `src/pages/      │ `src/pages/    │
│  Dashboard.tsx`  │  Leads.tsx` etc. │  Contacts.tsx`   │  AiAssistant`  │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴────────┬───────┘
         │                  │                  │                  │
         ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Context & Global State Layer                       │
│  AuthContext • ThemeContext • ToastContext • LanguageContext (i18n)     │
│ `src/context/`                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Typed Service & Client Layer                      │
│  leadsService • dealsService • companiesService • aiService • api.ts    │
│ `src/services/` (Wraps all responses in `ApiResponse<T>`)               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│  Current: Reactive Mock DB           │  │  Production Target:           │
│  In-Memory + LocalStorage Sync       │  │  Node.js / Express API        │
│ `src/mock/db.ts`                     │  │  MongoDB + Gemini 2.5 SDK     │
└──────────────────────────────────────┘  └───────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App` | Root component with providers hierarchy and routing configuration | `src/App.tsx` |
| `AppLayout` | Persistent shell rendering Sidebar, TopNav, and dynamic `<Outlet />` | `src/components/layout/AppLayout.tsx` |
| `ProtectedRoute` | Route guard checking authenticated user session and role | `src/components/auth/ProtectedRoute.tsx` |
| `AuthContext` | User authentication, session persistence, role check, login/logout | `src/context/AuthContext.tsx` |
| `ThemeContext` | Dark/light theme toggle with HTML class persistence | `src/context/ThemeContext.tsx` |
| `LanguageContext` | Multilingual translation dictionary and active language state | `src/context/LanguageContext.tsx` |
| `ToastContext` | Transient user notifications and status alerts | `src/context/ToastContext.tsx` |
| `mockDb` | Multi-tenant in-memory data store with localStorage serialization | `src/mock/db.ts` |
| `aiService` | Simulated Copilot conversational analysis and intent responses | `src/services/aiService.ts` |
| `Dashboard` | Executive analytics, KPI ribbons, revenue vs target charts | `src/pages/Dashboard.tsx` |
| `Leads` | Lead lifecycle, AI scoring badges, 1-click deal conversion | `src/pages/Leads.tsx` |
| `Deals` | Visual Kanban board and list view for deal stages | `src/pages/Deals.tsx` |

## Pattern Overview

**Overall:** Service-Oriented Single Page Architecture with decoupled mock-to-REST facade.

**Key Characteristics:**
- **Decoupled Service Layer**: UI components never manipulate `localStorage` or `mockDb` directly; all actions flow through typed asynchronous service methods (`src/services/`).
- **Multi-Tenant Foundation**: Every schema and data operation explicitly associates records with `organizationId` (`org_nexus_01`).
- **Standardized Response Packaging**: Every service response conforms to `ApiResponse<T>` (`{ success, data, message, meta }`), ensuring seamless drop-in replacement with real HTTP endpoints.

## Layers

**Presentation Layer:**
- Purpose: Deliver interactive UI, Kanban boards, data tables, and analytics.
- Location: `src/pages/`, `src/components/`
- Contains: React components, Tailwind styling, Recharts diagrams, Lucide icons.
- Depends on: Context layer, Service layer.
- Used by: Browser DOM.

**Context & State Layer:**
- Purpose: Manage shared cross-cutting application state (Auth, Theme, Toast, Language).
- Location: `src/context/`
- Contains: React Context providers and custom hooks (`useAuth`, `useTheme`, `useToast`, `useLanguage`).
- Depends on: LocalStorage, Types.
- Used by: Presentation Layer.

**Service & API Layer:**
- Purpose: Abstract data mutations, business logic, simulated latency, and future HTTP transport.
- Location: `src/services/`
- Contains: Typed service objects (`leadsService`, `dealsService`, `companiesService`, `contactsService`, `tasksService`, `activitiesService`, `reportsService`, `settingsService`, `aiService`).
- Depends on: `src/mock/db.ts` (current), `src/types/index.ts`.
- Used by: Presentation Layer.

**Data Persistence Layer:**
- Purpose: Simulate relational CRUD and multi-tenant persistence.
- Location: `src/mock/db.ts`, `src/mock/*.ts`
- Contains: `MockDatabase` singleton with normalized mock datasets.
- Depends on: Browser `localStorage`.
- Used by: Service Layer.

## Data Flow

### Primary Request Path (Lead Conversion to Deal)

1. User clicks "Convert to Deal" in Lead detail drawer (`src/pages/Leads.tsx:432`)
2. Component invokes `leadsService.convertLead(leadId, ...)` (`src/services/leadsService.ts:112`)
3. Service passes call to `mockDb.convertLead(...)` (`src/mock/db.ts:310`)
4. `mockDb` creates Contact record, creates Deal record, updates Lead status to `Converted`, and syncs to `localStorage`
5. Service returns `ApiResponse<{ contact, deal }>` with simulated network delay (`src/services/api.ts:26`)
6. UI renders success Toast and refreshes pipeline view

### AI Copilot Query Flow

1. User submits natural language prompt in AI Assistant (`src/pages/AiAssistant.tsx:180`)
2. Component invokes `aiService.sendMessage(query)` (`src/services/aiService.ts:15`)
3. Service parses prompt intent (deals requiring attention, high priority leads, risk analysis)
4. Service synthesizes response text, deal/lead rich cards, and action chips
5. UI renders streaming-like chat bubbles and interactive entity cards

**State Management:**
- React Context for app-wide state (Auth, Theme, Language, Toasts)
- Component-level `useState` and `useEffect` for page-specific filters, pagination, and modals
- Single-source database truth managed via `mockDb` singleton and `localStorage`

## Key Abstractions

**ApiResponse:**
- Purpose: Standardized envelope for all service and API payloads
- Examples: `src/services/api.ts`
- Pattern: Envelope pattern `{ success: boolean, data: T, message?: string, meta?: { total, page, pageSize } }`

**Service Modules:**
- Purpose: Encapsulate entity business operations behind asynchronous interfaces
- Examples: `src/services/leadsService.ts`, `src/services/dealsService.ts`
- Pattern: Facade / Repository pattern

## Entry Points

**Web SPA Entry:**
- Location: `src/main.tsx`
- Triggers: Browser document load
- Responsibilities: Renders root `<App />` within React `StrictMode` into DOM node `#root`

**Application Router:**
- Location: `src/App.tsx`
- Triggers: URL route changes
- Responsibilities: Sets up Provider tree, mounts public vs protected routes

## Architectural Constraints

- **Threading:** Single-threaded JavaScript event loop in browser.
- **Global state:** In-memory singleton `mockDb` in `src/mock/db.ts`; mutable instance state serialized to `localStorage`.
- **Circular imports:** None observed; clean top-down dependency flow: components → contexts/services → mock/db → types.
- **Multi-Tenancy:** All queries and entity records must be strictly partitioned by `organizationId`.

## Anti-Patterns

### Direct Storage Access from Components
**What happens:** Reading or writing `localStorage` directly in UI pages.
**Why it's wrong:** Bypasses service encapsulation, breaks future backend migration, causes state synchronization bugs.
**Do this instead:** Call the appropriate method in `src/services/` and let the service/db layer manage persistence.

### Unscoped Entity Queries
**What happens:** Fetching records without checking `organizationId`.
**Why it's wrong:** Causes cross-tenant data leakage in multi-tenant SaaS environments.
**Do this instead:** Always pass or filter by `activeOrganizationId` in service and database operations.

## Error Handling

**Strategy:** Try-catch blocks in UI components wrapping service calls with error toast dispatching.

**Patterns:**
- Services catch internal errors and return `{ success: false, data: null, message: error.message }`
- UI components check `response.success` and call `toast.error(response.message)`

## Cross-Cutting Concerns

**Logging:** Console logging with descriptive context tags during dev.
**Validation:** Client-side form validation before submitting to service methods.
**Authentication:** Role-Based Access Control (`ProtectedRoute.tsx`, `AuthContext.tsx`) with 5 user roles and 23 permission keys.
**Internationalization:** Complete i18n support in `LanguageContext.tsx` with English, Spanish, French, German, and Hindi support.

---

*Architecture analysis: 2026-11-17*

