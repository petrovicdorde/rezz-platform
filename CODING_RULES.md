# Coding Rules

## General
- All code, variable names, function names, comments, and type names must be in English.
- No hardcoded user-facing strings anywhere in the codebase — all text must come from translation files.
- No `any` types in TypeScript. Ever.
- All functions must have explicit return types.
- Prefer `const` over `let`. Never use `var`.
- No unused imports or variables.

## Frontend (apps/web/)
- Every user-visible string must use `t('key')` from `react-i18next`.
- Toast messages must use translation keys: `toast.success(t('...'))`, `toast.error(t('...'))`.
- Error messages from the API are already translated by the backend — display them directly via `handleApiError()` without wrapping in another translation call.
- Add new translation keys to `src/locales/sr/translation.json` first, then `src/locales/en/translation.json`.
- Never use inline styles — use Tailwind utility classes only.
- Components must be typed — no implicit props.
- One component per file.

## Backend (apps/api/)
- All user-facing error messages and response messages must use `I18nService.t()`.
- Never throw exceptions with hardcoded English strings — always use a translation key.
- DTOs must use `class-validator` decorators on every field.
- Services must not contain HTTP-specific logic (no `@Res()`, no status codes in services).
- Controllers handle HTTP, services handle business logic.

## Git
- Commit messages must be in English.
- Format: `type(scope): description` — e.g. `feat(auth): add login endpoint`
- Types: feat, fix, chore, refactor, docs, style, test
