# FINDEXA — SPEC DRIVEN DEVELOPMENT

## Design Specifications

## Version: 4.0

## For AI Agents

---

## AGENT INSTRUCTIONS

This document defines WHAT to build, not HOW to build it. Your job is to implement the code based on these specifications. Do not deviate from the structure, naming, versions, or behavior described here. Do not add features not listed. Ask before making any decision not covered in this document.

**Non-negotiable rules:**

- Exact file paths and names as specified
- Exact dependency versions — no upgrades or downgrades
- No extra dependencies
- Strict TypeScript — no `any`, no `@ts-ignore`
- All user-facing text in Spanish (Latin American)
- All code comments in English

---

## PRODUCT

**Name:** Findexa
**Tagline:** "Sal de la rata race. Con datos, no con suerte."
**Purpose:** Show users their Financial Freedom Index — a single number that reveals how close they are to financial independence
**Currency:** Peruvian Soles (S/.)
**Primary language:** Spanish (Latin American)
**Platform:** PWA — mobile first (375px minimum viewport width)

---

## CORE FORMULA

```
Financial Freedom Index (ILF) = (Passive Income / Total Expenses) × 100
```

**Rules:**

- Result is an integer between 0 and 100 (inclusive)
- Cap at 100 — never exceed 100%
- If total expenses = 0 → index = 100
- Uses decimal precision with HALF_UP rounding before converting to integer
- Passive income = sum of monthly income from all user assets

**Derived metric — Years to Freedom:**

```
Years to Freedom = (Total Expenses - Passive Income) / Monthly Cash Flow / 12
```

**Rules:**

- If index ≥ 100 → years to freedom = 0
- If monthly cash flow ≤ 0 → years to freedom = null (not calculable)
- Round up to nearest integer

**Computed fields (server-side only, never by client):**

```
passive_income  = sum of all asset monthly_income for this user
debt_payments   = sum of all liability monthly_payment for this user
total_income    = salary_income + passive_income + other_income
total_expenses  = housing_expense + food_expense + transport_expense + debt_payments + other_expenses
cash_flow       = total_income - total_expenses
freedom_index   = calculateFreedomIndex(passive_income, total_expenses)
```

---

## ARCHITECTURE

```
One project. One deploy. One repository.

┌─────────────────────────────────────────┐
│              VERCEL (free)               │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │          Next.js 15              │   │
│  │                                  │   │
│  │  src/app/           ← React UI  │   │
│  │  src/app/api/       ← Backend   │   │
│  └────────────┬─────────────────────┘   │
└───────────────│─────────────────────────┘
                │
     ┌──────────┴───────────┐
     ↓                      ↓
┌──────────────┐    ┌──────────────────┐
│   Supabase   │    │    AI Coach      │
│   (free)     │    │  (TBD)           │
│  Auth + DB   │    │                  │
└──────────────┘    └──────────────────┘
```

**Key principles:**

- Frontend and backend live in the same Next.js project
- API routes replace a separate backend server
- Supabase handles authentication and database
- AI coach provider TBD — will be integrated in a future task
- Future React Native app will consume the same API routes unchanged

---

## TECHNOLOGY STACK

### Core

| Technology | Version  | Purpose              |
| ---------- | -------- | -------------------- |
| Next.js    | 15.3.0   | Full stack framework |
| React      | 19.1.0   | UI library           |
| TypeScript | 5.8.3    | Language             |
| Node.js    | 20.x LTS | Runtime              |

### Styling

| Technology   | Version | Purpose               |
| ------------ | ------- | --------------------- |
| Tailwind CSS | 4.1.x   | Utility-first styling |

### Data & Auth

| Technology            | Version | Purpose                  |
| --------------------- | ------- | ------------------------ |
| @supabase/supabase-js | 2.49.4  | Database + Auth client   |
| @supabase/ssr         | 0.6.1   | Server-side auth helpers |

### PWA

| Technology | Version | Purpose     |
| ---------- | ------- | ----------- |
| next-pwa   | 5.6.0   | PWA support |

### Utilities

| Technology     | Version | Purpose                            |
| -------------- | ------- | ---------------------------------- |
| zod            | 3.24.2  | Runtime validation                 |
| clsx           | 2.1.1   | Conditional class names            |
| tailwind-merge | 3.2.0   | Tailwind class conflict resolution |

---

## PROJECT STRUCTURE

