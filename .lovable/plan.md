

## Plan: Refactor Activation & Access Flow (with adjustments)

### Summary

Single-use key activation, session based on `profile_id`/`panel_user_id`, "remember me" on login, and clear error differentiation. Key only marked used after confirmed owner creation. All session logic isolated in `src/lib/session.ts` for future replacement.

---

### User adjustments applied

1. **Frontend guards empty key** — `ActivatePage` shows inline error and never calls `validate-access-key` if input is empty.
2. **Backend differentiates errors** — `validate-access-key` returns distinct `reason` values: `"missing_key"` (empty/missing), `"invalid"` (not found), `"expired"` (plan expired), `"already_used"` (key consumed).
3. **Key invalidation only on full success** — `panel-auth` register sets `key_used = true` only AFTER panel_user insert + profile update both succeed. If either fails, key stays active.
4. **Session logic isolated** — New `src/lib/session.ts` module with `saveSession`, `getSession`, `clearSession`, `getProfileId`. Designed as a provisional adapter that can be swapped later without touching page components.

---

### 1. Database Migration

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS key_used boolean DEFAULT false;
```

---

### 2. `validate-access-key` changes

- If `key` is missing/empty → `{ valid: false, reason: "missing_key" }` (200)
- If no profile found → `{ valid: false, reason: "invalid" }` (200)
- If `plan_status` invalid or expired → `{ valid: false, reason: "expired" }` (200)
- If `key_used = true` AND owner exists → `{ valid: true, has_owner: true, key_used: true }` — tells frontend to redirect to login
- If `key_used = false` and no owner → `{ valid: true, profile, has_owner: false }` — proceed to register

---

### 3. `panel-auth` changes

**Register action:**
- Accept new fields: `company_name`, `company_email`, `company_phone`, `country`, `city`
- Sequence: (1) insert panel_user → (2) update profile with business data + `key_used = true` → (3) return session
- If step 1 fails → return error, key stays active
- If step 2 fails → delete the panel_user just created, return error, key stays active
- Response includes `profile_id` in session (no `access_key`)

**Login action:**
- Return `profile_id` in session, stop returning `access_key`

**Change password:**
- Accept `profileId` instead of `accessKey`

**New `validate_session` action:**
- Accept `{ profile_id, panel_user_id }`
- Verify panel_user exists for that profile
- Return profile data — replaces the `validate-access-key` call in DashboardLayout

---

### 4. `panel-crud` changes

- Accept `profileId` in body instead of `accessKey`
- `getProfileId()` → simply verify profile exists with valid plan using the provided `profileId`

### 5. `dashboard-data` changes

- Accept `profileId` instead of `key`
- Same lookup pattern as panel-crud

---

### 6. New file: `src/lib/session.ts`

```typescript
// Provisional session adapter — replace internals later without changing API
export function saveSession(data: SessionData, remember: boolean)
export function getSession(): SessionData | null
export function clearSession(): void
export function getProfileId(): string | null
```

- `remember = true` → `localStorage`
- `remember = false` → `sessionStorage`
- `getSession()` checks both storages, prioritizes localStorage

---

### 7. `src/pages/ActivatePage.tsx`

- **Empty key guard**: if input empty on submit, show "Introduce tu clave de acceso" error inline, do NOT call backend
- Remove `localStorage.setItem("gr_access_key", ...)`
- Add business fields to register step: `company_name`, `company_email`, `company_phone`, `country`, `city`
- On success: `saveSession(data.session, true)`, redirect to `/`
- If `key_used === true` from validation → show "has_owner" step
- Same visual style (dark glassmorphism card, monochrome)

### 8. `src/pages/LoginPage.tsx`

- Add `Checkbox` "Mantener sesión iniciada"
- Remove `localStorage.setItem("gr_access_key", ...)`
- On success: `saveSession(data.session, remember)`
- Same visual style

### 9. `src/components/DashboardLayout.tsx`

- Use `getSession()` from session utility
- Call `panel-auth` → `validate_session` with `{ profile_id, panel_user_id }` instead of `validate-access-key`
- If no session → redirect to `/login`
- Remove `accessKey` from children props → children receive `{ profile, session }` only
- Remove all `gr_access_key` references

### 10. `src/lib/api.ts`

- `panelCrud(action, extra)` — auto-reads `profileId` via `getProfileId()`, no more `accessKey` parameter

### 11. All page components

Files: `Index.tsx`, `SalasPage.tsx`, `ReservasPage.tsx`, `GameMastersPage.tsx`, `AjustesPage.tsx`

- Remove `accessKey` from destructured props
- `panelCrud(action, extra)` works without accessKey
- `AjustesPage` change password uses `profileId`
- `Index.tsx` RightSidebarWrapper uses `getProfileId()` for dashboard-data

---

### Files summary

| File | Change |
|------|--------|
| **Migration** | Add `key_used` boolean to profiles |
| `validate-access-key/index.ts` | Differentiated error reasons, check `key_used` |
| `panel-auth/index.ts` | Register with business data, rollback on failure, `validate_session` action, login without access_key |
| `panel-crud/index.ts` | Auth via `profileId` |
| `dashboard-data/index.ts` | Auth via `profileId` |
| `src/lib/session.ts` | **New** — isolated session adapter |
| `src/lib/api.ts` | Auto-read profileId |
| `src/pages/ActivatePage.tsx` | Empty key guard, business fields, no key storage |
| `src/pages/LoginPage.tsx` | Remember-me checkbox, session utility |
| `src/components/DashboardLayout.tsx` | validate_session, remove accessKey |
| `src/pages/Index.tsx` | Remove accessKey |
| `src/pages/SalasPage.tsx` | Remove accessKey |
| `src/pages/ReservasPage.tsx` | Remove accessKey |
| `src/pages/GameMastersPage.tsx` | Remove accessKey |
| `src/pages/AjustesPage.tsx` | Use profileId |

### What stays provisional

- Session validation is profile_id + panel_user_id existence check (no cryptographic token yet)
- No session expiry/TTL
- `panel_users` and `panel-auth` remain as-is structurally

