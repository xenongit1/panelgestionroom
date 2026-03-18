

## Fix: Prevent attacker from claiming any panel with a forged `profile_id`

### Problem
The `register` action in `panel-auth` trusts the `profileId` sent by the client without verifying it belongs to the provided `access_key`. An attacker could send any `profileId` and claim ownership of another escape room's panel.

### Solution
Require `access_key` in the register request and verify server-side that it matches the `profileId` and has a valid plan.

### Changes

**1. `supabase/functions/panel-auth/index.ts` — register action**
- Accept `accessKey` in the request body alongside `profileId`
- Query `profiles` table to verify: `access_key = accessKey` AND `id = profileId` AND `plan_status IN ('pro', 'anual', 'active')`
- If no match, return 401 `{ error: "unauthorized" }`
- Only proceed with owner creation if validation passes

**2. `src/pages/ActivatePage.tsx` — handleRegister**
- Include `accessKey` (from state/localStorage) in the `panel-auth` register call body
- Handle the new `"unauthorized"` error response in the UI

### Files modified
| File | Change |
|------|--------|
| `supabase/functions/panel-auth/index.ts` | Add access_key + profile_id + plan_status verification before insert |
| `src/pages/ActivatePage.tsx` | Send `accessKey` in register request, handle `unauthorized` error |

