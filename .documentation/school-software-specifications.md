# Software Requirements Specification – Multi-Tenant School Management SaaS

## System Design
- Multi-tenant micro-SaaS with **subdomain isolation** (e.g., `school1.app.com`).
- **Edge middleware** resolves tenant from host, loads tenant config, and injects `X-Tenant-Id` into all server requests.
- **BFF on Next.js Route Handlers** exposes tenant-scoped REST APIs.
- **PostgreSQL (Supabase-hosted) + Prisma** with tenant_id on all rows; **Postgres RLS** enforces isolation.
- **Clerk** for auth (email/password + OAuth); roles stored as metadata and mirrored in DB.
- **Stripe** for fees/payments; webhooks persist receipts and update fee status.
- **Vercel** for hosting; incremental static for marketing pages; serverless functions for APIs.
- **Observability:** Vercel Analytics, DB logs, API request logging with request-ID; alerting on webhook failures.

## Architecture pattern
- **Modular monolith** within Next.js App Router (domains: auth, directory, academics, attendance, fees).
- **BFF** pattern: client talks only to Next.js APIs; APIs orchestrate DB + Stripe.
- **RLS + session variable pattern**: set `app.tenant_id` per request; policies ensure `tenant_id = current_setting('app.tenant_id')`.
- **CQRS-lite:** reads optimized via GET endpoints; mutating commands via POST/PUT/PATCH/DELETE.
- **Background jobs** (webhooks / cron): Stripe webhook, nightly timetable cache, email invites.

## State management
- **Server state:** TanStack Query (React Query) with suspense for GETs; cache keys include `tenantId`.
- **Client/UI state:** Zustand for local UI (dialogs, filters); Sonner for toasts.
- **Forms & validation:** React Hook Form + Zod schemas (shared on client/server).

## Data flow
- **Tenant signup:** Landing page → create `tenant` + admin user → provision subdomain → send Clerk invite with redirect to subdomain dashboard.
- **Login:** User authenticates via Clerk → middleware resolves tenant → RBAC gates routes/APIs → load role dashboard.
- **Admin setup:** Create classes/sections/subjects → upload users (CSV) → system sends tenant-scoped invites → generate timetable and holiday calendar.
- **Teacher daily flow:** Open dashboard → view schedule → mark period attendance → submit; updates attendance summary.
- **Student flow:** View timetable → attendance history → fee status → download receipt.
- **Fees:** Admin creates fee plans/invoices → Student pays via Stripe Checkout (tenant subdomain) → webhook → persist payment + issue receipt.

## Technical Stack
- **Frontend:** React + Next.js (App Router), Tailwind CSS, **shadcn/ui**, Lucide Icons, Sonner.
- **Auth:** **Clerk** (OAuth, email magic links, org/tenant aware redirects).
- **Backend:** Next.js Route Handlers (Node), Prisma ORM.
- **Database:** PostgreSQL (Supabase-hosted), Postgres RLS.
- **Payments:** Stripe (Checkout + Webhooks).
- **Email:** Clerk email (invites) + transactional via provider of choice (optional).
- **Deploy:** Vercel (Edge middleware for subdomains).
- **Testing:** Vitest/Playwright; Prisma seed for fixtures.

## Authentication Process
- **Providers:** Email/password, OAuth (Google, Microsoft, etc.) via Clerk.
- **Tenant resolution:** Subdomain → lookup `tenants.domain` → set `tenantId` in request context and `app.tenant_id` for DB session.
- **RBAC:** Roles {admin, teacher, student} stored in `user_tenants.role`; enforced in middleware and API handlers.
- **Session → DB mapping:** On each request, derive `userId`, `tenantId`, `role`; attach to Prisma context and set Postgres `app.tenant_id`.
- **Invite flow:** Admin uploads users → system creates pending users → sends tenant-scoped invite link (redirect URL includes subdomain).

