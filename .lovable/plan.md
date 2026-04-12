

## Plan: Reservas Operativas (Revisado)

### 1. Database Migration

Add `client_email` (text, nullable) and `client_phone` (text, nullable) to `reservas`.

```sql
ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS client_email text,
  ADD COLUMN IF NOT EXISTS client_phone text;
```

### 2. Backend: `panel-crud` Updates

- **`get-reserva`**: Fetch single reserva by ID with sala/game_master joins. **Validates `profile_id = verified`** — returns 403 if the reserva doesn't belong to the current profile.
- **`create-reserva`** / **`update-reserva`**: Handle `client_email`, `client_phone`, and `notes` fields (sanitized, max 150 chars for contact, 500 for notes).
- **`update-reserva`**: Status change to `cancelada` is the primary way to "cancel" a reservation. History is preserved.
- **`delete-reserva`**: Remains available but is NOT surfaced as a primary action in the UI.

### 3. Types: `Reserva` Update

Add `client_email?: string | null` and `client_phone?: string | null` to the `Reserva` interface.

### 4. New Route & Detail Page: `/reservas/:id`

Full page using `DashboardLayout`. Sections:
- **Header**: client name, status badge, back button
- **Info grid**: sala, date, time, players, game master, email, phone
- **Quick actions bar**: WhatsApp / Call / Email buttons — disabled if data missing
- **Internal notes**: editable textarea with save button, labeled "Nota interna del staff"
- **Actions footer**: "Cancelar reserva" (sets status to `cancelada`, with confirmation) as the primary destructive action. "Eliminar permanentemente" exists as a secondary, less prominent link/text button — clearly separated and with a double confirmation.

### 5. Updated `ReservasPage` List

**Desktop**: Each row shows quick action icons (WhatsApp, Call, Email, Eye for detail, Edit). No row-level click handler — actions are explicit via icon buttons.

**Mobile**: Each reservation renders as a card. No mixed tap targets. A clear "Ver detalle" button navigates to the detail page. Quick action icons (WhatsApp, Call) appear as separate, well-spaced icon buttons below the card info. No full-card tap behavior.

Additional:
- Add `client_email` and `client_phone` fields to create/edit dialogs
- Add `notes` field to create/edit dialogs
- Add `bloqueado` to filter tabs and badge styles
- "Cancelar" action available inline (icon or menu) — sets status, doesn't delete

### 6. Files Changed

| File | Change |
|---|---|
| DB migration | Add `client_email`, `client_phone` columns |
| `supabase/functions/panel-crud/index.ts` | Add `get-reserva` (with ownership check), handle new fields |
| `src/types/dashboard.ts` | Extend `Reserva` interface |
| `src/App.tsx` | Add `/reservas/:id` route |
| `src/pages/ReservasPage.tsx` | Explicit action buttons, mobile cards, new form fields |
| `src/pages/ReservaDetailPage.tsx` | NEW — full detail page with notes editing |

### What stays for next phase
- Foto Finish / image upload
- Automatizaciones
- Detail page layout is ready to host future sections below notes