```
findexa/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        ← Landing
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   ├── reveal/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── callback/
│   │       │       └── route.ts
│   │       ├── snapshot/
│   │       │   └── route.ts
│   │       ├── assets/
│   │       │   └── route.ts
│   │       ├── liabilities/
│   │       │   └── route.ts
│   │       └── coach/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── FreedomIndex.tsx
│   │   ├── BalanceSheet.tsx
│   │   ├── AssetsList.tsx
│   │   ├── LiabilitiesList.tsx
│   │   ├── CoachInsight.tsx
│   │   ├── OnboardingStep.tsx
│   │   └── DashboardTabs.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── calculations.ts
│   │   └── format.ts
│   ├── types/
│   │   └── finances.ts
│   └── middleware.ts
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── next.config.ts
├── tsconfig.json
└── .env.local
```

---

## CONSTANT TABLE

The database has a `public.constant` table that stores all label values used across the app. All fields that reference categories use `INT` — the `value` field from the constant table.

```
constant table structure:
  id        INT   → category identifier
  value     INT   → item identifier within the category
  label     TEXT  → display text in Spanish
  shortened TEXT  → abbreviation or symbol

Category IDs:
  100 → months
  101 → currencies
  102 → countries
  103 → asset types
  104 → liability types

How to read a value:
  To get the label for asset type_id = 2:
  SELECT label FROM constant WHERE id = 103 AND value = 2
  → "inversiones"
```

---

## DATA TYPES

### Entities

```
Constant:
  id:         number
  value:      number
  label:      string
  shortened:  string | null

UserProfile:
  id:                   string (UUID)
  email:                string
  name:                 string
  countryId:            number  → references constant(id=102).value, default 1
  currencyId:           number  → references constant(id=101).value, default 1
  onboardingCompleted:  boolean → default false
  createdAt:            string (ISO 8601)

FinancialSnapshot:
  id:                   string (UUID)
  userId:               string (UUID)
  monthId:              number  → references constant(id=100).value

  salaryIncome:         number
  passiveIncome:        number  → computed
  otherIncome:          number

  housingExpense:       number
  foodExpense:          number
  transportExpense:     number
  debtPayments:         number  → computed
  otherExpenses:        number

  totalIncome:          number  → computed
  totalExpenses:        number  → computed
  cashFlow:             number  → computed
  freedomIndex:         number  → computed (0-100 integer)

  createdAt:            string (ISO 8601)

Asset:
  id:                   string (UUID)
  userId:               string (UUID)
  name:                 string
  monthlyIncome:        number
  typeId:               number  → references constant(id=103).value
  createdAt:            string (ISO 8601)

Liability:
  id:                   string (UUID)
  userId:               string (UUID)
  name:                 string
  monthlyPayment:       number
  totalBalance:         number
  typeId:               number  → references constant(id=104).value
  createdAt:            string (ISO 8601)
```

### Request/Response shapes

```
OnboardingData (client-side state only):
  step:             1 | 2 | 3 | 4 | 5
  salaryIncome:     number (optional)
  otherIncome:      number (optional)
  housingExpense:   number (optional)
  foodExpense:      number (optional)
  transportExpense: number (optional)
  otherExpenses:    number (optional)
  assets:           { name, monthlyIncome, typeId }[] (optional)
  liabilities:      { name, monthlyPayment, totalBalance, typeId }[] (optional)

SnapshotRequest:
  salaryIncome:     number
  otherIncome:      number
  housingExpense:   number
  foodExpense:      number
  transportExpense: number
  otherExpenses:    number
  assets:           { name, monthlyIncome, typeId }[]
  liabilities:      { name, monthlyPayment, totalBalance, typeId }[]

SnapshotResponse:
  freedomIndex:     number
  totalIncome:      number
  totalExpenses:    number
  cashFlow:         number
  passiveIncome:    number
  yearsToFreedom:   number | null

DashboardData:
  snapshot:         FinancialSnapshot
  assets:           Asset[]
  liabilities:      Liability[]
  constants:        Constant[]  → all constants needed for labels

CoachResponse:
  message:          string (1-2 sentences in Spanish)
```

---

## DATABASE

**Provider:** Supabase (PostgreSQL 17)
**Status:** Already configured — tables and RLS created

```
Tables:
  public.constant              → category labels (read-only, public)
  public.profiles              → user profiles
  public.financial_snapshots   → monthly financial data
  public.assets                → user assets
  public.liabilities           → user liabilities

Supabase connection:
  Browser client  → uses NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
  Server client   → uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
```

