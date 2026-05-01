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
- Read `README.md` at the start of every prompt. It is the living documentation of the project's features and behavior. Use it to understand what already exists before proposing or making changes.
- After making any change that adds, removes, or alters a feature, business rule, or configurable behavior, update `README.md` in the same change. Keep the language plain and readable — describe the user-facing flow first, then a short technical outline. No code snippets in `README.md`. If a change is purely internal refactoring with no behavioral effect, no `README.md` update is needed.
