# ClinicCortex Frontend Applications Overview

Welcome to the frontend repositories of **ClinicCortex** — an advanced Health Intelligence platform. This project holds two main user-facing frontend folders, organized as a monorepo setup:

1.  **Doctor Portal (`Doctordashboarddesign`)**: An administrative, analytical dashboard for doctors to manage appointments, slots, prescriptions, and consults.
2.  **Patient Portal (`cliniccortex-patient-fe`)**: A responsive mobile-first portal for patients to find doctors, schedule appointments, review vitals, consult with AI, and buy medicines.

---

## Workspace Structure Map

Here is the top-level directory layout of the workspace:

```
Clinic-Cortex/
├── Doctordashboarddesign/      # Doctor Portal Frontend (React 18 SPA)
├── cliniccortex-patient-fe/    # Patient Portal Frontend (React 19 TanStack Start SSR)
├── backend_setup.md            # Plan for the Express.js Backend Server
├── database_setup.md           # Plan for the PostgreSQL Database Schema
├── implementation_plan.md      # Technical specification and wiring blueprints
└── README.md                   # This overview file
```

---

## 1. Doctor Dashboard Application (`Doctordashboarddesign/`)

The Doctor dashboard is configured as a client-side Single Page Application (SPA) utilizing React 18, Vite, and Tailwind CSS v4. It manages mock state and credentials locally inside `localStorage`.

### A. Folder Structure & Key Configurations

```
Doctordashboarddesign/
├── public/                     # Static assets (favicons, logos)
├── src/
│   ├── app/
│   │   ├── components/         # Page components and views
│   │   │   ├── ui/             # Reusable UI widgets
│   │   │   ├── Appointments.tsx
│   │   │   ├── CompletedVisits.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DoctorProfile.tsx
│   │   │   ├── HomeVisits.tsx
│   │   │   ├── Inbox.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── PatientRecords.tsx
│   │   │   ├── Patients.tsx
│   │   │   ├── ProfileEdit.tsx
│   │   │   ├── Schedule.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Signup.tsx      # Comprehensive multi-stage registration form
│   │   │   ├── TodayAppointmentsStat.tsx
│   │   │   └── VirtualConsultation.tsx
│   │   ├── lib/
│   │   │   ├── appointmentData.ts  # Local Storage appointment seeders
│   │   │   └── doctorProfile.ts    # Doctor profile mock helpers
│   │   ├── App.tsx             # Root app shell
│   │   └── routes.tsx          # React Router v7 routes configuration
│   ├── assets/                 # SVGs and PNG assets
│   ├── styles/                 # Custom Tailwind CSS v4 setup stylesheets
│   └── main.tsx                # Entry point mounting React to DOM
├── default_shadcn_theme.css    # Unified shadcn configuration stylesheets
├── package.json                # Project dependencies (React 18, React Router v7)
├── vite.config.ts              # Vite configurations with @tailwindcss/vite
└── pnpm-workspace.yaml         # PNPM monorepo config
```

### B. Directory Breakdown & Component Descriptions

*   **Routing Logic**:
    *   Configured in [routes.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/routes.tsx).
    *   Auth gate reads `localStorage.getItem("cliniccortex-auth") === "true"` to check login status. Unauthenticated sessions are redirected automatically to `/login`.
*   **Authentication & Settings**:
    *   [Login.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/components/Login.tsx): Handles verification using plain strings saved inside `localStorage.getItem("cliniccortex-account")`.
    *   [Signup.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/components/Signup.tsx): A detailed, 5-stage setup wizard collecting over 80 registration properties (contact info, medical credentials, Smc details, PG degrees, bank details, and consent preferences).
    *   [Settings.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/components/Settings.tsx): Configures active notification preferences, professional charges, and page appearance.
