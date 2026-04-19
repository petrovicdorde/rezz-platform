# CLAUDE.md

## Project: rezz-platform

Monorepo with pnpm workspaces + Turborepo.

- `apps/api` — NestJS backend
- `apps/web` — React + Vite frontend
- `packages/shared` — Shared types

## Commands

- `pnpm dev` — Start all apps
- `pnpm build` — Build all apps
- `cd apps/api && pnpm seed` — Seed database

## UI Rules

- All buttons, links, and clickable elements must have `cursor: pointer`. This is enforced globally in `apps/web/src/index.css` via a base layer rule. Do not override it.
- Every cancel action (cancel reservation, cancel invitation, etc.) must show an explicit confirmation question (e.g. "Are you sure you want to cancel this reservation?") with yes/no choice before the destructive mutation runs. The confirmation may be a dialog or an inline confirm step, but the question text and the two distinct yes/no actions must be present.

## Working Rules

- Before making changes, check the current implementation first. If the request conflicts with what's already there, stop and ask questions: explain what the conflict is and ask how to proceed instead of guessing.
