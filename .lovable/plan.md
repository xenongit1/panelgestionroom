

## Plan: Dashboard Operativo Real (Revisado)

### Summary

Four functional additions: slot blocking, monthly analytics, next-session widget, and occupation calendar. One DB migration, edge function updates, and new UI components.

---

### 1. Database Migration

Add `notes` text column to `reservas` — general-purpose internal comments, usable on any reservation type:

```sql
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS notes text;
```

No other schema changes. `status = 'bloqueado'` uses the existing text column.

---

### 2. Blockout Model ("Cerrar Hora")

- A blocked slot = a reserva with `status = 'bloqueado'`.
- `client_name` is set to a default like `'Bloqueado'` for display only — **all logic checks `status` only**, never `client_name`.
- The UI renders blocked slots with a distinct badge/style based on `status === 'bloqueado'`.

**Duplicate prevention in `block-slot` action** (panel-crud):
Before inserting, query `reservas` for any existing row matching `sala_id + date + time` where `status != 'cancelada'`. If found, return `{ error: "slot_occupied" }` with 409 status. No duplicates, no blocking over real reservations.

**panel-crud changes**:
- New action `"block-slot"`: requires `sala_id`, `date`, `time`. Validates no conflict, then inserts with `status: 'bloqueado'`, `client_name: 'Bloqueado'`, `players: 0`.
- Add `"bloqueado"` to allowed status list in `create-reserva` and `update-reserva`.

---

### 3. Edge Function: `dashboard-data` Expansion

Add three new data blocks to the response:

- **monthlyStats**: Count reservas this month (excluding `cancelada` and `bloqueado`):
  - `totalGroups`: count
  - `estimatedRevenue`: `sum(players) * 20` — hardcoded provisional price, clearly commented
  - `occupationEstimate`: `(reservas count) / (active rooms * days in month)` as percentage — **labeled "estimada" in the response** so the UI can mark it as provisional

- **nextSession**: First reserva today where `time >= now` and `status NOT IN ('cancelada', 'bloqueado')`, with sala name and notes field

- **weeklyOccupation**: For each of the next 14 days, `{ date, count, capacity }` where capacity = active rooms count

---

### 4. New Frontend Components

| Component | Description |
|---|---|
| `src/components/dashboard/MonthlyKPIs.tsx` | Three cards: estimated revenue (with "Estimado" label), groups this month, occupation % (with "Estimada" badge). Premium card style. |
| `src/components/dashboard/NextSessionWidget.tsx` | Live countdown "Próximo grupo en HH:MM", client name, room, notes. Empty state when no sessions pending. |
| `src/components/dashboard/OccupationCalendar.tsx` | 7-column grid, 2 weeks. Color dots: green (>70%), yellow (30-70%), gray (<30%). |
| `src/components/dashboard/BlockSlotDialog.tsx` | Dialog with sala selector + time picker. Date defaults to today. Calls `block-slot`. Shows error on conflict (409). |

---

### 5. Updated Files Summary

| File | Change |
|---|---|
| DB migration | Add `notes` column to `reservas` |
| `supabase/functions/dashboard-data/index.ts` | Add monthlyStats, nextSession, weeklyOccupation |
| `supabase/functions/panel-crud/index.ts` | Add `block-slot` with conflict check, expand status whitelist |
| `src/types/dashboard.ts` | Add MonthlyStats, NextSession, WeeklyDay types |
| `src/pages/Index.tsx` | Compose new widgets into layout |
| `src/components/RightSidebar.tsx` | Add NextSessionWidget |
| 4 new component files | As listed above |

---

### What stays provisional (clearly marked)

- **Revenue**: `players * 20€` hardcoded. Needs real pricing later.
- **Occupation rate**: simplified formula, labeled "Estimada" in UI and API response. Needs real time-slot capacity model.
- **Countdown**: client-side, browser timezone.

### What does NOT change

Auth, session, sidebar nav, Game Masters, Salas, Reservas pages, Activate/Login pages.