---

## API ROUTES

### GET /api/constants

**Auth:** Not required
**Purpose:** Fetch all constants for client-side label rendering
**Response 200:** `{ constants: Constant[] }`

### POST /api/snapshot

**Auth:** Required (Supabase session)
**Purpose:** Create or update financial snapshot for current month. Compute all derived fields server-side.
**Request:** SnapshotRequest
**Response 200:** SnapshotResponse
**Response 400:** Validation error
**Response 401:** Unauthenticated

### GET /api/snapshot

**Auth:** Required
**Purpose:** Fetch latest snapshot + assets + liabilities + constants for dashboard
**Response 200:** DashboardData
**Response 401:** Unauthenticated

### POST /api/assets

**Auth:** Required
**Request:** `{ name, monthlyIncome, typeId }`
**Response 201:** Asset
**Response 401:** Unauthenticated

### DELETE /api/assets?id={uuid}

**Auth:** Required
**Response 204:** No content
**Response 401:** Unauthenticated
**Response 404:** Not found or not owned by user

### POST /api/liabilities

**Auth:** Required
**Request:** `{ name, monthlyPayment, totalBalance, typeId }`
**Response 201:** Liability
**Response 401:** Unauthenticated

### DELETE /api/liabilities?id={uuid}

**Auth:** Required
**Response 204:** No content
**Response 401:** Unauthenticated
**Response 404:** Not found or not owned by user

### POST /api/coach

**Auth:** Required
**Purpose:** Get one AI insight — provider TBD, leave as placeholder
**Request:** `{ snapshotId: string }`
**Response 200:** CoachResponse
**Response 401:** Unauthenticated
**Response 404:** Snapshot not found

### Error response format (all routes)

```
{
  error:     string  → short error code
  message:   string  → human readable, in Spanish
  timestamp: string  → ISO 8601
}
```

---

## SCREENS & NAVIGATION

```
/                   Landing
  ↓ register
/register           Registration form
  ↓ success
/onboarding         5-step data collection
  ↓ step 5 complete
/reveal             First-time index reveal (shown once)
  ↓ button click
/dashboard          Main app screen

/login              Login → /dashboard (onboarding done)
                         → /onboarding (onboarding pending)
```

### Route protection

```
Route         | No session      | Active session
/             | Show landing    | → /dashboard
/login        | Show login      | → /dashboard
/register     | Show register   | → /dashboard
/onboarding   | → /login        | Show onboarding
/reveal       | → /login        | Show reveal
/dashboard    | → /login        | Show dashboard
```

---

## SCREEN SPECIFICATIONS

### Landing (`/`)

```
Headline:    "¿Eres libre financieramente?"
Subheadline: "Descúbrelo en 2 minutos."
CTA button:  "Calcular mi índice"  → /register
Link:        "Ya tengo cuenta"     → /login
```

### Register (`/(auth)/register`)

```
Fields:
  name      text      required  min 2 chars
  email     email     required
  password  password  required  min 8 chars

On success:  redirect to /onboarding
On error:    show inline error below the field
```

### Login (`/(auth)/login`)

```
Fields:
  email     email     required
  password  password  required

On success:
  if onboardingCompleted = true  → /dashboard
  if onboardingCompleted = false → /onboarding
On error: show inline error
```

### Onboarding (`/onboarding`)

```
One question per screen.
Progress bar at top (step N of 5).
No back button.
State managed in React useState with OnboardingData type.
Do NOT use a form library.

Step 1 — Ingresos
  Title:   "¿Cuánto ganas al mes?"
  Inputs:  salaryIncome (required), otherIncome (optional, default 0)

Step 2 — Gastos
  Title:   "¿Cuánto gastas al mes?"
  Inputs:  housingExpense, foodExpense, transportExpense (all required)
           otherExpenses (optional, default 0)

Step 3 — Deudas
  Title:   "¿Tienes deudas?"
  Option A: "No tengo deudas" → skip to step 4
  Option B: Add liability form
    Fields: name (text), monthlyPayment (number), totalBalance (number), typeId (select from constant id=104)
    Button: "+ Agregar otra deuda"

Step 4 — Activos
  Title:   "¿Tienes algo que genere dinero?"
  Option A: "No tengo activos aún" → skip to step 5
  Option B: Add asset form
    Fields: name (text), monthlyIncome (number), typeId (select from constant id=103)
    Button: "+ Agregar otro activo"

Step 5 — Calculating
  Title:   "Calculando tu índice..."
  Action:  POST /api/snapshot with all collected data
  On success → redirect to /reveal
  On error   → show error message with retry button
```

