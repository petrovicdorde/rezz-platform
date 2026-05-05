# rezz-platform

A reservation platform for venues and events.

This file is the living documentation of the project. Every notable feature, business rule, or configurable behavior is described here in plain language so that anyone — engineer, product, or client — can understand what the system does without reading source code. When a feature is added or changed, this file must be updated in the same change so it never drifts from reality.

## Repository layout

- `apps/api` — NestJS backend.
- `apps/web` — React + Vite frontend.
- `packages/shared` — Shared TypeScript types.

## Common commands

- `pnpm dev` — Start all apps in development mode.
- `pnpm build` — Build all apps.
- `cd apps/api && pnpm seed` — Seed the database.

---

# Roles

The system has four roles. Each user has exactly one. Permissions below describe what the role can do; anything not listed is forbidden.

## Super admin

The platform owner. Has full access to every part of the system.

- **Venue management** — create, edit, activate or deactivate, and delete venues.
- **Venue invitations** — invite a manager or worker to a venue by email.
- **User management** — list and search all users, view details, change a guest's name or role, activate or deactivate accounts, blacklist or unblacklist guests with a reason, and delete accounts.
- **Settings** — manage configurable enums such as table types and any other admin-tunable lookups.
- **Landing page** — read and update the public landing page configuration.
- **All manager-level powers** — can also do everything a manager can do at any venue.

## Manager

Operates a single venue they own.

- **My venue** — view and edit their own venue's profile, working hours, payment methods, and table layout. (Gallery management is not yet implemented; the section currently shows a "coming soon" placeholder.)
- **Employees** — invite workers to their venue, change a worker's role, and remove employees.
- **Events** — create, edit, and delete events for their venue, plus add or remove event promotion images.
- **Reservations** — see the full reservation list for their venue, view a reservation in detail, confirm or reject pending reservations, record arrival or no-show, cancel reservations, and rate guests after a completed reservation.
- **Notifications** — receive and read notifications for new and updated reservations.
- **Guest insight** — view a guest's score and recent no-show count from any reservation in their venue.

## Worker

Floor staff at a single venue. The worker's allowed actions are intentionally narrow: rate a guest and record whether the guest arrived or did not show up. Nothing else.

- **Arrival recording** — mark a confirmed reservation as completed (guest arrived) or no-show. The no-show outcome is the action that feeds the auto-blacklist counter.
- **Guest rating** — rate a guest with stars and an optional note after a reservation has been marked completed. Existing ratings can also be edited.
- Workers do not see notifications, do not see any guest insight (no-show count, guest score), do not see the reservation list, do not confirm or reject pending reservations, and do not manage events, employees, settings, or the venue profile.

The dedicated worker UI surface that lets workers find and act on the reservations they are responsible for is not yet built. For now, the only worker-accessible page in the dashboard is their own profile. The arrival-recording and rating endpoints are available to the worker role on the API side and ready to be wired up when the worker UI is designed.

## Guest

A regular user of the public app. Can hold accounts and make reservations.

- **Browse** — view venues and events on public pages without logging in.
- **Reserve** — request a reservation at a venue or for an event when logged in. Subject to the blacklist rules described in the Blacklist feature below.
- **Profile** — view and edit their own profile, see their upcoming reservations and reservation history, cancel a reservation while it is still pending or confirmed.
- Guests do not see any dashboard, venue management, or other-user data.

---

# Features

## Blacklist

### What it does

The blacklist prevents repeat no-show guests from making new reservations. A guest who fails to show up too often within a recent time window is automatically blocked from booking. After a configurable cooldown period the block expires by itself, and at any point a super admin can block or unblock a guest manually with a written reason.

### How a guest gets blocked, blocked, and eventually unblocked

A guest books normally through the public venue or event page. There is no blacklist interaction during booking unless the guest is already blocked.

When a reservation date passes, venue staff record the outcome — either the guest arrived or did not show up. The no-show outcome is the only signal the auto-blacklist watches.

Whenever staff mark a reservation as a no-show, the system counts how many no-show reservations the same guest has accumulated in the configured rolling window (default: the last 30 days). If the count reaches the configured threshold (default: 3), the guest is flagged as blacklisted on the spot, with a timestamp, and a localized auto-generated reason is written to their account. The reason text includes the threshold and window in words, so it stays accurate when the policy is tuned later. If the guest is already blacklisted, no second flag is written — the existing block stands.

When a blocked guest tries to reserve again, the system checks whether their block has expired. The expiry is computed as the block timestamp plus the configured block duration (default: 1 day). If the cooldown is over, the block is cleared at that moment and the reservation proceeds normally. If the cooldown has not elapsed, the request is rejected and the guest sees a localized "your account is blocked" message.

