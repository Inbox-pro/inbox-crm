# NexusCRM

**Project Name:** NexusCRM (`inbox-crm`)  
**Type:** B2B Multi-Tenant SaaS CRM Platform  
**Analysis Date:** 2026-11-17  

---

## Overview

NexusCRM is a production-grade, multi-tenant B2B SaaS Customer Relationship Management (CRM) platform designed for enterprise demonstrations, white-label distribution, and deployment across diverse commercial industries. 

The frontend provides an executive command center featuring AI-assisted lead scoring, an interactive visual sales pipeline Kanban, contact and account management, scheduled operational tasks, touchpoint audit trails, executive business analytics, and a conversational AI Copilot powered by Google Gemini.

---

## Architectural Principles

1. **Decoupled Service-Oriented Architecture (SOA)**:
   - UI views and components never interact directly with databases or storage.
   - All operations flow through asynchronous, typed service modules (`src/services/`) returning standardized `ApiResponse<T>` envelopes (`{ success, data, message, meta }`).
2. **Multi-Tenant by Design**:
   - Every single record carries an `organizationId` partition key (`org_nexus_01`).
   - Cross-organization data leakage is structurally prohibited at both the context and service/query layers.
3. **Zero Secrets in Frontend**:
   - No private credentials or API keys exist in the client bundle.
   - Google Gemini API requests and database queries are designed to be proxied through a secure Node.js/Express backend.

---

## Current State

- **Frontend**: 100% complete, fully styled with Tailwind CSS 4, React 19, Lucide React, Recharts, and Motion.
- **Routing**: 12 routable views configured in React Router DOM (`/dashboard`, `/leads`, `/deals`, `/contacts`, `/companies`, `/tasks`, `/activities`, `/reports`, `/ai-assistant`, `/settings`, `/admin`, `/login`).
- **Data Layer**: In-memory `MockDatabase` engine with browser `localStorage` synchronization (`src/mock/db.ts`).
- **Backend Migration**: `package.json` contains `express` and `@google/genai`; production migration roadmap defined in `DOCUMENTATION.md` ready for execution.

---

## Key Tech Stack

- **Frontend Core**: React 19.0.1, TypeScript 5.8.2, Vite 6.2.3, React Router DOM 7.18.4
- **Styling & UI**: Tailwind CSS 4.1.14 (`@tailwindcss/vite`), Lucide React 0.546.0, Motion 12.23.24
- **Data Visualization**: Recharts 3.10.1
- **AI Integration**: Google GenAI SDK (`@google/genai` 2.4.0), Gemini 2.5 / Flash models
- **Target Backend**: Node.js, Express 4.21.2, MongoDB / Mongoose or PostgreSQL