### Reveal (`/reveal`)

```
Purpose: Emotional first-time reveal of the Freedom Index.
Only shown once — if already seen, redirect immediately to /dashboard.

Elements:
  1. Animated number counting from 0 to freedomIndex over 1.5 seconds
     Animation: requestAnimationFrame
  2. Text: "Hoy eres {index}% libre."
  3. If index < 100:  "A este ritmo, serás libre en {years} años."
     If index = 0:    "Aún no tienes activos. Ese es el primer paso."
     If index = 100:  "¡Eres financieramente libre!"
  4. Button: "Ver mi balance completo" → /dashboard
```

### Dashboard (`/dashboard`)

```
Layout (top to bottom, mobile first):

  1. Header
     App name: Findexa
     User avatar / initials

  2. Freedom Index card (always visible)
     Large: "Hoy eres X% libre."
     Progress bar: 0% to 100%
     Small text: "Libre en N años" (or hidden if index = 100)

  3. Summary metrics (2×2 grid)
     Total income     | Total expenses
     Passive income   | Cash flow

  4. Tab navigation
     Balance | Activos | Pasivos

  5. Tab content

  6. AI Coach card (loads async after dashboard)
     Label: "Tu coach financiero"
     Content: AI insight message
     Note: POST /api/coach — provider TBD, show placeholder if not available

TAB: Balance
  Income rows:
    Sueldo              S/. {salaryIncome}
    Ingresos pasivos    S/. {passiveIncome}   ← green
    Otros ingresos      S/. {otherIncome}
  Expense rows:
    Vivienda            S/. {housingExpense}
    Alimentación        S/. {foodExpense}
    Transporte          S/. {transportExpense}
    Deudas              S/. {debtPayments}    ← red if > 0
    Otros gastos        S/. {otherExpenses}
  Summary row:
    Flujo de caja       S/. {cashFlow}        ← green if positive, red if negative

TAB: Activos
  List of assets: name, typeId label from constant, S/. monthlyIncome/mes
  If empty: "Aún no tienes activos registrados."
  Button: "+ Agregar activo"

TAB: Pasivos
  List of liabilities: name, typeId label from constant, S/. monthlyPayment/mes, total balance
  If empty: "No tienes pasivos. ¡Excelente!"
  Button: "+ Agregar pasivo"
```

---

## UI DESIGN TOKENS

```
Brand color:        #1D9E75  (teal-green)
Brand light:        #E1F5EE
Brand dark:         #0F6E56
Danger color:       #D85A30
Danger light:       #FAECE7

Font:               Inter, system-ui, sans-serif

Border radius:      8px (components), 12px (cards)
Mobile viewport:    375px minimum width
```

---

## PWA CONFIGURATION

```
manifest.json:
  name:              "Findexa"
  short_name:        "Findexa"
  description:       "Tu Índice de Libertad Financiera"
  start_url:         "/"
  display:           "standalone"
  orientation:       "portrait"
  background_color:  "#ffffff"
  theme_color:       "#1D9E75"
  icons:
    - src: /icons/icon-192.png  sizes: 192x192  type: image/png
    - src: /icons/icon-512.png  sizes: 512x512  type: image/png

next-pwa config:
  dest:        "public"
  register:    true
  skipWaiting: true
  disable in development: true
```

---

## ENVIRONMENT VARIABLES

```
NEXT_PUBLIC_SUPABASE_URL        Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY       Supabase service role key (server-side only)
NEXT_PUBLIC_APP_URL             App URL (default: http://localhost:3000)
AI_COACH_API_KEY                AI coach API key (TBD — do not implement yet)
```

---

## COMPLETED SETUP

The following has already been done — agents must NOT redo this:

- Next.js 15.3.0 project created with TypeScript, Tailwind, App Router, src/ directory
- Dependencies installed: @supabase/supabase-js, @supabase/ssr, next-pwa, zod, clsx, tailwind-merge
- Git repository initialized and pushed to GitHub
- .env.local created with Supabase credentials
- Supabase project created with all tables, RLS, policies, and trigger

---

## TASK LIST FOR AGENTS

Complete in order. Verify each task before moving to the next.

