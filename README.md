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

## Venue minimum guest age

### What it does

A venue can declare a minimum age for guests. When that limit is set, every reservation at that venue must carry the age of every guest, and each age must meet the limit. This lets venues like bars and clubs enforce age policies through the booking flow instead of catching mismatches at the door.

### How it appears in the venue forms

Both the super admin's venue create/edit form and the manager's "my venue" editor expose a single optional **minimum guest age** field. The field accepts a whole number between 1 and 120, or it can be left empty. Empty means the venue has no age limit and no age inputs will appear in its booking flow.

### How it appears in the booking form

The public booking form watches two things: the venue's minimum guest age and the number of guests selected for the reservation. If the venue has no minimum, nothing changes — the form looks exactly as before, no age inputs, no age payload. If the venue has a minimum, an "ages" block appears with one numeric input per guest. Changing the number of guests adds or removes inputs to match. Each input is labeled and shows the venue's minimum in the section header so the guest knows the rule before typing.

Each age input is a numeric input constrained to the range 0–100 by the input itself, so out-of-range typing is prevented at the browser level without an explicit error message. The only message the form shows is for the venue policy: an age below the venue's minimum is highlighted with a red border and a per-input message that includes the actual minimum, so the guest understands what value would be accepted. Empty inputs are required before submit. The submit button is enabled only when every input is valid; submitting with any invalid input is blocked.

When the form is submitted, the ages array is sent alongside the rest of the reservation payload. When the venue has no limit, no ages are sent.

### Server-side enforcement

The frontend validation is for UX. The backend repeats the same checks before persisting any reservation, both in the guest-side and manager-created reservation paths. If the venue has a minimum age set, the API requires the ages array to be present, to match the number of guests in length, and to have every entry at or above the minimum. Any failure returns a localized 400 with a message that names the actual minimum, so anyone hitting the API directly gets the same protection as the form does.

### Implementation outline

The venue entity gains a single nullable integer column for the minimum age. Both venue write paths (admin create/update and manager update) accept the field and persist it. The public venue response includes it so the booking form can read it without an extra request. The reservation entity gains a nullable array column for the ages, stored only when the venue had a limit at booking time. The reservations service has a small helper that loads the venue, decides whether ages are required, and either validates or returns null. Both reservation create endpoints call the same helper, so manager-created reservations are held to the same rule as guest-submitted ones. Error messages live in the API i18n files in Serbian and English with the minimum interpolated, so the message stays accurate when the venue's limit changes.
