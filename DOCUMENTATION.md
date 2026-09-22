# NexusCRM — Platform Architecture & Functional Documentation

NexusCRM is a production-grade, multi-tenant B2B SaaS CRM built for demonstrating to prospective enterprise clients, easily white-labeling, and deploying across various industries without altering the core codebase.

---

## 1. High-Level Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NexusCRM Frontend UI                          │
│     React 19 • Vite • Tailwind CSS • Lucide Icons • Recharts • Motion    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                        (TypeScript Service Layer)
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────┐                           ┌──────────────────────┐
│  Current Stage:      │                           │  Production Target:  │
│  Reactive Mock Store │                           │  Node.js + Express   │
│  (src/mock/db.ts)    │                           │  MongoDB + Mongoose  │
│  + LocalStorage Sync │                           │  Google Gemini 2.5   │
└──────────────────────┘                           └──────────────────────┘
```

### Key Architectural Principles
1. **Decoupled Service-Oriented Architecture (SOA)**:
   - UI pages and components **never** directly access databases, local storage, or external APIs.
   - All data operations pass through typed asynchronous service modules in `/src/services/` (`leadsService`, `dealsService`, `tasksService`, etc.).
   - Standardized `ApiResponse<T>` wrappers provide `{ success, data, message, meta }`, mirroring enterprise REST conventions.
2. **Multi-Tenant by Design**:
   - Every single record carries an `organizationId` foreign key.
   - Tenancy switching is supported at the context and database layers, ensuring complete multi-organization data isolation.
3. **Zero Secrets in Frontend**:
   - The application does not expose API keys or credentials.
   - When migrating to production, switching `VITE_API_BASE_URL` routes all requests to a Node.js/Express backend proxying Google Gemini and database queries securely.

---

## 2. Complete Page-by-Page Functionality Guide

### 1. Executive Dashboard (`/dashboard`)
*The central command center providing executive visibility into revenue, pipeline velocity, and team momentum.*

* **Executive KPI Ribbon**:
  * **Total Pipeline Value**: Weighted active opportunity value formatted in Lakhs (e.g., `₹42.8L`).
  * **Won Revenue**: Booked revenue closed during the current fiscal window (e.g., `₹18.4L`).
  * **Active Leads**: Total inbound and outbound leads currently undergoing qualification (`1,248`).
  * **Win Conversion Rate**: Historical pipeline conversion benchmark (`23.6%`).
* **Visual Analytical Charts**:
  * **Bookings vs. Target (Recharts Bar & Line)**: Visual comparison of actual won revenue against quota targets and open pipeline per month.
  * **Pipeline Distribution**: Breakdown of deal count and value by stage (New, Qualified, Proposal, Negotiation, Won, Lost).
* **Live Action Feeds**:
  * **Urgent Deal Alerts**: Highlights deals stalled in negotiation or approaching expected close dates.
  * **Recent Touchpoint Stream**: Real-time log of customer emails, calls, demos, and internal notes.
* **Header Quick-Actions**: Fast buttons to record a new deal, lead, or task from anywhere.

---

### 2. Leads Management (`/leads`)
*Inbound lead qualification system powered by AI scoring heuristics.*

* **Predictive AI Lead Scoring (0–100)**:
  * Every lead is analyzed based on decision-maker seniority, company size, engagement frequency, and acquisition source.
  * Intent badges: **High Intent** (Green, 80–100), **Medium Intent** (Yellow, 50–79), **Low Intent** (Slate, <50).
  * Expandable insight modal detailing specific positive and negative conversion factors.
* **Filtering & Search**:
  * Real-time search across prospect name, company, email, and phone.
  * Filter pills by status (`New`, `Contacted`, `Qualified`, `Unqualified`, `Converted`) and acquisition source (`Website`, `Referral`, `LinkedIn`, `Cold Call`, etc.).
* **1-Click Lead Conversion Workflow**:
  * Directly transforms a qualified lead into a permanent **Contact** and an active **Sales Opportunity (Deal)** with automatic data inheritance and audit trail logging.
* **Create & Edit Leads**: Modal capturing name, company, email, phone, source, estimated deal size, and custom notes.

---

### 3. Contacts Directory (`/contacts`)
*Relational database of individuals, decision-makers, and key stakeholders.*

* **Searchable Stakeholder Directory**:
  * Search by contact name, job title, company, or email address.
  * Quick status chips: `Active`, `Prospect`, `Inactive`.
* **Account Linkage**:
  * Each contact references their parent account/company (`companyId`, `companyName`).
* **Contact Detail View**:
  * Drawer displaying direct phone numbers, email addresses, LinkedIn profile links, and associated activity touchpoints.
* **Direct Communication Hooks**:
  * One-click action icons to trigger email composition or log call records directly against the contact.

---

### 4. Companies & Accounts (`/companies`)
*B2B account management for enterprise clients, partners, and corporate prospects.*

* **Account Portfolio Overview**:
  * Tracks enterprise accounts, employee headcount tiers, annual revenue estimates, and geographic headquarters.
  * Relationship status tags: `Customer`, `Prospect`, `Partner`, `Churned`.
* **Account Intelligence & Details**:
  * Drawer displaying website URLs, corporate phone numbers, primary industry sector, and assigned Account Executive.
  * Lists all related opportunities and open deals associated with the company.
* **Add Company**: Modal to onboard new corporate entities with automated organization ID binding.

---

### 5. Deals & Sales Pipeline (`/deals`)
*Interactive opportunity management supporting both Visual Kanban and List views.*

* **Visual Kanban Board**:
  * Columns representing the standard sales stages:
    1. **New** (10% probability)
    2. **Qualified** (30% probability)
    3. **Proposal** (60% probability)
    4. **Negotiation** (75% probability)
    5. **Won** (100% probability)
    6. **Lost** (0% probability)
  * Drag-and-drop or one-click stage progression directly updating deal value totals per column in real-time.
* **List View Mode**:
  * Dense, tabular view for rapid executive review and bulk inspection.
* **Pipeline Metrics**:
  * Total pipeline volume, expected weighted value calculation, and closing date countdown.
* **New Deal Creation**:
  * Modal linking deal to parent company, primary contact, expected close date, deal amount, and initial probability.

---

### 6. Tasks & Scheduling (`/tasks`)
*Operational workflow manager ensuring team accountability and milestone completion.*

* **Priority & Status Tracking**:
  * Priorities: `Urgent` (Rose), `High` (Orange), `Medium` (Blue), `Low` (Slate).
  * Statuses: `Pending`, `In Progress`, `Completed`, `Overdue`.
* **Entity Relationship Binding**:
  * Tasks can be linked to a specific Lead, Deal, Contact, or Company.
* **Interactive Completion**:
  * Checkbox toggle with instant state persistence and toast feedback.
* **Filter Bar**:
  * Filter by priority, completion status, or search task descriptions.

---

### 7. Activities & Audit Timeline (`/activities`)
*Chronological stream of all interactions and touchpoints.*

* **Activity Types**:
  * `Meeting`, `Call`, `Email`, `Demo`, `Note`, `Follow-up`.
* **Detailed Audit Stream**:
  * Records performer name, target prospect/account, exact timestamp, and meeting notes/minutes.
* **Type Filtering**:
  * Instant tab filters to isolate client phone calls, product demos, or executive notes.
* **Log Touchpoint**:
  * Form to record call outcomes, follow-up deadlines, and meeting recaps.

---

### 8. Reports & BI Analytics (`/reports`)
*Executive reporting suite for data-driven sales leadership.*

* **Revenue vs. Quota Attainment**:
  * Comparative visualization of booked revenue against executive targets.
* **Attribution Donut Chart**:
  * Channel breakdown analyzing lead origination (LinkedIn vs. Website vs. Referrals).
* **Representative Quota Leaderboard**:
  * Performance ranking of sales executives tracking deals won, closed revenue, win ratios, and attainment progress bars.
* **Data Export**:
  * One-click **Export Report (CSV)** to download executive summaries for spreadsheet reporting.

---

### 9. NexusAI Copilot (`/ai`)
*Conversational sales assistant ready for Google Gemini API integration.*

* **Executive Suggestion Chips**:
  * *"Summarize Hot Leads"* — Identifies top scored prospects with recommended next steps.
  * *"Negotiation Risk Analysis"* — Audits late-stage deals for blockers and close probability.
  * *"Draft Executive Follow-Up"* — Generates hyper-personalized outreach emails to enterprise decision-makers.
  * *"Pipeline Health Audit"* — Provides an executive summary of current revenue risks and trends.
* **Actionable Output**:
  * One-click **Copy Output** button for swift paste into Gmail or email clients.
  * Auto-scrolling chat history with realistic typing states and tenant isolation.

---

### 10. System Administration & Settings (`/settings`)
*Tenant configuration, user governance, and data controls.*

* **Organization Profile**:
  * Edit company name, base currency (`INR ₹`, `USD $`, `EUR €`), timezone, and fiscal calendar.
* **Team & RBAC (Role-Based Access Control)**:
  * Manages team members across five defined roles:
    * **Super Admin**: Unrestricted global configuration and data deletion rights.
    * **Admin**: User management, custom schemas, and pipeline editing.
    * **Manager**: Team pipeline oversight, reassignments, and report access.
    * **Sales**: Individual pipeline CRUD, lead qualification, and task tracking.
    * **Viewer**: Read-only oversight for auditors and stakeholders.
* **Custom CRM Fields**:
  * Configures user-defined schema fields attached to Leads, Deals, or Accounts.
* **Lead Scoring Rules**:
  * Adjusts point weightings for seniority, company size, and inbound behavior.
* **Backend Readiness & Demo Reset**:
  * **Export Full Database (JSON)**: Full database dump for backups and migrations.
  * **Reset to Factory State**: One-click cleanup to restore pristine demo data prior to client meetings.

---

## 3. Data Schema Reference

| Entity | Primary Attributes | Multi-Tenant Key |
| :--- | :--- | :--- |
| **Lead** | `name`, `companyName`, `email`, `phone`, `source`, `status`, `leadScore`, `aiInsight`, `estimatedValue` | `organizationId` |
| **Contact** | `name`, `companyId`, `companyName`, `email`, `phone`, `jobTitle`, `status` | `organizationId` |
| **Company** | `name`, `industry`, `website`, `phone`, `location`, `employees`, `annualRevenue`, `status` | `organizationId` |
| **Deal** | `name`, `companyId`, `companyName`, `contactId`, `value`, `stage`, `probability`, `expectedCloseDate` | `organizationId` |
| **Task** | `title`, `description`, `dueDate`, `priority`, `status`, `assignedToName`, `relatedEntityId` | `organizationId` |
| **Activity** | `type`, `title`, `description`, `performedByName`, `occurredAt`, `relatedEntityId` | `organizationId` |
| **User** | `name`, `email`, `role`, `department`, `status` | `organizationId` |
| **Organization** | `name`, `industry`, `currency`, `timezone`, `plan` | `id` |

---

## 4. Production Migration Roadmap

To transition this frontend from mock storage to a production Node.js/Express backend:

1. **Backend Initialization**:
   - Initialize Express API with routes matching the service layer:
     - `/api/leads`, `/api/contacts`, `/api/companies`, `/api/deals`, `/api/tasks`, `/api/activities`, `/api/ai/chat`.
2. **Database Integration**:
   - Define Mongoose schemas mirroring the TypeScript definitions in `/src/types/index.ts`.
   - Enforce `{ organizationId: req.user.organizationId }` on every query for secure tenant isolation.
3. **Gemini AI Integration**:
   - In `server/routes/ai.ts`, initialize the official `@google/genai` SDK using `process.env.GEMINI_API_KEY`.
   - Provide CRM context as structured system instructions to enable real-time deal analysis and email synthesis.
4. **Environment Setup**:
   - Set `VITE_API_BASE_URL=https://api.yourdomain.com` in `.env`.
   - The frontend service client will automatically route all queries to the live endpoints without modifying any UI component.