*   **Clinical Dashboards**:
    *   [Dashboard.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/components/Dashboard.tsx): Displays vital overview cards (Today's count, total revenue, upcoming consultations) and pending acceptance lists.
    *   [Appointments.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/components/Appointments.tsx): Houses a tabbed selector separating upcoming, completed, and missed appointments, letting doctors adjust statuses or start tele-sessions.
    *   [Schedule.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/components/Schedule.tsx): Manages weekly doctor schedules. Enables toggling operational status (Active/Inactive) per day and adding customized hours and slot intervals.
*   **Patient & Record Directory**:
    *   [Patients.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/components/Patients.tsx): Interactive lists showcasing patient files, health conditions, genders, and ages.
    *   [PatientRecords.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/components/PatientRecords.tsx): Drills down into individual clinical timelines, displaying bio-readings (e.g. Heart Rate, HRV, SpO2) and prescriptions written by the doctor.
*   **Communication & Notifications**:
    *   [Inbox.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/components/Inbox.tsx): A messenger view showing active patient conversation threads and real-time chat mockups.
    *   [Notifications.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/Doctordashboarddesign/src/app/components/Notifications.tsx): Categorized alert board notifying the doctor of rescheduled consultations or urgent status flags.

---

## 2. Patient Portal Application (`cliniccortex-patient-fe/`)

The Patient frontend is built on **TanStack Start** — a full-stack, SSR-friendly framework utilizing React 19, file-based routing, TanStack Query (caching & refetching), and Tailwind CSS v4.

### A. Folder Structure & Configurations

```
cliniccortex-patient-fe/
├── src/
│   ├── components/
│   │   ├── ui/                 # Custom button, dialog, and form controls
│   │   ├── cc-flows.tsx        # Authentication and onboarding screens
│   │   ├── cc-screens.tsx      # Main application dashboard screens
│   │   └── cc-shell.tsx        # Responsive layout frame and navigation bar
│   ├── hooks/                  # TanStack Query and state synchronization hooks
│   ├── lib/
│   │   ├── cc-state.tsx        # Main application state context provider
│   │   ├── error-capture.ts    # Global error catcher
│   │   └── error-page.ts       # Visual fallback fallback pages
│   ├── routes/
│   │   ├── __root.tsx          # Root layout setup & TanStack Query configuration
│   │   └── index.tsx           # Home entry route ("/") mounting the App
│   ├── server.ts               # SSR compilation entry point
│   ├── start.ts                # Client hydration loader
│   └── styles.css              # Custom styling definitions for UI components
├── tsconfig.json               # TypeScript configurations
├── bunfig.toml / bun.lock      # Bun configuration files for packages
├── wrangler.jsonc              # Cloudflare worker integration parameters
├── eslint.config.js            # Linter rules
└── package.json                # Project dependencies (React 19, TanStack Start)
```

### B. Core Architectural Logic

#### Navigation & State Context
*   Configured in [cc-state.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/cliniccortex-patient-fe/src/lib/cc-state.tsx).
*   Rather than navigating between multiple physical routes, the app runs on a single path (`/`) in [index.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/cliniccortex-patient-fe/src/routes/index.tsx). Screen layout shifts are triggered dynamically by React Context variables:
    *   **`flow` state**: Transitions from Gateway (onboarding choice) $\rightarrow$ Language selection $\rightarrow$ Identity verification $\rightarrow$ Login/Signup $\rightarrow$ Main app.
    *   **`screen` state**: Renders view panels inside the main frame (Home screen, Search screen, Wallet panel, Booking calendar, etc.).
    *   **Translation support (`t()`)**: Instantly translates keys into English, Hindi, Kannada, Bangla, Telugu, Marathi, Urdu, Gujarati, Malayalam, Assamese, Sanskrit, Bodo, or Nepali.

#### Entry & Auth Flows ([cc-flows.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/cliniccortex-patient-fe/src/components/cc-flows.tsx))
*   **Gateway**: Onboarding screen prompting patients to either download the Mobile application or continue on the Web.
*   **Identity**: Role selector screen letting patients verify their identity. If a user selects "Doctor", they are redirected to the Doctor Portal.
*   **Login & Signup**: Simulates authentication via mobile number, custom OTP, or fingerprint scan. Signup form collects name, age, gender, email, phone, and annual income.

#### Application Screens ([cc-screens.tsx](file:///c:/Users/admin/Desktop/BCA/5th%20SEM/Clinic-Cortex/cliniccortex-patient-fe/src/components/cc-screens.tsx))
*   **HomeScreen**: Main hub displaying quick service icons (AI Analyzer, Pharmacy, Lab Reports), upcoming appointment countdown cards, and vital checks.
*   **AppointmentsScreen & Booking**: Houses tabs for active and historical appointments. Patients can search a directory of top doctors, review consultation fees, pick calendar dates, and choose available time slots to confirm bookings.
*   **Health Trackers**:
    *   `GlucoseScreen`: Displays blood glucose levels (mmol/L) using radial SVGs, along with nutritional charts tracking water and supplements.
    *   `VitalsScreen`: Visualizes metrics like respiratory rates, HRV, blood oxygen, and sleep duration.
*   **ChatScreen**: Messaging panel connecting patients to their doctors, complete with live status indicators and simulated typing bubbles.
*   **PharmacyStore**: Medicine listing page supporting filters (Rx vs. OTC), cart management, price calculators, and digital prescription upload options.
*   **Digital Wallet & Transactions**: Tracks available wallet balances, CC points, monthly plans (Basic, Plus, Pro), and historical transaction details.
*   **AI Analyzer**: Provides immediate health insights based on recorded patient biometrics and risk factor variables.

---

## 3. How to Run Locally

### Doctor Portal Setup
```bash
# 1. Navigate to directory
cd Doctordashboarddesign

# 2. Install dependencies
npm install

# 3. Start local development server (runs on http://localhost:5173)
npm run dev
```

### Patient Portal Setup
```bash
# 1. Navigate to directory
cd cliniccortex-patient-fe

# 2. Install dependencies (Bun is recommended)
bun install
# or
npm install

# 3. Start development server (runs on http://localhost:5174)
bun run dev
# or
npm run dev
```
