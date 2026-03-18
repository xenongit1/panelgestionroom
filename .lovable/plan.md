

## Security Hardening: panel-auth & dashboard-data

### Changes Overview

Three areas to address: error masking, rate limiting on login, input sanitization, and re-validation of access_key on dashboard-data.

---

### 1. Error Masking in `panel-auth/index.ts`

**Line 84-86** — Register insert error currently leaks `insertError.message`. Replace with generic message:
```typescript
if (insertError) {
  console.error("panel-auth insert error:", insertError);
  return jsonResponse({ error: "Error de autenticación" }, 500);
}
```

---

### 2. Rate Limiting on Login (`panel-auth/index.ts`)

Add rate limiting logic at the start of the `login` action using the existing `validation_attempts` table:

- Before checking credentials, count rows in `validation_attempts` where `ip_address = username` (repurpose the column to track by username) and `attempted_at > now() - 10 minutes`
- If count >= 5, return `429 Too Many Requests`
- On failed login (invalid credentials), insert a row into `validation_attempts` with the username
- On successful login, delete old attempts for that username
- Clean up: delete rows older than 1 hour (reuse `cleanup_old_validation_attempts` function logic inline)

---

### 3. Input Validation (`panel-auth/index.ts`)

Add sanitization before processing login/register inputs:

- Trim and lowercase `username`, enforce max length (50 chars), allow only alphanumeric + underscore
- Enforce `password` max length (128 chars) to prevent bcrypt DoS
- Reject inputs that fail validation with `400 missing_fields`

---

### 4. Re-validate access_key in `dashboard-data/index.ts`

The function already validates the key against `profiles`, but add plan_status check:

```typescript
const { data: profile } = await supabase
  .from("profiles")
  .select("id")
  .eq("access_key", key)
  .in("plan_status", ["pro", "anual", "active"])
  .maybeSingle();
```

If no match, return 403. This ensures expired/inactive plans can't fetch dashboard data.

---

### Files Modified

| File | Changes |
|------|---------|
| `supabase/functions/panel-auth/index.ts` | Error masking, rate limiting via `validation_attempts`, input sanitization |
| `supabase/functions/dashboard-data/index.ts` | Add `plan_status` check to access_key validation |

No database migrations needed — `validation_attempts` table already exists with `id`, `ip_address`, and `attempted_at` columns.

