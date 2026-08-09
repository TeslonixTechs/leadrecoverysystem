# ServiceFlow — Automated Customer Intake & Scheduling System

ServiceFlow is an automated customer intake and appointment scheduling engine built for local service businesses (launching with residential roofing: **Summit Ridge Roofing**).

---

## ⚡ Core Value Promise

1. **Customer Intake**: Multi-step public wizard with automated service intent classification and optional photo uploads.
2. **Scheduling Engine**: Real backend scheduling algorithm that calculates the earliest available slot considering:
   - Configured service durations (e.g., Roof Repair = 120 mins)
   - Business operating hours per day (Mon-Fri 8 AM - 6 PM, Sat 9 AM - 2 PM)
   - Configured travel/setup buffer time (default 30 mins)
   - Blocked time periods (e.g. Lunch break 12 PM - 1 PM)
   - Existing scheduled appointments
   - Current time & timezone
   - Multi-day rollover scanning (up to 14 business days out)
3. **Atomic Double-Booking Prevention**: Database transactions guarantee two customers can never book the same slot simultaneously.
4. **Immediate Arrival Calculation**: Customer receives instant confirmation with calculated arrival window (e.g., *"Estimated arrival: 4:00 PM today"*), reference number (`SR-XXXXXX`), and `.ics` calendar export.
5. **Business Management Dashboard**: Authenticated portal for business owners to view appointments, manage incoming service requests/photos, update business hours, adjust travel buffers, configure services, and manage blocked periods.

---

## 🛠️ Tech Stack

- **Frontend (`/client`)**: React.js, Vite, Tailwind CSS, Lucide React Icons, React Router DOM.
- **Backend (`/server`)**: Node.js, Express.js, Prisma ORM, SQLite (`dev.db` zero-config local setup, PostgreSQL production ready).
- **Security & Validation**: JWT Authentication, Bcrypt password hashing, Zod schema validation, business-level data isolation.
- **Testing**: Built-in Node test runner verifying scheduling slot calculation and problem classification rules.

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- Node.js v18+ installed on your system.

### 1. Install Dependencies
Run the following root command to install dependencies across the workspace:
```bash
npm run install:all
```
*(Or navigate to `/server` and `/client` individually and run `npm install`).*

### 2. Initialize Database & Seed Demo Data
Push the Prisma schema to the local SQLite database (`dev.db`) and seed the Summit Ridge Roofing company profile and sample schedule:
```bash
npm run prisma:setup
```

### 3. Run Automated Tests
Execute backend unit and scheduling engine tests:
```bash
npm run test
```

### 4. Start Development Servers
Launch both the backend API server (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

---

## 🔑 Demo Access & Testing Scenario

### Demo Business Credentials
- **Business**: Summit Ridge Roofing
- **Portal URL**: `http://localhost:5173/login`
- **Email**: `admin@summitridge.com`
- **Password**: `password123`

### Demo Booking Scenario
1. Open the public landing page at `http://localhost:5173/`.
2. Click **"Get Started"** to launch the multi-step intake flow.
3. In **Step 2 (Problem Description)**, type:
   > *"Water is coming through my bedroom ceiling after the storm."*
4. Observe the **Smart Recommendation** engine classify the request as **Storm Damage Inspection / Roof Repair**.
5. Select Urgency (**Urgent**), fill in property address (e.g., *1234 Main St, Dallas TX 75201*), and optionally attach photos.
6. Click **"Find Available Appointment"**.
7. The scheduling algorithm evaluates the existing 8:00 AM - 3:30 PM schedule + lunch block + 30-min buffer at simulated 2:10 PM, and calculates **4:00 PM today** as the earliest valid slot!
8. Log into the **Business Dashboard** (`admin@summitridge.com`) to view the appointment and service request instantly updated on the schedule.

---

## 📂 Project Architecture

```
LeadRecoverySystem/
├── package.json                   # Root workspace scripts & concurrently launcher
├── .env.example                   # Environment configuration example
├── README.md                      # Complete setup & architecture documentation
├── server/                        # Express.js + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (User, Business, Service, Appointment, etc.)
│   │   └── seed.js                # Demo seeder for Summit Ridge Roofing
│   ├── src/
│   │   ├── config/                # Prisma & JWT config
│   │   ├── controllers/           # Auth, Business, Services, Schedule, Requests, Appointments, Public
│   │   ├── middleware/            # Auth JWT, Zod validation, Error handler
│   │   ├── routes/                # REST API routes
│   │   ├── services/
│   │   │   ├── schedulingService.js            # Core slot finder algorithm
│   │   │   ├── serviceClassificationService.js # Intent classifier heuristic
│   │   │   └── notificationService.js          # Multi-channel notification abstraction
│   │   ├── app.js                 # Express app definition
│   │   └── server.js              # Server entry point
│   └── tests/                     # Automated unit & integration tests
└── client/                        # React.js + Vite Frontend
    ├── src/
    │   ├── api/                   # Axios API client wrapper
    │   ├── components/            # Sidebar, Header, UI components
    │   ├── context/               # AuthContext provider
    │   ├── layouts/               # DashboardLayout
    │   ├── pages/
    │   │   ├── customer/          # Landing, Intake Flow Wizard, Confirmation
    │   │   └── business/          # Login, Register, Overview, Appointments, Requests, Services, Schedule, Settings
    │   ├── App.jsx                # React Router hierarchy
    │   └── main.jsx               # Client entry point
    └── vite.config.js             # Vite dev server configuration & API proxy
```
