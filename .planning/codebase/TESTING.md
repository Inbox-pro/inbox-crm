# Testing Patterns

**Analysis Date:** 2026-11-17

## Test Framework

**Runner:**
- Currently not installed in repository.
- Recommended configuration: Vitest with React Testing Library (`@testing-library/react`).

**Assertion Library:**
- Recommended: Vitest built-in assertions / Chai compatible (`expect`).

**Run Commands:**
```bash
# Recommended test scripts to be added to package.json:
npm run test           # Run all unit/component tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

## Test File Organization

**Location:**
- Recommended pattern: Co-located test files adjacent to the source code (e.g., `src/services/__tests__/leadsService.test.ts`, `src/components/common/__tests__/KpiCard.test.tsx`) or top-level `tests/` directory for integration/E2E tests.

**Naming:**
- Unit and service tests: `*.test.ts`
- Component tests: `*.test.tsx`
- E2E tests: `*.spec.ts`

**Structure:**
```
src/
├── services/
│   ├── leadsService.ts
│   └── __tests__/
│       └── leadsService.test.ts
├── components/
│   └── common/
│       ├── KpiCard.tsx
│       └── __tests__/
│           └── KpiCard.test.tsx
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { leadsService } from '../leadsService';

describe('leadsService', () => {
  beforeEach(() => {
    // Reset database state before each test run
  });

  describe('getLeads', () => {
    it('returns filtered leads belonging to the active organization', async () => {
      const response = await leadsService.getLeads({ status: 'New' });
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('convertLead', () => {
    it('creates associated contact and deal upon successful conversion', async () => {
      // Verification logic
    });
  });
});
```

**Patterns:**
- `beforeEach`: Reset in-memory database or seed state
- Triple-A pattern: Arrange, Act, Assert

## Mocking

**Framework:**
- Vitest `vi.mock` / `vi.fn`

**Patterns:**
```typescript
import { vi } from 'vitest';

// Mocking external Gemini API
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({ text: 'Simulated AI reply' }),
    },
  })),
}));
```

**What to Mock:**
- Network transport (`fetch`, Axios)
- Google Gemini API calls (`@google/genai`)
- Browser APIs (`localStorage`, `ResizeObserver`, `IntersectionObserver`)

**What NOT to Mock:**
- Pure helper utilities (`dateFilter.ts`)
- TypeScript domain model types
- Internal business logic validations

## Fixtures and Factories

**Test Data:**
- Pre-existing rich fixtures exist in `src/mock/`:
  - `MOCK_LEADS` (`src/mock/leads.ts`)
  - `MOCK_DEALS` (`src/mock/deals.ts`)
  - `MOCK_CONTACTS` (`src/mock/contacts.ts`)
  - `MOCK_COMPANIES` (`src/mock/companies.ts`)
  - `MOCK_USERS` (`src/mock/users.ts`)

**Location:**
- Fixtures and seeds reside in `src/mock/`

## Coverage

**Requirements:**
- Baseline target for production readiness:
  - Critical service operations (`src/services/`): >80% coverage
  - Security and RBAC guards (`ProtectedRoute.tsx`, `AuthContext.tsx`): >90% coverage
  - Common UI primitives (`src/components/common/`): >70% coverage

## Test Types

**Unit Tests:**
- Validate individual service methods, utilities, and date filter calculations in isolation.

**Component Tests:**
- Validate React component rendering, user clicks, form validations, and modal toggles with React Testing Library.

**Integration Tests:**
- Validate full user workflows (e.g. Lead -> Convert -> Verify in Deals pipeline and Contacts table).

**E2E Tests:**
- (Recommended: Playwright for end-to-end multi-tenant browser verification).

---

*Testing analysis: 2026-11-17*

