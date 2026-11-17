# Coding Conventions

**Analysis Date:** 2026-11-17

## Naming Patterns

**Files:**
- React components and views: PascalCase (e.g., `src/pages/Dashboard.tsx`, `src/components/common/KpiCard.tsx`)
- Services and utilities: camelCase (e.g., `src/services/leadsService.ts`, `src/utils/dateFilter.ts`)
- Type declarations: `src/types/index.ts`
- Mock collections: camelCase plural (e.g., `src/mock/leads.ts`, `src/mock/deals.ts`)

**Functions:**
- camelCase for standard functions, service methods, and hooks (e.g., `convertLead`, `useAuth`, `simulateNetworkLatency`)
- PascalCase for React Function Components (e.g., `AppLayout`, `KpiCard`, `Leads`)

**Variables:**
- camelCase for local variables, parameters, and component state (e.g., `selectedLead`, `activeTab`, `searchQuery`)
- UPPER_SNAKE_CASE for constant arrays and seed datasets (e.g., `MOCK_LEADS`, `MOCK_USERS`, `MOCK_DEALS`)

**Types:**
- PascalCase for interfaces and type aliases (e.g., `Lead`, `Deal`, `ApiResponse<T>`, `UserRole`, `AiChatMessage`)
- Descriptive, explicit names avoiding single-letter prefixes (e.g., `Lead` instead of `ILead`)

## Code Style

**Formatting:**
- Indentation: 2 spaces
- Quotes: Single quotes for JavaScript/TypeScript imports and string literals
- Semicolons: Always used
- Trailing commas: Used in multiline objects and arrays

**Linting:**
- TypeScript strict checking via `tsc --noEmit` (`npm run lint`)
- No unused variables, explicit type annotations preferred on exported methods and API models

## Import Organization

**Order:**
1. External core libraries (e.g., `react`, `react-router-dom`)
2. Third-party UI and utility packages (e.g., `lucide-react`, `motion/react`, `recharts`)
3. Internal contexts and hooks (e.g., `../context/AuthContext`, `../context/ToastContext`)
4. Internal components (e.g., `../components/common/Modal`, `../components/layout/AppLayout`)
5. Services, mock layer, and utilities (e.g., `../services/leadsService`, `../utils/dateFilter`)
6. Type imports (e.g., `import { Lead, ApiResponse } from '../types'`)

**Path Aliases:**
- Configured `@/*` alias mapping to `./*` in `vite.config.ts` and `tsconfig.json`
- Relative imports (`../`, `./`) widely used across current `src/` modules

## Error Handling

**Patterns:**
- Asynchronous service calls wrapped in `try/catch` within React UI component handlers:
```typescript
try {
  setIsSubmitting(true);
  const response = await leadsService.convertLead(leadId, data);
  if (response.success) {
    showToast('Lead converted successfully', 'success');
    onClose();
  } else {
    showToast(response.message || 'Failed to convert lead', 'error');
  }
} catch (err: any) {
  showToast(err.message || 'An unexpected error occurred', 'error');
} finally {
  setIsSubmitting(false);
}
```
- Services return `{ success: false, data: null, message: err.message }` rather than letting uncaught exceptions crash the UI

## Logging

**Framework:**
- Built-in `console.log` and `console.error` for runtime logging during local development
- User-facing notifications routed through `ToastContext` (`showToast(message, type)`)

## Comments

**When to Comment:**
- Method headers for exported service functions explaining production backend transition requirements
- Multi-line JSDoc comments explaining architectural design choices (e.g., `src/services/api.ts`, `src/services/aiService.ts`)

**JSDoc/TSDoc:**
- Used on key service functions to indicate backend migration paths:
```typescript
/**
 * In production with Express + MongoDB:
 * Replace mockDb calls with standard fetch or axios requests.
 */
```

## Function Design

**Size:**
- Single responsibility functions; complex page components delegate UI chunks to dedicated sub-components (`KpiCard`, `StatusBadge`, `Modal`)

**Parameters:**
- Destructured props for React components with explicit TypeScript interfaces
- Strongly typed parameters for service methods (e.g., `leadsService.createLead(lead: Omit<Lead, 'id' | 'createdAt'>)`)

**Return Values:**
- Service methods always return `Promise<ApiResponse<T>>`
- React components return `React.ReactElement` or `JSX.Element | null`

## Module Design

**Exports:**
- Named exports preferred for UI components, services, and contexts (e.g., `export const leadsService = { ... }`, `export function Leads() { ... }`)
- Default export used for the root `App` component (`export default function App()`)

**Barrel Files:**
- Centralized `src/types/index.ts` acts as the primary type barrel for all entity definitions

---

*Convention analysis: 2026-11-17*