A blocked guest sees a red banner instead of the booking form on the venue detail, event detail, and profile pages. The banner explains the situation, optionally shows the recorded reason, and offers a `mailto:` link to support so the guest can appeal. The banner is shown only while the block is actually in effect — if the cooldown has technically expired but the persisted auth state is stale, the form is shown instead of a misleading banner.

The block is also cleared opportunistically whenever the user's session is refreshed: the `/auth/me` endpoint applies the same expiry rule and quietly clears the columns when the cooldown is over. There is no scheduled job — cleanup happens wherever the user passes through the system.

### Manual override by super admin

Independent of the automatic flow, a super admin can blacklist or unblacklist any guest from the admin user detail drawer. Blacklisting requires a yes/no confirmation step and optionally a written reason. Unblacklisting requires the same confirmation step. Both actions use the same database fields as the automatic flow, so a manually-set block expires by the same rules unless the admin clears it sooner.

### What venue staff see

When staff open a reservation in the dashboard drawer, the system shows how many no-shows that guest has accumulated within the configured window. If the count is non-zero, a small badge appears next to the guest's name — amber when below the threshold, red when at or above. The badge label and tooltip read the window length from the API response, so the UI stays in sync if the policy is changed without any frontend redeployment.

### Configurability

All three policy numbers live in environment variables read once at boot:

- `BLACKLIST_NO_SHOW_THRESHOLD` — how many no-shows trigger a block (default 3).
- `BLACKLIST_NO_SHOW_WINDOW_DAYS` — the rolling window in days used when counting no-shows (default 30).
- `BLACKLIST_BLOCK_DAYS` — how long a block lasts before it expires automatically (default 1).

Invalid or missing values fall back to the defaults rather than crashing the boot.

### Implementation outline

The three policy numbers are wrapped by a small injectable provider that exposes typed accessors and helpers like "is this expired?" and "when does this expire?". The provider is registered as a global module so any service can inject it without explicit imports.

There are exactly three places in the API that touch blacklist state. Reservation creation checks whether the current user is blacklisted, lazy-clears the row if the block is past its expiry, and otherwise rejects the request. Arrival recording counts recent no-shows within the configured window, compares against the threshold, and sets the blacklist columns when both conditions trigger. Current-user resolution at `/auth/me` runs the same lazy-clear pass so the next session refresh after expiry returns a clean state.

The user record stores three columns: a boolean flag, a timestamp, and a reason string. There is no separate "expires at" column — the expiry is always derived at read time from the timestamp plus the configured block duration. This means changing the cooldown in environment retroactively shortens or lengthens existing blocks, which is the intended behavior when tightening the policy later. The auto-generated reason text is produced through the i18n service in Serbian and English, with the threshold and window passed as interpolation arguments, so the reason for the next auto-block always reflects current policy.

A dedicated endpoint on the reservations controller returns the recent-no-show count alongside the window length used to compute it. The web side queries this when opening the reservation detail drawer. Returning the window length with the count is what allows the badge label to stay dynamic rather than hardcoding numbers in translation files.

On the web side, the auth response includes the three blacklist-relevant fields plus a derived expiry timestamp. The auth store persists them across reloads. A single helper, `isUserCurrentlyBlocked`, answers "is this user currently blocked, taking expiry into account?" and is the source of truth for whether the booking form or the banner is shown. This keeps the three banner sites consistent.

Manual block and unblock are handled by a pre-existing super-admin endpoint on the users-admin module. Setting blacklisted to true sets the timestamp and reason; setting it to false clears all three columns. The admin user detail drawer in the dashboard exposes both actions behind a yes/no confirmation step, in line with the project's confirmation rule for destructive actions.

### Tightening the policy later

To make the blacklist stricter, change the three environment variables and redeploy the API. No database migration, no code change, no frontend release. The auto-generated reason text, the staff badge label, and the booking-form gate will all reflect the new numbers as soon as the API restarts. Existing rows are not rewritten — but their effective expiry is recomputed from the stored timestamp plus the new block duration on the next read.

If the policy needs to become editable by admins from inside the app rather than through environment variables, the natural next step is to migrate these three values into the existing settings table that already powers other admin-tunable lookups. Everything downstream — enforcement, stats, banner — would stay unchanged.

## Guest ages on every reservation

### What it does

Every reservation must carry the age of every guest in the booking. This is collected up-front in the booking flow and stored on the reservation, regardless of which venue the booking is at. The data is intended to power age-related analytics for the super admin (age distribution of bookings, average booker age per venue, etc.) and to feed the venue-level age-policy check described below.

