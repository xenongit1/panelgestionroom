

## Plan: Fix Owner Registration "Already Assigned" Error

### Root Cause

The profile with key `123-73296659` already has `email: zslebaans1977@gmail.com` set (from marketing website signup via `handle_new_user` trigger). The `register-owner` edge function checks `if (profile.email && profile.email !== email)` and blocks registration because the profile already has an email assigned.

Even when using the SAME email, `admin.createUser` fails because that email already exists in `auth.users`.

The profile's `id` already matches an `auth.users` entry — so the owner already exists. The user just needs to log in.

### Changes

#### 1. Edge Function `register-owner/index.ts`
- When profile already has an email AND a matching auth user exists: return `{ error: "already_claimed" }` (structured code, not just a string)
- When profile has email matching the submitted email: return same `already_claimed` — user should login
- When profile has NO email (truly first time): proceed with `admin.createUser` as before
- When `createUser` fails with "already been registered": return `{ error: "email_taken" }`

#### 2. Frontend `ActivatePage.tsx`
- Parse structured error codes from `register-owner`
- When `already_claimed`: hide registration form, show message "Esta clave ya tiene una cuenta vinculada" with a prominent "Iniciar Sesion" button that navigates to `/login`
- When `email_taken`: show "Este email ya esta registrado. Usa Login." with login button
- After successful registration + auto-login: set localStorage and redirect to `/`

#### 3. Login Page `LoginPage.tsx`
- After successful login, fetch the user's profile to get their `access_key` and store it in `gr_access_key` localStorage (currently missing — would cause redirect loop on dashboard)

#### 4. Dashboard `Index.tsx`
- No changes needed — already checks localStorage correctly

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/register-owner/index.ts` | Return structured error codes |
| `src/pages/ActivatePage.tsx` | Handle `already_claimed` with Login button |
| `src/pages/LoginPage.tsx` | Fetch and store `access_key` after login |

