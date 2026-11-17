# Codebase Concerns

**Analysis Date:** 2026-11-17

## Tech Debt

**Client-Side In-Memory / LocalStorage Mock DB:**
- Issue: Entire CRM relational data persistence is currently simulated using an in-memory class (`src/mock/db.ts`) synced to browser `localStorage` (`nexus_crm_store`).
- Files: `src/mock/db.ts`, `src/services/api.ts`
- Impact: Hard 5MB browser storage quota limit, no real concurrency between multi-user team members, data lost if browser storage cleared.
- Fix approach: Implement Node.js/Express REST API with MongoDB/Mongoose backing as outlined in `DOCUMENTATION.md` Section 4.

**Monolithic Translation Dictionary in LanguageContext:**
- Issue: `src/context/LanguageContext.tsx` is 1,342 lines containing hardcoded JSON dictionaries for English, Spanish, French, German, and Hindi.
- Files: `src/context/LanguageContext.tsx`
- Impact: Increases bundle size, makes localization difficult to maintain or asynchronously load per locale.
- Fix approach: Split language dictionaries into separate JSON assets in `public/locales/` or dedicated modules loaded dynamically.

**Large Page Components:**
- Issue: `src/pages/Leads.tsx` (805 lines), `src/pages/Deals.tsx` (589 lines), `src/pages/AdminPanel.tsx` (552 lines) contain substantial inline modal state, filter logic, and table rendering.
- Files: `src/pages/Leads.tsx`, `src/pages/Deals.tsx`, `src/pages/AdminPanel.tsx`
- Impact: High cognitive load, harder to unit test individual form states and interactions.
- Fix approach: Extract lead conversion modal, deal card drag-and-drop column, and role permission tables into isolated sub-components.

## Known Bugs

**Unix Command in Package Scripts on Windows:**
- Symptoms: Running `npm run clean` fails on Windows native environments because `rm -rf` is a Unix command.
- Files: `package.json:10`
- Trigger: Executing `npm run clean` on Windows.
- Workaround: Use rimraf or a cross-platform cleanup script (`node -e "fs.rmSync('dist', { recursive: true, force: true })"`).

## Security Considerations

**Hardcoded Mock Passwords in Frontend Bundle:**
- Risk: `src/mock/users.ts` contains plaintext user passwords (`password123`). If the frontend is built and served publicly, client-side credentials and internal tenant schemas are completely visible.
- Files: `src/mock/users.ts`, `src/services/authService.ts`
- Current mitigation: Used for local demo and testing only.
- Recommendations: Implement proper backend JWT/session authentication with bcrypt password hashing; strip mock user credentials before production release.

**Exposure of Gemini API Key if Used in Client:**
- Risk: `GEMINI_API_KEY` listed in `.env.example`. If accessed via `import.meta.env` in client code, the key would be exposed to browser users.
- Files: `.env.example`, `src/services/aiService.ts`
- Current mitigation: `aiService.ts` currently uses mock responses and explicitly warns to keep the key on the server.
- Recommendations: Route all Google GenAI SDK calls exclusively through a secure backend proxy (`/api/ai/chat`).

## Performance Bottlenecks

**Full Data Serialization on Every Mutation:**
- Problem: `mockDb.saveToStorage()` serializes all users, leads, deals, contacts, companies, tasks, and activities to `localStorage` on every single create/update operation.
- Files: `src/mock/db.ts:60-75`
- Cause: Synchronous JSON serialization of all collections simultaneously.
- Improvement path: Migrate to asynchronous indexedDB or real backend database with indexed queries.

## Fragile Areas

**Date Normalization Logic in MockDatabase:**
- Files: `src/mock/db.ts:29-58`
- Why fragile: Dynamically recalibrates timestamps relative to `Date.now()` on construction. If client clock is out of sync or version key changes, timestamps may shift unexpectedly between sessions.
- Safe modification: When moving to a persistent backend database, remove synthetic date recalibration and rely on immutable ISO timestamps (`createdAt`, `updatedAt`).
- Test coverage: 0% automated tests.

## Scaling Limits

**LocalStorage Capacity:**
- Current capacity: ~5 MB maximum storage limit in browser.
- Limit: Approximately 1,000–2,000 dense CRM records before `QuotaExceededError` is triggered.
- Scaling path: Transition to MongoDB / PostgreSQL backend.

## Dependencies at Risk

**Tailwind CSS v4 with Vite Integration:**
- Risk: Tailwind CSS v4 is a major architectural shift with new `@tailwindcss/vite` plugin syntax; ensure compatibility when adding legacy Tailwind plugins or custom configurations.
- Impact: Potential CSS build issues if outdated plugins are added.
- Migration plan: Keep `@tailwindcss/vite` updated to stable releases.

## Missing Critical Features

**Production Express Server Implementation:**
- Problem: `express` is present in `package.json` dependencies, but no `server.js` or `server/` routes exist yet to serve the API or proxy Gemini.
- Blocks: Live multi-user team testing, real Gemini AI completions, secure secret handling.

**Automated Test Suite:**
- Problem: No test runner (Vitest/Jest) or test files exist in the repository.
- Blocks: Automated regression testing and continuous integration.

## Test Coverage Gaps

**Untested Critical Paths:**
- What's not tested:
  - Lead conversion workflow (`leadsService.convertLead`)
  - Role-Based Access Control and route protection (`ProtectedRoute.tsx`)
  - Kanban deal stage progression and probability calculations (`dealsService.ts`)
  - Multi-tenant data segregation (`organizationId` validation)
- Files: `src/services/*.ts`, `src/components/auth/ProtectedRoute.tsx`, `src/pages/*.tsx`
- Risk: Unnoticed regressions during refactoring or backend migration.

---

*Concerns analysis: 2026-11-17*

