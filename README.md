# AI-Powered CRM & Appointment Automation Platform

A production-grade CRM with AI-assisted lead management, scheduling, and follow-up automation — built as a real SaaS application, not a CRUD tutorial.

## Status

🚧 Actively in development.

**Completed:**
- Full authentication system: register, login, JWT access + refresh tokens, protected routes, logout with token revocation
- PostgreSQL database with Prisma 7 ORM (driver-adapter architecture)
- Input validation with Zod, password hashing with bcrypt

**In progress:**
- Lead management (CRUD)
- Dashboard UI

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS v4, React Router, React Query, Zustand, Axios
**Backend:** Node.js, Express, TypeScript
**Database:** PostgreSQL, Prisma 7
**Auth:** JWT (access + refresh tokens), bcrypt password hashing
**Validation:** Zod

## Project Structure

- apps/web – React frontend
- apps/api – Express backend
- packages/shared – shared types (planned)

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 18+

### Backend setup

```bash
cd apps/api
npm install
# Create a .env file with DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
npx prisma migrate dev
npm run dev
```

### Frontend setup

```bash
cd apps/web
npm install
npm run dev
```

## API Endpoints (current)

| Method | Endpoint | Description | Auth required |
|--------|----------|--------------|----------------|
| POST | `/api/auth/register` | Create a new user | No |
| POST | `/api/auth/login` | Log in, receive tokens | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/refresh` | Exchange refresh token for new access token | No |
| POST | `/api/auth/logout` | Revoke a refresh token | No |