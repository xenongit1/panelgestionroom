

## Plan: Convert static panel to functional CRUD dashboard

This is a large scope request. I'll break it into manageable phases covering all 5 areas.

---

### 1. Sidebar cleanup — Show username, remove sensitive data

**File: `src/components/LeftSidebar.tsx`**
- Remove the access key display section (Eye/Copy buttons, blurred code)
- Remove email display
- Show `username` from `gr_session` (parsed from localStorage) instead
- Change "Gestionar Suscripción" button to link to `https://gestionroom.com/precios` (external)

**File: `src/pages/Index.tsx`**
- Parse `gr_session` to extract `username` and pass it to LeftSidebar
- Update `LeftSidebar` props to accept `username` instead of full `Profile`

---

### 2. New routes & pages — CRUD for Salas, Reservas, Game Masters, Ajustes

**File: `src/App.tsx`** — Add routes: `/salas`, `/reservas`, `/game-masters`, `/ajustes`

**New Edge Function: `supabase/functions/panel-crud/index.ts`**
- Single function handling all CRUD operations via `action` parameter
- Every request requires `accessKey` — validated against `profiles` with active plan
- Actions: `list-salas`, `create-sala`, `update-sala`, `delete-sala`, `list-reservas`, `create-reserva`, `update-reserva`, `delete-reserva`, `list-game-masters`, `create-game-master`, `update-game-master`, `delete-game-master`
- All queries filter by `profile_id` derived from the validated `access_key`

**New pages:**

- **`src/pages/SalasPage.tsx`** — Table listing rooms from `salas` table + create/edit dialog (name, theme, difficulty, capacity, active toggle) + delete confirmation
- **`src/pages/ReservasPage.tsx`** — Table listing reservations from `reservas` table with filters + create/edit dialog (client_name, sala_id selector, date, time, game_master_id selector, players, status) + delete
- **`src/pages/GameMastersPage.tsx`** — Simple list/table from `game_masters` table + add/edit dialog (name, available toggle) + delete
- **`src/pages/AjustesPage.tsx`** — Two sections:
  - Change password form (current password, new password, confirm) → calls `panel-auth` with new `change_password` action
  - Update company name form → calls `panel-crud` with `update-profile` action

**New action in `panel-auth`: `change_password`**
- Receives `accessKey`, `username`, `currentPassword`, `newPassword`
- Validates access key, verifies current password with bcrypt, updates `password_hash`

Each page reuses the same layout shell (LeftSidebar + TopBar) via a shared layout wrapper.

---

### 3. Dashboard KPIs — Real counts

**File: `supabase/functions/dashboard-data/index.ts`**
- Fix `totalReservations` to count ALL reservas (currently limited to 10 by the query limit)
- Add a separate count query: `supabase.from("reservas").select("*", { count: "exact", head: true }).eq("profile_id", profileId)`

**File: `src/components/KPICards.tsx`** — No changes needed, already displays dynamic data

---

### 4. Security hardening

**Session validation in `src/pages/Index.tsx`:**
- On load, parse `gr_session` → extract `profile_id` and `access_key`
- Call `validate-access-key` to verify the session is still valid before rendering dashboard
- If invalid, clear localStorage and redirect to `/activate`

**Edge function `panel-crud`:**
- Every request derives `profile_id` from the server-validated `access_key` — never trusts client-sent `profile_id`
- All DB queries use the server-derived `profile_id`

**Registration protection:** Already implemented in previous iterations.

---

### 5. Shared layout wrapper

**New file: `src/components/DashboardLayout.tsx`**
- Wraps LeftSidebar + TopBar + main content area + RightSidebar (optional)
- Handles session check, profile loading, and logout
- Used by Index, SalasPage, ReservasPage, GameMastersPage, AjustesPage

---

### Database changes

**Migration needed:** Add a count query approach — no schema changes required. The existing `salas`, `game_masters`, and `reservas` tables already have the needed columns.

**`supabase/config.toml`:** Add `[functions.panel-crud]` with `verify_jwt = false`

---

### Files summary

| Action | File |
|--------|------|
| Create | `supabase/functions/panel-crud/index.ts` |
| Create | `src/components/DashboardLayout.tsx` |
| Create | `src/pages/SalasPage.tsx` |
| Create | `src/pages/ReservasPage.tsx` |
| Create | `src/pages/GameMastersPage.tsx` |
| Create | `src/pages/AjustesPage.tsx` |
| Modify | `src/App.tsx` — add 4 routes |
| Modify | `src/components/LeftSidebar.tsx` — remove key/email, show username |
| Modify | `src/pages/Index.tsx` — use DashboardLayout |
| Modify | `supabase/functions/dashboard-data/index.ts` — fix total count |
| Modify | `supabase/functions/panel-auth/index.ts` — add `change_password` action |
| Modify | `supabase/config.toml` — add panel-crud function |

