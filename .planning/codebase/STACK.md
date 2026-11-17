# Technology Stack

**Analysis Date:** 2026-11-17

## Languages

**Primary:**
- TypeScript 5.8.2 - Full application codebase across UI components, state management contexts, mock database layer, and service modules (`src/`)

**Secondary:**
- JavaScript (ES2022/Node.js) - Build configuration (`vite.config.ts`, `package.json`)
- HTML5 - Base SPA entry point (`index.html`)
- CSS3 (Tailwind CSS v4.1.14) - Component styling and responsive utility layout (`src/index.css`)

## Runtime

**Environment:**
- Node.js v26.12.1
- Browser target: Modern evergreen browsers supporting ES2022 (`vite.config.ts`, `tsconfig.json`)

**Package Manager:**
- npm 11.11.0
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.0.1 - Primary component framework (`package.json`)
- React DOM 19.0.1 - Web DOM rendering (`package.json`)
- React Router DOM 7.18.4 - Client-side SPA routing and layout nesting (`src/App.tsx`)

**UI & Motion:**
- Tailwind CSS 4.1.14 with `@tailwindcss/vite` 4.1.14 - Utility-first styling framework
- Lucide React 0.546.0 - Icon library (`src/components/`, `src/pages/`)
- Motion 12.23.24 (formerly Framer Motion) - Fluid animations, micro-interactions, modal transitions
- Recharts 3.10.1 - Analytical and executive data visualization charts (`src/pages/Dashboard.tsx`, `src/pages/Reports.tsx`)

**Testing:**
- None configured in current codebase (Testing framework setup needed)

**Build/Dev:**
- Vite 6.2.3 - High-performance dev server and bundler (`vite.config.ts`)
- `@vitejs/plugin-react` 5.0.4 - React Fast Refresh and JSX transformation
- tsx 4.21.0 - TypeScript execute utility for Node scripts
- esbuild 0.25.0 - Vite underpinning bundler
- Autoprefixer 10.4.21 - CSS vendor prefixing

## Key Dependencies

**Critical:**
- `@google/genai` 2.4.0 - Official Google GenAI SDK for Gemini model integration (`src/services/aiService.ts`, planned backend)
- `express` 4.21.2 - Node HTTP framework listed in dependencies for production migration
- `dotenv` 17.2.3 - Environment variable loader

**Infrastructure:**
- `lucide-react` 0.546.0 - UI icons
- `recharts` 3.10.1 - Business analytics charts

## Configuration

**Environment:**
- Managed via `.env` / `.env.local` (documented in `.env.example`)
- Key variables:
  - `GEMINI_API_KEY` - API key for Gemini models
  - `VITE_API_BASE_URL` - Base URL for REST service proxying (defaults to `/api`)

**Build:**
- `vite.config.ts` - Vite bundler, `@tailwindcss/vite` integration, `@` path alias
- `tsconfig.json` - Target ES2022, bundler module resolution, `@/*` path mapping
- `vercel.json` - Deployment configuration with SPA rewrite rules (`/*` -> `/index.html`)

## Platform Requirements

**Development:**
- Node.js 18+ (tested on Node.js 26.12.1)
- npm or pnpm package manager

**Production:**
- Static client hosting (Vercel, Netlify, Cloudflare Pages, Firebase Hosting)
- Optional Node.js/Express server or serverless functions for secure Gemini proxy and database queries

---

*Stack analysis: 2026-11-17*