```
TASK 1 — Types & Utilities
  [x] Create src/types/finances.ts with all types defined in this doc
  [x] Create src/lib/calculations.ts with Freedom Index formula
  [x] Create src/lib/format.ts with S/. currency formatter
  [x] Verify: TypeScript compiles with zero errors

TASK 2 — Supabase Client
  [x] Create src/lib/supabase/client.ts (browser client)
  [x] Create src/lib/supabase/server.ts (server client)
  [x] Verify: clients initialize without errors

TASK 3 — Auth & Middleware
  [x] Create src/middleware.ts (route protection per table above)
  [x] Create src/app/auth/register/page.tsx
  [x] Create src/app/auth/login/page.tsx
  [x] Create src/app/api/auth/callback/route.ts
  [x] Verify: register → redirect to /onboarding
  [x] Verify: authenticated user visiting / → redirect to /dashboard

TASK 4 — UI Components
  [x] Create src/components/ui/Button.tsx
  [x] Create src/components/ui/Input.tsx
  [x] Create src/components/ui/Card.tsx
  [x] Create src/components/ui/ProgressBar.tsx
  [x] Verify: renders correctly at 375px viewport

TASK 5 — API Routes
  [x] Create src/app/api/constants/route.ts (GET)
  [x] Create src/app/api/snapshot/route.ts (GET + POST)
  [x] Create src/app/api/assets/route.ts (POST + DELETE)
  [x] Create src/app/api/liabilities/route.ts (POST + DELETE)
  [x] Create src/app/api/coach/route.ts (POST — placeholder only)
  [x] Verify: all routes return correct shapes

TASK 6 — Onboarding
  [ ] Create src/components/OnboardingStep.tsx
  [ ] Create src/app/onboarding/page.tsx (all 5 steps)
  [ ] Selects for typeId load from GET /api/constants
  [ ] Verify: complete flow sends POST /api/snapshot and redirects to /reveal

TASK 7 — Reveal Screen
  [ ] Create src/app/reveal/page.tsx
  [ ] Implement count-up animation (requestAnimationFrame)
  [ ] Verify: shows correct index, redirects to /dashboard if already seen

TASK 8 — Dashboard
  [ ] Create src/components/FreedomIndex.tsx
  [ ] Create src/components/BalanceSheet.tsx
  [ ] Create src/components/AssetsList.tsx
  [ ] Create src/components/LiabilitiesList.tsx
  [ ] Create src/components/DashboardTabs.tsx
  [ ] Create src/components/CoachInsight.tsx (placeholder if no AI provider)
  [ ] Create src/app/dashboard/page.tsx
  [ ] Verify: type labels rendered from constant table, not hardcoded
  [ ] Verify: all data displays correctly at 375px

TASK 9 — PWA
  [ ] Create public/manifest.json
  [ ] Add icon-192.png and icon-512.png to public/icons/
  [ ] Configure next.config.ts with next-pwa
  [ ] Verify: installable on Android Chrome
  [ ] Verify: installable on iOS Safari

TASK 10 — Deploy
  [ ] Run npm run build — must pass with zero errors
  [ ] Deploy to Vercel
  [ ] Verify: production app loads correctly
```

---

## ACCEPTANCE CRITERIA

Phase 1 is complete when ALL of the following are true:

- [ ] New user registers, completes onboarding, and sees Freedom Index in under 3 minutes
- [ ] Freedom Index formula produces correct results
- [ ] All computed fields calculated server-side
- [ ] Type labels come from constant table — never hardcoded strings
- [ ] Reveal animation runs smoothly on 375px mobile viewport
- [ ] Dashboard displays all financial data correctly in 3 tabs
- [ ] Coach card shows placeholder when AI provider not configured
- [ ] App is installable as PWA on Android and iOS
- [ ] All protected routes redirect unauthenticated users to /login
- [ ] Authenticated users visiting /, /login, /register redirect to /dashboard
- [ ] npm run build passes with zero TypeScript errors
- [ ] No user can read or write another user's data (RLS enforced)

---

## PHASE 2 — FUTURE (do not build now)

- AI coach integration (provider TBD)
- Investment portfolio tracking
- Multi-month historical charts
- React Native + Expo mobile app
- Bank account integration

---

_SDD Version: 4.0_
_Product: Findexa_
_Stack: Next.js 15.3 + TypeScript 5.8 + Supabase_
_Architecture: Next.js full stack — simple structure_
_Deploy: Vercel (free)_
_Date: April 2026_
_For AI agents — implement exactly as specified_
