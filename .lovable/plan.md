

## Plan: Conectar Dashboard a Supabase con datos reales

### 1. Crear tablas faltantes en Supabase (Migration)

Las tablas `reservas`, `salas` y `game_masters` no existen. Crear:

**`salas`**: id (uuid), name (text), theme (text), difficulty (int), capacity (int), active (boolean), profile_id (uuid FK profiles), created_at
**`game_masters`**: id (uuid), name (text), avatar (text), available (boolean), profile_id (uuid FK profiles), created_at
**`reservas`**: id (uuid), client_name (text), sala_id (uuid FK salas), date (date), time (time), game_master_id (uuid FK game_masters), status (text: confirmada/pendiente/cancelada), players (int), profile_id (uuid FK profiles), created_at

RLS policies: Allow SELECT for anon users (since access is controlled by `?key=` param, not auth). This is a public-facing panel accessed via license key, not user auth.

### 2. Edge Function: `validate-access-key`

Create an edge function that:
- Receives `key` param
- Queries `profiles` where `access_key = key` AND `plan_status = 'active'` AND `subscription_end > now()`
- Returns the profile data if valid, or error reason (invalid/expired/inactive)
- Uses service role key to bypass RLS

### 3. Edge Function: `dashboard-data`

Create an edge function that:
- Receives the `access_key`
- Fetches the profile, then queries `reservas`, `salas`, `game_masters` filtered by `profile_id`
- Returns KPIs (counts), last 10 reservations with joined sala/GM names, today's reservations, room count, GM count
- Single endpoint to avoid multiple client calls

### 4. Update Index.tsx — Access validation flow

- On mount, read `?key=` from URL using `useSearchParams`
- Call `validate-access-key` edge function
- If invalid: show `<AccessDenied>` with appropriate reason
- If valid: store profile in state/context, render dashboard

### 5. Update components to use real data

- **KPICards**: Accept props from parent (reservation count, active rooms, GMs available) instead of mock data
- **ReservationsTable**: Accept reservations array as props, with sala name and GM name already joined
- **RightSidebar**: Accept today's reservations as props
- **TopBar**: Accept profile data (owner_name/company_name) as props
- **LeftSidebar**: Accept profile data, show real access_key with blur/reveal/copy

### 6. Remove mock data dependency

Delete or deprecate `src/data/mockData.ts` — all components will receive real data from Supabase via the edge function.

### 7. Insert seed data

After tables are created, insert sample data for the user's profile so the dashboard has something to display immediately.

### Technical Notes

- The `?key=` access pattern means no Supabase Auth is needed — the edge functions use the service role key to query profiles
- RLS on new tables will allow anon SELECT since the edge function handles authorization
- The edge function approach keeps the service role key server-side (secure)