## Route Design
- **Public (apex):** `/`, `/pricing`, `/docs`, `/signup`
- **Tenant (subdomain):**  
  - `/dashboard` (role-aware landing)  
  - **Admin:** `/classes`, `/sections`, `/subjects`, `/timetable`, `/holidays`, `/users`, `/fees`, `/reports`  
  - **Teacher:** `/schedule`, `/attendance`, `/classes/[classId]`  
  - **Student:** `/timetable`, `/attendance`, `/fees`, `/profile`
- **API (tenant-scoped via subdomain):**  
  - `/api/admin/*` (admin-only)  
  - `/api/teacher/*` (teacher-only)  
  - `/api/student/*` (student-only)  
  - `/api/webhooks/stripe` (public, verified by signature)

## API Design
- **Admin**
  - `POST /api/admin/users/import` – CSV upload; creates users with roles; emails invites.
  - `POST /api/admin/classes` / `GET /api/admin/classes` – CRUD classes.
  - `POST /api/admin/sections` / `GET /api/admin/sections`
  - `POST /api/admin/subjects` / `GET /api/admin/subjects`
  - `POST /api/admin/timetable` / `GET /api/admin/timetable` – generate/fetch schedules.
  - `POST /api/admin/holidays` / `GET /api/admin/holidays`
  - `POST /api/admin/fees/plans` / `GET /api/admin/fees/plans`
  - `POST /api/admin/fees/invoices` / `GET /api/admin/fees/invoices`
- **Teacher**
  - `GET /api/teacher/schedule?week=YYYY-Www`
  - `POST /api/teacher/attendance` – mark per period (classId, sectionId, subjectId, periodId, date, marks[]).
  - `GET /api/teacher/classes/:classId/students`
- **Student**
  - `GET /api/student/timetable`
  - `GET /api/student/attendance?range=month`
  - `GET /api/student/fees` / `GET /api/student/receipts`
- **Payments**
  - `POST /api/fees/checkout` – creates Stripe Checkout Session (invoiceId, amount).
  - `POST /api/webhooks/stripe` – verifies signature; upserts payment, generates receipt.

## Database Design ERD
- **tenants** (id, name, subdomain, status, created_at)
- **users** (id, external_auth_id, email, name, photo_url, created_at)
- **user_tenants** (id, user_id → users, tenant_id → tenants, role: enum[admin|teacher|student])  
  - *Unique (user_id, tenant_id)*
- **classes** (id, tenant_id, name, grade) → tenants
- **sections** (id, tenant_id, class_id → classes, name)
- **subjects** (id, tenant_id, name, code)
- **teacher_assignments** (id, tenant_id, teacher_user_id → users, class_id, section_id, subject_id)
- **students** (id, tenant_id, user_id → users, roll_no, contact_info)
- **enrollments** (id, tenant_id, student_id → students, class_id, section_id, academic_year)
- **timetables** (id, tenant_id, class_id, section_id, week_start)
- **timetable_slots** (id, tenant_id, timetable_id → timetables, day_of_week, period_no, subject_id, teacher_assignment_id)
- **holidays** (id, tenant_id, date, title, type)
- **attendance** (id, tenant_id, student_id, timetable_slot_id, date, status: enum[present|absent|late], marked_by_user_id)
- **fee_plans** (id, tenant_id, name, amount, frequency: enum[one_time|monthly|term])
- **invoices** (id, tenant_id, student_id, fee_plan_id, due_date, amount, status: enum[pending|paid|overdue], stripe_invoice_id?)
- **payments** (id, tenant_id, invoice_id, amount, currency, provider: enum[stripe], provider_ref, paid_at)
- **receipts** (id, tenant_id, payment_id, receipt_no, url)
- **audit_logs** (id, tenant_id, user_id, action, entity, entity_id, metadata, created_at)

### RLS/Integrity highlights
- All tables include `tenant_id`; RLS: `USING (tenant_id = current_setting('app.tenant_id')::uuid)`.
- Foreign keys enforce same-tenant references (composite FK checks where applicable).
- Unique keys: (class_id, name) on sections, (student_id, academic_year) on enrollments, (invoice_id) on payments.
