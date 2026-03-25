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
