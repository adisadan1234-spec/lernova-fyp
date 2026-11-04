# Lernova

**Context-Aware Multilingual University Communication Assistant**

Lernova is a Kingston University BSc (Hons) Computer Science final-year project. It is being developed incrementally as a full-stack web application for international students who need help understanding university terminology and instructions.

## Project aim

> To reduce language barriers that limit international students' academic engagement by helping them understand unfamiliar university terminology, instructions and their importance in their preferred language, enabling them to participate more confidently in academic activities and work towards their full learning potential.

## Research question

> To what extent do context-aware multilingual explanations of academic terminology and university instructions improve international students' understanding and confidence to engage in academic activities compared with conventional translation?

The project distinguishes measured comprehension, self-reported confidence, and actual engagement. It does not assume that the system improves grades or real-world participation without supporting evidence.

## Current status

Tasks 1–9 establish the application shell, message workflow, language preferences,
validated analysis API, and replaceable language-processing service. Task 10 adds
no-cost English-to-Urdu translation while leaving later contextual-analysis
sections clearly labelled as development fixtures.

## Technology foundation

- Client: React, TypeScript, and Vite
- API: Node.js, Express, TypeScript, and Zod
- Data: PostgreSQL and Prisma ORM
- Tests: Vitest and Supertest initially; React Testing Library and Playwright are introduced with the relevant roadmap tasks

## Repository structure

```text
client/   React application
server/   Express API
prisma/   PostgreSQL schema and future migrations
tests/    Cross-application test assets added by later tasks
docs/     Public technical and research documentation
```

Private development and AI-usage records are deliberately stored in the adjacent `lernova-private` directory and are not part of this repository.

## Prerequisites

- Node.js 22.12 or newer
- npm
- PostgreSQL (required when database-backed features are introduced)

## Local setup

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

The Vite client runs at `http://localhost:5173`. The API runs at `http://localhost:4000`, with a health endpoint at `http://localhost:4000/api/health`.

## Verification commands

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run prisma:validate
```

Run all foundation checks with `npm.cmd run check`.

## Environment variables

Copy `.env.example` to `.env` and change local database credentials when needed.
`LANGUAGE_PROCESSING_PROVIDER="mymemory"` enables the free public translation
API without an account or key; use `"mock"` for offline development. Anonymous
MyMemory use is limited to 5,000 source characters per day. Never commit `.env`
or API keys.

## Privacy note

University communications may contain personal or sensitive information. Lernova
does not persist submitted messages in the current workflow. When MyMemory is
configured, the API sends message text to that external translation service, so
users should remove unnecessary personal information before submitting. Broader
privacy and retention controls remain scheduled for their roadmap task.
