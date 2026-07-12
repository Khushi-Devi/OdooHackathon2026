<div align="center">

# 🏢 AssetFlow
### Enterprise Asset & Resource Management System

*Track. Allocate. Maintain. All in one place.*

[![Made for Odoo Hackathon 2026](https://img.shields.io/badge/Odoo%20Hackathon-2026-714B67?style=for-the-badge)](https://github.com/Khushi-Devi/OdooHackathon2026)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#-license)

[Live Demo](#) · [Mockup / POC](https://app.excalidraw.com/l/65VNwvy7c4X/5ceOBMjbDby) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📌 Table of Contents

- [About The Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Screens Overview](#-screens-overview)
- [User Roles & Permissions](#-user-roles--permissions)
- [Core Workflow](#-core-workflow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Team](#-team)
- [License](#-license)

---

## 🚀 About The Project

**AssetFlow** is a centralized ERP-style platform built to solve a problem every organization faces regardless of industry — offices, schools, hospitals, factories, and agencies alike: **losing track of physical assets and shared resources.**

Instead of scattered spreadsheets and paper logs, AssetFlow gives organizations a single source of truth for:

- 📋 What assets exist, and their current condition
- 👤 Who currently holds what
- 📍 Where every asset physically is
- 🔧 What's under repair, and its approval status
- 📅 What shared resources (rooms, vehicles, equipment) are booked and when

Built with clean architecture and role-based workflows, AssetFlow focuses purely on **asset lifecycle and resource management** — deliberately staying out of purchasing, invoicing, and accounting scope to keep the core product sharp and focused.

---

## ❗ Problem Statement

Organizations routinely lose visibility into their own physical assets and shared resources due to manual, disconnected tracking systems. This results in:

- Duplicate/conflicting allocations of the same asset
- Double-booked shared resources (rooms, vehicles, equipment)
- Maintenance work starting without approval or oversight
- No structured way to audit assets and catch discrepancies (lost/damaged items)
- No real-time visibility for managers into utilization, overdue returns, or upcoming maintenance

**AssetFlow solves this** by digitizing the entire asset lifecycle — from registration to disposal — with built-in conflict handling, approval workflows, and real-time dashboards.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Role-Based Access** | Realistic account creation — no self-assigned admin roles. Roles are promoted only by an Admin. |
| 📊 **Live KPI Dashboard** | Real-time snapshot: assets available/allocated, maintenance today, active bookings, overdue returns. |
| 🏢 **Organization Setup** | Manage departments (with hierarchy), asset categories, and the employee directory from one place. |
| 📦 **Full Asset Lifecycle** | Assets flow through `Available → Allocated → Reserved → Under Maintenance → Lost → Retired → Disposed`. |
| 🔄 **Smart Allocation & Transfers** | Prevents double-allocation automatically; offers a Transfer Request flow instead of a hard block. |
| 📅 **Conflict-Free Resource Booking** | Time-slot booking for shared resources with automatic overlap validation. |
| 🛠️ **Maintenance Approval Workflow** | Requests must be approved before work begins: `Pending → Approved → Technician Assigned → In Progress → Resolved`. |
| 🕵️ **Structured Audit Cycles** | Assign auditors, verify assets (`Verified / Missing / Damaged`), and auto-generate discrepancy reports. |
| 🔔 **Notifications & Activity Logs** | Full audit trail of every action, plus real-time alerts for overdue items and approvals. |
| 📈 **Reports & Analytics** | Utilization trends, maintenance frequency, department-wise summaries, and booking heatmaps. |

---

## 🖥️ Screens Overview

1. **Login / Signup** — Employee-only self-signup; roles are never self-assigned.
2. **Dashboard / Home** — KPI cards, overdue alerts, quick actions.
3. **Organization Setup** *(Admin only)* — Departments · Asset Categories · Employee Directory.
4. **Asset Registration & Directory** — Register, tag, search, and filter assets; view full history.
5. **Asset Allocation & Transfer** — Allocate, transfer, and return assets with conflict handling.
6. **Resource Booking** — Calendar-based booking with overlap protection.
7. **Maintenance Management** — Raise, approve, assign, and resolve repair requests.
8. **Asset Audit** — Run audit cycles, flag discrepancies, close cycles.
9. **Reports & Analytics** — Actionable insights for managers.
10. **Activity Logs & Notifications** — Full transparency across the organization.

---

## 👥 User Roles & Permissions

| Role | Responsibilities |
|---|---|
| **Admin** | Sets up departments, categories, and promotes Employees to Department Head / Asset Manager. Views organization-wide analytics. |
| **Asset Manager** | Registers & allocates assets. Approves transfers, maintenance requests, returns, and audit discrepancy resolutions. |
| **Department Head** | Views department assets, approves department-level allocation/transfer requests, books resources on behalf of the department. |
| **Employee** | Views assigned assets, books shared resources, raises maintenance requests, initiates returns/transfers. |

---

## 🔁 Core Workflow

```
Admin sets up Departments, Categories & promotes roles
              │
              ▼
Asset Manager registers a new Asset  →  status: Available
              │
              ▼
Asset is Allocated to Employee/Department
   (blocked if already held → Transfer Request instead)
              │
              ▼
Shared resources booked by time slot (overlaps auto-rejected)
              │
              ▼
Maintenance requested → Approved → status: Under Maintenance
              │
              ▼
Assets transferred / returned as needs change
   (overdue returns auto-flagged)
              │
              ▼
Scheduled Audit Cycles verify assets & generate discrepancy reports
              │
              ▼
All activity tracked via Notifications, Logs & Reports
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TailwindCSS + shadcn/ui, React Query (data & cache) |
| **Backend / API** | FastAPI (Python) — business logic + validation, RBAC middleware for role-based route guards, REST + WebSocket endpoints |
| **AI / Risk Scoring** | Dedicated FastAPI microservice that scores allocation churn & maintenance frequency to flag at-risk assets |
| **Data Layer** | PostgreSQL via Supabase, with a partial unique index to block double-allocation and an `EXCLUDE` constraint to prevent booking overlaps at the database level |
| **Auth** | Supabase Auth (email + password, sessions) — signup creates an Employee account only; roles are promoted by Admin from the Employee Directory |
| **Deployment** | Vercel (Frontend) · Render / Fly.io (FastAPI services) · Supabase (DB + Auth + Storage) |
| **Design/Prototype** | [Excalidraw Mockup](https://app.excalidraw.com/l/65VNwvy7c4X/5ceOBMjbDby) |

### Architecture Diagram

```
 FRONTEND                     BACKEND / API                  DATA LAYER
 ─────────                    ──────────────                 ──────────
 Next.js 14 (App Router)  ──►  FastAPI (Python)         ──►  PostgreSQL (Supabase)
 TailwindCSS + shadcn/ui       Business logic + valid.       Partial unique index
 React Query                   RBAC middleware                (blocks double-allocation)
                                REST + WebSocket endpoints    EXCLUDE constraint
                                                               (blocks booking overlap)
      │                              │
      ▼                              ▼  (writes risk_score)
 AUTH                          AI / RISK SCORING
 ────                          ─────────────────
 Supabase Auth                 Risk Scoring Service (FastAPI microservice)
 (email+password, sessions)    Features: allocation churn, maintenance
 Signup = Employee only;       frequency → risk score
 Admin promotes roles
 from directory

 DEPLOYMENT
 ──────────
 Vercel — Frontend
 Render / Fly.io — FastAPI services
 Supabase — DB + Auth + Storage
```

---

## 📂 Project Structure

```
OdooHackathon2026/
├── assetflow/              # Main application source
│   ├── frontend/           # Next.js 14 app (App Router, Tailwind, shadcn/ui)
│   ├── backend/            # FastAPI service — business logic, RBAC, REST/WebSocket
│   └── risk-scoring/        # FastAPI microservice for AI risk scoring
├── .gitignore
└── README.md
```

> Update the folder names above to match your actual repo layout if they differ.

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Python](https://www.python.org/) 3.10+
- A [Supabase](https://supabase.com/) project (for Postgres + Auth)

### Frontend Setup

```bash
# 1. Clone the repository
git clone https://github.com/Khushi-Devi/OdooHackathon2026.git
cd OdooHackathon2026/assetflow/frontend

# 2. Install dependencies
npm install

# 3. Add environment variables
cp .env.example .env.local
# Fill in your Supabase URL/anon key and backend API URL

# 4. Run the dev server
npm run dev
```

### Backend Setup

```bash
cd OdooHackathon2026/assetflow/backend

# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Add environment variables
cp .env.example .env
# Fill in your Supabase connection string and secrets

# 4. Run the API
uvicorn main:app --reload
```

The frontend should now be running locally (check your terminal for the exact URL), talking to the FastAPI backend which connects to your Supabase Postgres instance.

---

## 👩‍💻 Team

| Name | Role | GitHub |
|---|---|---|
| Khushi Devi | | [@Khushi-Devi](https://github.com/Khushi-Devi) |
| Raghav Bansal | | [@Raghav007](https://github.com/Raghav007) |
| Harshit Sharma | | [@Sharmaharshit0](https://github.com/Sharmaharshit0) |
| Riddhi Sharma | | [@Riddhi375](https://github.com/Riddhi375) |

---

## 📄 License

This project is built for the **Odoo Hackathon 2026** and is currently unlicensed for public reuse. Add an [MIT License](https://choosealicense.com/licenses/mit/) or your preferred license here if you plan to open-source it.

---

<div align="center">

Made with ❤️ for Odoo Hackathon 2026

</div>