A venue can additionally declare a **minimum guest age**. When set, every age entered for a reservation at that venue must meet or exceed the limit, on top of being collected. This lets venues like bars and clubs enforce age policies through the booking flow instead of catching mismatches at the door. When unset, ages are still collected and stored; there is just no per-age lower-bound check.

### How it appears in the venue forms

Both the super admin's venue create/edit form and the manager's "my venue" editor expose a single optional **minimum guest age** field. The field accepts a whole number between 1 and 120, or it can be left empty. Empty means the venue has no age limit — ages are still required from the booker, but only the upper sanity bound (0–120) applies.

### How it appears in the booking form

The public booking form always shows an "ages" block with one numeric input per guest. Changing the number of guests adds or removes inputs to match. The block heading and helper text adapt to the venue's policy: when the venue has set a minimum age, the heading reads "Guest ages (minimum age: N)" and a helper line explains that every guest must be at least N years old; when there is no minimum, the heading reads "Guest ages" and the helper just asks for each guest's age.

Each age input is a numeric input constrained to the range 0–120 by the input itself, so out-of-range typing is prevented at the browser level without an explicit error message. Empty inputs are required before submit. When the venue has a minimum, an age below the venue's limit is highlighted with a red border and a per-input message that includes the actual minimum, so the guest understands what value would be accepted. The submit handler refuses to dispatch the request unless every input is filled.

The same ages block is also part of the manager-side "create reservation" form in the dashboard. The manager-side form pulls the venue's minimum from `useMyVenue` so the policy check applies identically there.

When the form is submitted, the ages array is sent alongside the rest of the reservation payload — always, on every booking.

### Server-side enforcement

The frontend validation is for UX. The backend repeats the same checks before persisting any reservation, both in the guest-side and manager-created reservation paths. The API requires the `guestAges` array to be present, to match the number of guests in length, and to have each value within the 0–120 range. If the venue also has a minimum age set, every entry must additionally be at or above that minimum. Any failure returns a localized 400; the minimum-age message names the actual minimum, so anyone hitting the API directly gets the same protection as the form does.

### Implementation outline

The venue entity has a single nullable integer column for the optional minimum age, surfaced through both the admin and manager venue write paths and included on the public venue response so the booking form can read it without an extra request. The reservation entity has a nullable array column for the ages. With ages now required on every booking, the column will always be populated for new reservations; older reservations created before this change may still be `null`, so any analytics query needs to handle that.

Both reservation create DTOs (`CreateGuestReservationDto` and `CreateReservationDto`) declare `guestAges` as a required array of integers between 0 and 120, sized between 1 and 50. The reservations service has a small `validateGuestAges` helper that asserts presence, length match against `numberOfGuests`, and — when the venue has set a minimum — that no entry is below it. Both reservation create endpoints call the same helper, so manager-created reservations are held to the same rule as guest-submitted ones. Error messages live in the API i18n files in Serbian and English; the "ages required" message is venue-agnostic, while the "below minimum" message interpolates the actual minimum so the text stays accurate when the venue's limit changes.

## Guest reservation emails

### What it does

Whenever a venue confirms or rejects a guest's reservation, the guest gets an automatic email about the outcome. This is the only way a guest finds out the result of a reservation outside of opening the app, so it is a hard requirement, not a nice-to-have.

### When the emails are sent

- **Confirmation email** — sent the moment a manager or super admin confirms a pending reservation. The email tells the guest the reservation is confirmed at the named venue for the chosen date and time, and reminds them to contact the venue directly or use their profile if they need to change anything.
- **Rejection email** — sent when a manager or super admin rejects a pending reservation. The email tells the guest the reservation was not accepted at the named venue for the chosen date and time. If the staff included a written reason when rejecting, the reason is shown to the guest in a highlighted block.

A separate cancellation email already existed and continues to work the same way; this feature only adds the confirm and reject paths.

### Who receives them

Emails are sent only to guests who reserved while logged in (the reservation is linked to a user account with an email). Manager-created reservations made on behalf of someone who has no Table.ba account get no email, because there is no email address attached to the reservation.

### Reliability

If the email provider is unavailable or the call fails, the reservation status change still succeeds and the failure is logged. The mailer never blocks the operation. The text is localized in Serbian and English using the same i18n flow that powers the existing cancellation, invitation, and verification emails.

### Implementation outline

The email service exposes two new methods that mirror the existing cancellation-email shape: one for confirmation and one for rejection. Each loads its subject, body, and footer from the API i18n files with the venue name, date, and time interpolated; the rejection email also conditionally renders a highlighted "reason" block when the staff supplied one. Both methods catch and log Resend errors instead of throwing.

