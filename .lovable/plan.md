

## Plan: Redesign Access Flow with Owner Registration

### Overview

Transform the single-screen key entry into a multi-step flow: (1) Key validation, (2) Owner account creation, (3) Login/Dashboard. Add premium visual design and persistent activation state.

### Architecture

```text
Visit /
  ├─ localStorage has "gr_panel_activated" + Supabase session?
  │     YES → render Dashboard
  │     NO  → localStorage has "gr_panel_activated" but no session?
  │              YES → show Login screen
  │              NO  → show Key Entry screen
  │                      ├─ Valid key → show Owner Registration screen
  │                      │                 ├─ signUp success → set "gr_panel_activated", render Dashboard
  │                      └─ Invalid key → show error
```

### Changes

#### 1. New Routes (`App.tsx`)
- Add `/login` route for returning users
- Add `/activate` route for key entry + owner registration flow
- Root `/` checks activation state and redirects accordingly

#### 2. New Page: `ActivatePage.tsx` (replaces AccessDenied)
**Step 1 — Key Entry** (premium UI):
- Dark gradient background (`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`)
- Card with `shadow-2xl`, subtle border (`border-white/10`), rounded-2xl
- GestionRoom logo with fade-in animation (`animate-fade-in` via CSS)
- Input with `KeyRound` icon prefix, modern styling
- Validates via `validate-access-key` edge function (already working)
- Error: "Esta clave no tiene un plan activo asociado o es incorrecta. Contacta con soporte@gestionroom.com"

**Step 2 — Owner Registration** (same card, slides in):
- Fields: Email, Password, Confirm Password
- On submit: `supabase.auth.signUp({ email, password })`
- On success: update the `profiles` row (matched by access_key) to link `id` to the new auth user — done via a new edge function `register-owner`
- Set `localStorage("gr_panel_activated", "true")` + persist access key
- Redirect to `/`

#### 3. New Edge Function: `register-owner/index.ts`
- Receives: `{ accessKey, email, password }`
- Uses service role to:
  1. Call `supabase.auth.admin.createUser({ email, password, email_confirm: true })` (auto-confirms)
  2. Update `profiles` row where `access_key = accessKey` to set `id = newUser.id`, `email = email`
- Returns success with session-compatible data
- Note: We use `admin.createUser` with `email_confirm: true` to skip email confirmation

#### 4. Login Page: `LoginPage.tsx`
- Simple email/password form using `supabase.auth.signInWithPassword`
- Same dark premium design as activation page
- On success: redirect to `/`
- Link: "Activar nuevo panel" → goes to `/activate`

#### 5. Updated `Index.tsx` (Dashboard)
- On mount: check `supabase.auth.getSession()`
- If no session → redirect to `/login`
- If session exists → fetch profile by `auth.uid()`, load dashboard data
- Remove all access_key validation from this page — it's handled upstream

#### 6. Persistence Logic
- `gr_panel_activated` in localStorage: signals this device has been activated (skip key entry)
- Supabase auth session: handles actual authentication
- Flow: activated + session = Dashboard; activated + no session = Login; not activated = Key Entry

#### 7. Visual Enhancements (CSS)
- Add `@keyframes fade-in` and `animate-fade-in` utility to `index.css`
- Dark gradient backgrounds for auth screens
- Input with icon prefix styling

#### 8. Config Updates
- Add `[functions.register-owner] verify_jwt = false` to `supabase/config.toml`

### Files to Create/Modify
| File | Action |
|------|--------|
| `src/pages/ActivatePage.tsx` | Create — key entry + owner registration |
| `src/pages/LoginPage.tsx` | Create — email/password login |
| `supabase/functions/register-owner/index.ts` | Create — server-side user creation |
| `src/pages/Index.tsx` | Modify — session-based auth guard, remove key validation |
| `src/App.tsx` | Modify — add routes |
| `src/index.css` | Modify — add fade-in animation |
| `supabase/config.toml` | Modify — add register-owner function config |
| `src/components/AccessDenied.tsx` | Delete (replaced by ActivatePage) |

### Security Notes
- Owner registration uses `admin.createUser` server-side (service role) to avoid email confirmation requirement
- The edge function validates the access_key exists and has valid plan_status before creating the user
- Profile row is updated to link to the new auth user, maintaining the existing data model

