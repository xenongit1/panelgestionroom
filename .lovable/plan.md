

## Plan: Fix Access Key Validation

### Problems Identified

1. **Edge function `validate-access-key`** only accepts `plan_status === "active"` — rejects `pro`, `anual`, etc.
2. **No localStorage persistence** — user must re-enter key on every refresh
3. **White screen** — if edge function returns non-200 or unexpected shape, the catch block sets `accessState` to `"invalid"` but `isValidating` stays true until `finally`, which works. The real issue is likely the edge function rejecting valid keys due to strict `plan_status` check.

### Changes

#### 1. Edge Function `validate-access-key/index.ts`
- Accept `plan_status` values: `'active'`, `'pro'`, `'anual'` as valid
- Treat `'expirado'`, `'impago'`, `null` as expired/denied with message "Tu suscripcion ha expirado..."
- Keep the `subscription_end` date check
- Keep exact match on `access_key` column (already works for any format)

#### 2. `Index.tsx` — localStorage persistence + guard
- On mount: check `localStorage.getItem("gr_access_key")` as fallback if no `?key=` param
- On successful validation: `localStorage.setItem("gr_access_key", key)`
- On invalid key: `localStorage.removeItem("gr_access_key")`
- Initial state: if either URL key or localStorage key exists, set `"loading"`, otherwise `"invalid"`

#### 3. `AccessDenied.tsx` — UI polish
- Button text: "Entrar al Panel" (with loading spinner)
- Add `"expired"` reason message: "Tu suscripcion ha expirado. Por favor, renuevala en gestionroom.com"
- Keep logo large with `GestionRoomLogo variant="dark" size="lg"`

#### 4. No database changes needed
The `profiles` table already has `access_key` and `plan_status` columns.