The reservations service has a small private helper that runs after a successful confirm or reject save. It checks whether the reservation is linked to a guest user, fetches that user, fetches the venue for its name, and dispatches the appropriate email. Nothing in the helper can prevent the status change — it is wrapped in a silent try/catch — so an email outage cannot block a manager from running their venue.

## Manager pending-reservation reminders (cron)

### What it does

Every three hours an automated job checks every active manager and emails them a reminder if there are new pending reservations they have not yet acted on. If a manager has nothing new waiting, no email is sent — silence is the signal that they are caught up. The job is the safety net for managers who don't keep the dashboard open: they will never go more than three hours without being told they have work to do.

### What "new" means

A reservation counts as new for a manager only if it was created after the last reminder that manager received. The first reminder ever sent to a manager covers all of their currently pending reservations; later reminders cover only the ones that arrived since the previous reminder. This way a manager who ignores a single pending reservation does not get pinged about it every three hours forever — once they've been told about it, they own it.

### Who is included

The job iterates active manager accounts that are attached to an active venue. Workers, super admins, guests, deactivated managers, and managers without a venue are skipped. The summary returned by the endpoint reports total managers considered, how many were emailed, and how many were skipped (no email, no venue, no new pending, or an error during processing).

### Reliability

Each manager is processed independently inside a try/catch. A failure on one manager — bad email, transient mail-provider error, missing venue — is logged and counted as a skip; it never aborts the run for the others. The user's `lastReservationReminderAt` is updated only after a successful email send, so a transient mailer outage means the manager will be retried in the next run rather than silently lost.

### Endpoint

The job lives at `POST /cron/reservation-reminders`. The endpoint is **not** protected by the regular JWT auth — it is protected by a single shared-secret guard that requires the `Authorization: Bearer ${CRON_SECRET}` header. Without the right secret the endpoint returns 401. With no `CRON_SECRET` env var set at all, the endpoint refuses every request, so a forgotten configuration cannot accidentally expose it.

### Vercel setup

Cron is configured declaratively in `vercel.json` under a top-level `crons` array. The schedule is standard cron syntax — `0 */3 * * *` means "minute 0 of every third hour" (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00 UTC).

To make this work after deploy, the project owner must perform two one-time steps in the Vercel dashboard for this project:

1. **Add a `CRON_SECRET` environment variable** on the Production (and Preview, if cron should run there) environments. Generate a random value — for example with `openssl rand -hex 32` — and paste it into the Vercel "Environment Variables" panel for the API project. The same value must be present in `apps/api/.env` for local testing.
2. **Verify the cron is registered** under "Settings → Cron Jobs" in the Vercel dashboard after the next deploy. Vercel reads the `crons` block from `vercel.json` automatically; the dashboard should show one entry pointing at `/cron/reservation-reminders` with a 3-hour schedule. If the entry does not appear, redeploy.

Vercel automatically attaches the `Authorization: Bearer ${CRON_SECRET}` header when it triggers the job, so the guard sees the right secret without any client code. To test the endpoint manually from your machine, run `curl -X POST -H "Authorization: Bearer <secret>" https://<your-api-domain>/cron/reservation-reminders`.

If the schedule needs to change, edit the `schedule` value in `vercel.json` and redeploy. To pause the job, remove the entry from `crons` and redeploy.

### Implementation outline

A new `CronModule` exposes a single endpoint guarded by a custom `CronAuthGuard` that compares the bearer token to the `CRON_SECRET` env var. The service loads active managers attached to a venue, runs one count query per manager scoped to the manager's `lastReservationReminderAt`, and dispatches a localized "you have N new reservations" email through the existing email service when the count is non-zero. The user record gains a single nullable timestamp column, `lastReservationReminderAt`, that the service updates on every successful send. The reminder email template follows the same pattern as the project's other transactional emails (verification, invitations, reservation cancellation), with i18n-driven subject, body, button, and footer.

## Venue closed days

### What it does

A venue can mark specific calendar dates as closed days. Closed days are year-agnostic — they are stored as month-and-day pairs, and the same dates apply every year, so a venue that is closed on January 1 stays closed on January 1 in 2026, 2027, and beyond without anyone re-entering the date. The list is optional. Venues with no closed days behave exactly as before.

### How it appears in the venue forms

