# Requirements: NexusCRM

**Analysis Date:** 2026-11-17

## Core Architecture & Multi-Tenancy

- **CORE-01**: Application enforces strict tenant isolation using `organizationId` on all domain models and service queries.
- **CORE-02**: Standardized `ApiResponse<T>` envelope format `{ success, data, message, meta }` maintained across all service endpoints.
- **CORE-03**: Multilingual internationalization (English, Spanish, French, German, Hindi) active across all UI components via `LanguageContext`.
- **CORE-04**: Theme switching (Dark/Light mode) persisted across user sessions.

## Lead Management & Conversion

- **LEAD-01**: Users can view, search, filter, and paginate through inbound leads by status and acquisition source.
- **LEAD-02**: Leads display AI-assisted intent badges (High, Medium, Low) and explanatory conversion score factors.
- **LEAD-03**: Users can execute a 1-click lead conversion workflow to instantly transform a qualified lead into a Contact and Deal.
- **LEAD-04**: Users can create, update, and delete leads with real-time feedback.

## Deals & Sales Pipeline

- **DEAL-01**: Users can view deals in an interactive visual Kanban board structured by sales stages (New, Qualified, Proposal, Negotiation, Won, Lost).
- **DEAL-02**: Users can toggle between Kanban board and dense list views with sorting and search.
- **DEAL-03**: Deals update weighted revenue forecasts based on stage probabilities in real-time.
- **DEAL-04**: Users can create, update stage, edit deal amounts, and attach contacts/companies to deals.

## Contacts & Companies

- **CONT-01**: Users can search, filter, and inspect stakeholder directory contacts with account linkage.
- **CONT-02**: Users can manage corporate accounts/companies with employee tiering and revenue estimates.
- **CONT-03**: Users can trigger direct email composition and log call touchpoints from contact views.

## Tasks & Activity Timeline

- **TASK-01**: Users can schedule and manage operational tasks with priorities (`Urgent`, `High`, `Medium`, `Low`) and statuses (`Pending`, `In Progress`, `Completed`, `Overdue`).
- **TASK-02**: Tasks support entity relationship binding to specific Leads, Deals, Contacts, or Companies.
- **TASK-03**: Users can view a chronological stream of touchpoints and interactions in the Activities audit timeline.

## Analytics & Executive Reporting

- **REPO-01**: Executive dashboard displays real-time KPI ribbon (Pipeline Value, Won Revenue, Active Leads, Win Rate).
- **REPO-02**: Reports view provides revenue vs quota attainment charts and lead attribution channel breakdowns.
- **REPO-03**: Users can export executive reporting summaries to CSV.

## NexusAI Copilot (Gemini API)

- **AI-01**: Conversational Copilot assistant responds to user sales inquiries with formatted Markdown, deal cards, and action suggestions.
- **AI-02**: Pre-built executive suggestion chips generate instant lead summaries, negotiation risk analyses, and follow-up drafts.
- **AI-03**: Server-side Gemini proxy connects to official Google GenAI SDK (`@google/genai`) protecting API keys from client exposure.

## Backend & Persistence Migration

- **BACK-01**: Express API server initialized with REST endpoints for `/api/leads`, `/api/deals`, `/api/contacts`, `/api/companies`, `/api/tasks`, `/api/activities`, and `/api/ai/chat`.
- **BACK-02**: Database schema persistence (MongoDB/PostgreSQL) replacing in-memory/localStorage mock store.
- **BACK-03**: Secure JWT/session authentication replacing client-side mock user validation.

## Automated Testing & Quality

- **TEST-01**: Automated unit tests for all service modules (`src/services/`).
- **TEST-02**: Component tests for key UI flows (Lead conversion, Deal stage progression, Role guards).

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 1 | Pending |
| TEST-02 | Phase 1 | Pending |
| BACK-01 | Phase 2 | Pending |
| BACK-02 | Phase 2 | Pending |
| CORE-01 | Phase 2 | Pending |
| CORE-02 | Phase 2 | Pending |
| AI-01 | Phase 3 | Pending |
| AI-02 | Phase 3 | Pending |
| AI-03 | Phase 3 | Pending |
| BACK-03 | Phase 4 | Pending |
| LEAD-01 | Phase 5 | Pending |
| LEAD-02 | Phase 5 | Pending |
| LEAD-03 | Phase 5 | Pending |
| LEAD-04 | Phase 5 | Pending |
| DEAL-01 | Phase 5 | Pending |
| DEAL-02 | Phase 5 | Pending |
| DEAL-03 | Phase 5 | Pending |
| DEAL-04 | Phase 5 | Pending |
| CONT-01 | Phase 5 | Pending |
| CONT-02 | Phase 5 | Pending |
| CONT-03 | Phase 5 | Pending |
| TASK-01 | Phase 5 | Pending |
| TASK-02 | Phase 5 | Pending |
| TASK-03 | Phase 5 | Pending |
| REPO-01 | Phase 5 | Pending |
| REPO-02 | Phase 5 | Pending |
| REPO-03 | Phase 5 | Pending |
| CORE-03 | Phase 5 | Pending |
| CORE-04 | Phase 5 | Pending |

