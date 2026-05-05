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
- Read `README.md` (the English version, root of the repo) at the start of every prompt. It is the canonical living documentation of the project's features and behavior. Use it to understand what already exists before proposing or making changes. Do not read `README.sr.md` for context — the Serbian copy is a translation only and may briefly lag behind during an in-progress edit.
- After making any change that adds, removes, or alters a feature, business rule, or configurable behavior, update **both** `README.md` (English) and `README.sr.md` (Serbian Latin) in the same change. The two files must always describe the same behavior; never update only one. Keep the language plain and readable — describe the user-facing flow first, then a short technical outline. No code snippets in either README. If a change is purely internal refactoring with no behavioral effect, no README update is needed.
- After every code change in `apps/web` or `apps/api`, before reporting the task as done, run the appropriate checks for the files you touched and fix anything they surface (or call it out explicitly if it is pre-existing and unrelated):
  - For `apps/web`: `pnpm --filter web tsc --noEmit` for type errors, then `pnpm --filter web lint` for ESLint errors.
  - For `apps/api`: `pnpm --filter api tsc --noEmit` for type errors, then `pnpm --filter api lint` for ESLint errors.
  - When a change spans both apps, run both. Treat warnings about React hooks (e.g. cascading-render `useEffect` flags), unused imports/vars, and type errors as blockers — fix them in the same change rather than leaving them for later. Style-only "canonical class" suggestions and cSpell dictionary noise can be ignored.