Both the super admin's venue create/edit form and the manager's "my venue" editor expose a calendar-style picker labeled "Closed days". The picker shows one month at a time with previous/next arrows, the month name, and a grid of days. Clicking a day toggles it red (closed) or back to white (open). Navigating to the next month preserves selections. The year shown in the header is purely for layout context — selections do not depend on it, because the underlying data is the month-and-day pair only. Leaving the picker empty means the venue has no closed days.

### How it appears in the booking form

When a guest opens a venue's booking form and picks a date, the form checks whether that date's month and day match any of the venue's closed days. If so, the venue page still renders normally — the guest can read everything about the venue — but the reservation submit button is disabled and its label changes to "Neradni dan" (in English: "Closed day"). This communicates clearly that the booking is not allowed for the chosen date without hiding the venue from the catalog.

### Server-side enforcement

The frontend gate is for UX. The backend repeats the same check before persisting any reservation. In both the guest-submitted and manager-created reservation paths, the service loads the venue, extracts the month and day of the requested reservation date, and looks for a match in the venue's closed-days array. A match returns a localized 400 with a "venue is closed on this date" message, so anyone calling the API directly gets the same protection as the form does.

### Implementation outline

The venue entity gains a single jsonb column holding an array of `{ month, day }` pairs. Both venue write paths accept the array and run a normalizer in the service: invalid entries are dropped, duplicates are removed, and the result is sorted month-first then day-first so the persisted form is stable. The public venue response includes the array so the booking form has it without an extra request. The booking form computes a single boolean from the selected date plus the venue's array; nothing else in the form changes. The reservations service exposes a small helper that re-runs the same boolean against the stored venue and throws a localized 400 when it matches. Both reservation create endpoints call the helper, so manager-created reservations are held to the same rule as guest-submitted ones. The picker UI is its own component sharing the visual language of the project's existing date picker.

## Forgot password / password reset

### What it does

A guest who can't remember their password can request a reset directly from the login modal: there's a "Forgot your password?" link under the login button that toggles the modal into a single-field email form. Submitting the email sends them a reset link by email. Clicking the link opens a new-password page where they choose a fresh password and are dropped back into the login modal to sign in.

The flow is intentionally enumeration-safe: whether or not an account exists for the entered email, the user sees the same toast ("If an account with that email exists, we've sent a password reset link.") so an attacker can't probe which addresses are registered.

### Login modal: login ↔ forgot toggle

The same modal/drawer that hosts login now has two views — `login` and `forgot` — switched through the login UI store. Clicking "Forgot your password?" inside the login form switches the modal to the forgot-password view; the title, description, fields, and submit button all swap to the forgot-password copy without closing the modal. The forgot view has a single email field, the same orange gradient submit, and a "Back to login" link with a left-arrow that returns to the login view. After a successful submit the modal closes and the user sees the success toast in the corner.

### Reset page

The email contains a link in the form `/auth/reset-password?token=<hex>`. The page renders a small card matching the rest of the auth surface: serif title, two password fields (new password + confirm), an orange gradient submit, and the same eye-toggle on each password input. If the URL has no `token` query param, the page renders a "link is invalid or has expired" notice instead of the form. On successful reset, the user gets a success toast, is navigated to the home page, and the login modal opens automatically so they can sign in with the new password without one extra click.

### Server-side enforcement

The API is unchanged from what was already there: `POST /auth/forgot-password` accepts `{ email }`, generates a one-hour reset token, persists it on the user, and dispatches the email through the existing email service; if the email doesn't match a known user the endpoint still returns the generic success message. `POST /auth/reset-password` accepts `{ token, newPassword }`, validates the token's expiry, hashes the new password with bcrypt, and clears the reset-token columns. Token columns and email template existed before this change; only the web side was missing.

### Implementation outline

A new `useForgotPassword` mutation hook calls `POST /auth/forgot-password` and shows the localized success toast on completion. A new `useResetPassword` mutation hook calls `POST /auth/reset-password`, shows a success toast, navigates to `/`, and opens the login modal — the user lands one click away from signing in. The login UI store grew a `view: 'login' | 'forgot'` field plus `showLogin` / `showForgot` actions; `open()` always resets the view back to `'login'` so reopening the modal is predictable. The new `ForgotPasswordForm` component lives next to the other auth forms and shares the cream-pill input style, orange gradient CTA, and "back" affordance vocabulary used across the auth surface. The new `/auth/reset-password` route reuses the same approach as the manager `/auth/set-password` page (token from query, new-password + confirm form, password-strength rules) but talks to the reset endpoint rather than the set-password endpoint, so the manager invitation flow is untouched. All copy lives in the existing `auth` i18n namespace under `forgot_password_*` and `reset_password_*` keys, in Serbian Latin and English.
