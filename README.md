# 🏢 HelpDesk: Multi-Tenant B2B SaaS Platform

A modern, scalable multi-tenant HelpDesk platform built for B2B environments. This project is structured as a monorepo leveraging Turborepo to share code and configuration across a robust Next.js frontend and a NestJS backend. 

## 🚀 Tech Stack

- **Monorepo:** Turborepo
- **Frontend:** Next.js 16 (App Router, Turbopack), React, TailwindCSS
- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL with Row Level Security (RLS) for data isolation
- **ORM / Query Builder:** Kysely
- **Validation:** Zod
- **CI/CD:** GitHub Actions & GitHub Container Registry (GHCR)
- **Containerization:** Docker

## 📁 Architecture & Structure

```
├── apps/
│   ├── api/           # NestJS Backend API (Handles business logic & DB)
│   └── web/           # Next.js Frontend Application
├── packages/
│   ├── shared/        # Shared TypeScript interfaces & utilities
│   └── validation/    # Shared Zod schemas (used by API and Web)
├── .github/workflows  # CI/CD pipelines
└── turbo.json         # Turborepo task pipeline configuration
```

## 🔐 Multi-Tenancy Strategy

This application utilizes **Row Level Security (RLS)** in PostgreSQL to ensure strict data isolation between tenants. 

Each tenant gets dedicated context, and database queries dynamically attach the active tenant ID to the PostgreSQL local transaction variables. This ensures cross-tenant data leaks are mathematically impossible at the database engine level.

## 💻 Local Development

### Prerequisites

- Node.js (v20+)
- PostgreSQL (Local or Docker)
- Docker Desktop (for testing containers locally)

### Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory (and specific `.env.local` files in `apps/api` and `apps/web` if needed).
   ```env
   # Database connection
   DATABASE_URL=postgresql://helpdesk:password@localhost:5432/helpdesk
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *This uses Turborepo to concurrently start the Next.js frontend and NestJS backend.*

### Testing & Linting

- Run all tests across the monorepo: `npm run test`
- Run the linter: `npm run lint`

## 📦 Deployment & CI/CD

This repository utilizes GitHub Actions to automatically lint, test, build, and publish Docker containers. 

Upon a push to the `main` branch, the workflow:
1. Validates the build and runs tests via Turborepo (`npm run test`, `npm run lint`).
2. Builds standalone Docker images for the `web` and `api` applications.
3. Publishes these images to the **GitHub Container Registry (GHCR)**.

To use the published images, you can run them on any Docker-compatible server or cloud provider (e.g., AWS ECS, DigitalOcean App Platform, Kubernetes).

---
*Built with modern SaaS principles in mind.*
