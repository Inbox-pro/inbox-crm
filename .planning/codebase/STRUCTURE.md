# Codebase Structure

**Analysis Date:** 2026-11-17

## Directory Layout

```
inbox-crm/
├── public/                 # Static public assets (favicons, public images)
├── src/                    # Primary application source code
│   ├── components/         # Reusable React UI components
│   │   ├── auth/           # Authentication guards and login widgets
│   │   ├── common/         # Generic UI primitives (Modal, Drawer, Avatar, KpiCard, etc.)
│   │   └── layout/         # Application shell (AppLayout, Sidebar, TopNav)
│   ├── context/            # React Context providers (Auth, Theme, Toast, Language)
│   ├── mock/               # Mock data collections and reactive in-memory database
│   ├── pages/              # Top-level routable application views (Dashboard, Leads, etc.)
│   ├── services/           # Service facade abstraction layer wrapping data operations
│   ├── types/              # Centralized TypeScript interface and enum declarations
│   ├── utils/              # Helper utilities (date filter, formatters)
│   ├── App.tsx             # Root application component with routing definitions
│   ├── main.tsx            # DOM mounting entry point
│   └── index.css           # Global stylesheet with Tailwind CSS directives
├── .env.example            # Sample environment variables specification
├── .gitignore              # Git ignored files and directories
├── DOCUMENTATION.md        # Complete functional and architectural documentation
├── index.html              # HTML5 template entry point
├── package.json            # Node.js dependencies and script definitions
├── tsconfig.json           # TypeScript compiler configuration
├── vercel.json             # Vercel deployment and routing rules
└── vite.config.ts          # Vite build and dev server configuration
```

## Directory Purposes

**`src/components/`:**
- Purpose: Reusable, presentational and container React components
- Contains: Modals, drawers, KPI metric cards, status badges, layout headers, sidebars
- Key files: `src/components/layout/AppLayout.tsx`, `src/components/common/Modal.tsx`, `src/components/common/Drawer.tsx`

**`src/context/`:**
- Purpose: App-wide reactive state management and provider scopes
- Contains: Auth session, theme toggles, toast notifications, internationalization dictionary
- Key files: `src/context/AuthContext.tsx`, `src/context/ThemeContext.tsx`, `src/context/LanguageContext.tsx`

**`src/mock/`:**
- Purpose: Simulated database and fixtures for offline development and demos
- Contains: Mock seed data for leads, deals, contacts, companies, tasks, activities, and the `MockDatabase` engine
- Key files: `src/mock/db.ts`, `src/mock/leads.ts`, `src/mock/deals.ts`

**`src/pages/`:**
- Purpose: Full-screen routable page views corresponding to CRM navigation tabs
- Contains: Dashboard, Leads, Contacts, Companies, Deals, Tasks, Activities, Reports, AI Assistant, Settings, Admin Panel, Login
- Key files: `src/pages/Dashboard.tsx`, `src/pages/Leads.tsx`, `src/pages/Deals.tsx`, `src/pages/AiAssistant.tsx`

**`src/services/`:**
- Purpose: Decoupled service repository layer wrapping all data CRUD and external communication
- Contains: Typed async functions returning standardized `ApiResponse<T>` promises
- Key files: `src/services/api.ts`, `src/services/leadsService.ts`, `src/services/dealsService.ts`, `src/services/aiService.ts`

**`src/types/`:**
- Purpose: Authoritative domain model types, interfaces, and permissions
- Contains: Entities (`Lead`, `Deal`, `Contact`, `Company`, `Task`, `Activity`, `User`, `Organization`)
- Key files: `src/types/index.ts`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React DOM root mounting
- `src/App.tsx`: App shell, Context hierarchy, React Router configuration

**Configuration:**
- `vite.config.ts`: Vite bundling, `@tailwindcss/vite` plugin, alias setup
- `tsconfig.json`: TypeScript configuration
- `vercel.json`: Cloud deployment and routing rewrites

**Core Logic:**
- `src/services/`: All entity service actions
- `src/mock/db.ts`: In-memory multi-tenant database engine with localStorage persistence

**Testing:**
- (TBD: test directory to be established under `tests/` or co-located `*.test.tsx`)

## Naming Conventions

**Files:**
- React components and pages: PascalCase (`AppLayout.tsx`, `Leads.tsx`, `KpiCard.tsx`)
- Services and utilities: camelCase (`leadsService.ts`, `dateFilter.ts`, `api.ts`)
- Types and mock files: camelCase (`index.ts`, `db.ts`, `leads.ts`)

**Directories:**
- Feature and functional groupings: lowercase kebab-case or flat lowercase (`components`, `context`, `mock`, `pages`, `services`, `types`, `utils`)

## Where to Add New Code

**New Feature / Page:**
- View implementation: `src/pages/[FeatureName].tsx`
- Service operations: `src/services/[feature]Service.ts`
- Domain types: `src/types/index.ts`
- Navigation link: `src/components/layout/Sidebar.tsx`
- Route declaration: `src/App.tsx`

**New Reusable Component:**
- Implementation: `src/components/common/[ComponentName].tsx`

**New Entity / Data Model:**
- Type definition: `src/types/index.ts`
- Mock dataset: `src/mock/[entity].ts`
- Database store registration: `src/mock/db.ts`
- Service facade: `src/services/[entity]Service.ts`

**Utilities / Helpers:**
- Shared helper functions: `src/utils/[helperName].ts`

## Special Directories

**`.planning/`:**
- Purpose: GSD workflow planning artifacts, codebase maps, and project roadmaps
- Generated: Yes
- Committed: Yes

**`node_modules/`:**
- Purpose: External package dependencies
- Generated: Yes
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-11-17*

