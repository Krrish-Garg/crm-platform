# AI-Powered CRM & Appointment Automation Platform

A production-grade CRM with AI-assisted lead management, scheduling, and follow-up automation — built as a real SaaS application, not a CRUD tutorial.

**Live demo:** https://crm-platform-steel.vercel.app

## Status

🚀 Live in production. Core platform complete, actively expanding.

**Completed:**
- Full authentication: register, login, JWT access + refresh tokens, protected routes, logout with token revocation, automatic silent token refresh
- Role-based access control (Admin / Manager / Sales Rep)
- Leads — full CRUD, search, filtering, pagination, inline status updates
- Contacts — full CRUD, search, pagination
- Appointments — full CRUD, date-range filtering, cross-field validation
- Dashboard with live aggregate stats and charts
- **AI features:** generate personalized follow-up emails per lead, AI-driven lead quality scoring with reasoning (OpenAI)
- Automated test suite (unit + integration, covering auth and leads including RBAC enforcement)
- Dockerized backend (multi-stage build)
- Deployed: frontend on Vercel, backend on Railway, production PostgreSQL

**Planned:**
- Broader test coverage (Contacts, Appointments)
- Analytics module
- Notifications

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS v4, React Router, React Query, Zustand, Axios, Recharts
**Backend:** Node.js, Express, TypeScript
**Database:** PostgreSQL, Prisma 7
**Auth:** JWT (access + refresh tokens), bcrypt password hashing, role-based authorization
**AI:** OpenAI API (gpt-4o-mini)
**Testing:** Jest, Supertest
**Infrastructure:** Docker (multi-stage builds), Railway (backend + database), Vercel (frontend)

## Project Structure

- apps/web – React frontend
- apps/api – Express backend
- packages/shared – shared types (planned)

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 18+
- (Optional) OpenAI API key, for AI features
- (Optional) Docker, for containerized backend

### Backend setup

cd apps/api
npm install
Create a .env file with DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, OPENAI_API_KEY
npx prisma migrate dev
npm run dev

### Frontend setup

cd apps/web
npm install
Create a .env file with VITE_API_URL=http://localhost:5000/api
npm run dev

### Running tests

cd apps/api
npm test

### Running the backend in Docker

cd apps/api
docker build -t crm-api .
docker run -p 5000:5000 --env-file .env crm-api

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|--------------|------|
| POST | /api/auth/register | Create a new user | No |
| POST | /api/auth/login | Log in, receive tokens | No |
| GET | /api/auth/me | Get current user | Yes |
| POST | /api/auth/refresh | Exchange refresh token | No |
| POST | /api/auth/logout | Revoke a refresh token | No |

### Leads
| Method | Endpoint | Description | Auth |
|--------|----------|--------------|------|
| POST | /api/leads | Create a lead | Yes |
| GET | /api/leads | List leads (paginated, filterable, searchable) | Yes |
| GET | /api/leads/stats | Aggregate lead stats | Yes |
| GET | /api/leads/:id | Get a single lead | Yes |
| PATCH | /api/leads/:id | Update a lead | Yes |
| DELETE | /api/leads/:id | Delete a lead | Admin/Manager only |
| POST | /api/leads/:id/generate-email | AI-generate a follow-up email | Yes |
| POST | /api/leads/:id/analyze | AI-analyze lead quality and update score | Yes |

### Contacts
| Method | Endpoint | Description | Auth |
|--------|----------|--------------|------|
| POST | /api/contacts | Create a contact | Yes |
| GET | /api/contacts | List contacts (paginated, searchable) | Yes |
| GET | /api/contacts/:id | Get a single contact | Yes |
| PATCH | /api/contacts/:id | Update a contact | Yes |
| DELETE | /api/contacts/:id | Delete a contact | Yes |

### Appointments
| Method | Endpoint | Description | Auth |
|--------|----------|--------------|------|
| POST | /api/appointments | Create an appointment | Yes |
| GET | /api/appointments | List appointments (date-range filterable) | Yes |
| GET | /api/appointments/:id | Get a single appointment | Yes |
| PATCH | /api/appointments/:id | Update an appointment | Yes |
| DELETE | /api/appointments/:id | Delete an appointment | Yes |