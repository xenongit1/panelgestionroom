

## Plan: Custom `panel_users` Auth System

### Overview
Replace Supabase Auth with a custom `panel_users` table and username/password authentication via edge functions. This decouples panel access from `auth.users` and eliminates the `already_claimed` conflict.

### Architecture

```text
Visit /
  ├─ localStorage has "gr_session" (profile_id + panel_user_id)?
  │     YES → render Dashboard
  │     NO  → localStorage has "gr_panel_activated"?
  │              YES → show Login (username/password)
  │              NO  → show Key Entry (/activate)
  │                      ├─ Valid key → check panel_users for profile_id
  │                      │    ├─ No users → show "Create Owner" form
  │                      │    └─ Has owner → show "Login" with message
  │                      └─ Invalid key → show error
```

### Database Changes

#### 1. Migration: Create `panel_users` table
```sql
CREATE TABLE public.panel_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_panel_users_profile ON public.panel_users(profile_id);
CREATE INDEX idx_panel_users_username ON public.panel_users(username);

ALTER TABLE public.panel_users ENABLE ROW LEVEL SECURITY;

-- Migrate existing data from profiles where panel_username is set
-- (passwords can't be migrated since they may be plaintext — users will need to re-register)
```

No RLS read policies needed since all access goes through edge functions with service role.

#### 2. Migration: Remove obsolete columns from profiles
```sql
ALTER TABLE public.profiles DROP COLUMN IF EXISTS panel_username;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS panel_password;
```

### Edge Function Changes

#### 3. New: `panel-auth/index.ts`
Handles both registration and login:
- **Register** (`action: "register"`): Receives `profileId`, `username`, `password`. Checks no owner exists for that `profile_id`. Hashes password with bcrypt. Inserts into `panel_users`. Returns session data.
- **Login** (`action: "login"`): Receives `username`, `password`. Looks up user, verifies bcrypt hash. Returns `{ profile_id, panel_user_id, username, role }`.

Uses `bcrypt` from `https://deno.land/x/bcrypt/mod.ts` for password hashing.

#### 4. Update: `validate-access-key/index.ts`
After validating the key, also check if `panel_users` has any rows for that `profile_id`:
- Return `has_owner: true/false` in the response so the frontend knows which screen to show.

#### 5. Delete: `register-owner/index.ts`
No longer needed — replaced by `panel-auth`.

### Frontend Changes

#### 6. `ActivatePage.tsx` — Rewrite
- **Step "key"**: Same key validation UI. On success, check `has_owner` from response.
  - If `has_owner === false` → show "Create Owner" form (username + password + confirm)
  - If `has_owner === true` → show info screen: "Esta llave ya tiene un administrador. Identifícate para entrar" with "Iniciar Sesión" button
- **Step "register"**: Call `panel-auth` with `action: "register"`. On success, save session to localStorage and redirect to `/`.
- Remove all Supabase Auth (`signUp`, `signInWithPassword`) calls.

#### 7. `LoginPage.tsx` — Rewrite
- Fields: Username + Password (not email)
- On submit: Call `panel-auth` with `action: "login"`
- On success: Store `{ profile_id, panel_user_id, username, role }` in localStorage as `gr_session`. Set `gr_panel_activated: true`. Redirect to `/`.
- On error: Show "Usuario o contraseña incorrectos"

#### 8. `Index.tsx` — Update auth guard
- Replace `supabase.auth.getSession()` with `localStorage.getItem("gr_session")`
- Parse session JSON to get `profile_id`
- Use `profile_id` to call `dashboard-data` (already key-based, just need to also support profile_id lookup)
- Remove `onAuthStateChange` listener

#### 9. Add logout functionality
- Clear `gr_session`, `gr_panel_activated`, `gr_access_key` from localStorage
- Redirect to `/login`

### Config Changes

#### 10. `supabase/config.toml`
- Add `[functions.panel-auth] verify_jwt = false`
- Remove `[functions.register-owner]`

### Files Summary
| File | Action |
|------|--------|
| Migration SQL | Create `panel_users`, drop `panel_username`/`panel_password` |
| `supabase/functions/panel-auth/index.ts` | Create — register + login |
| `supabase/functions/validate-access-key/index.ts` | Modify — add `has_owner` check |
| `supabase/functions/register-owner/index.ts` | Delete |
| `src/pages/ActivatePage.tsx` | Rewrite — custom auth flow |
| `src/pages/LoginPage.tsx` | Rewrite — username login |
| `src/pages/Index.tsx` | Modify — localStorage session |
| `src/App.tsx` | Minor — no Supabase auth deps |
| `supabase/config.toml` | Update function config |

### Security Notes
- Passwords hashed with bcrypt (cost factor 10) server-side
- No plaintext passwords stored or transmitted beyond HTTPS
- Session is localStorage-based (no JWT) — acceptable for single-tenant panel admin tool
- Edge functions use service role key, never exposed to client

