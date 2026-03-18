

## Fix: panel-auth 500 error (Worker is not defined)

### Root Cause
The `deno.land/x/bcrypt@v0.4.1` library uses Web Workers internally for hashing, which are **not supported** in the Supabase Edge Functions runtime. Every call crashes with `ReferenceError: Worker is not defined`.

### Solution
Replace the bcrypt import with `bcryptjs` via npm specifier. This is a pure JavaScript implementation that works in Edge Functions without Workers.

### Change: `supabase/functions/panel-auth/index.ts`

**Line 2** — Replace import:
```typescript
// FROM:
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
// TO:
import bcrypt from "npm:bcryptjs@2.4.3";
```

**Line 58** — Hash call (register):
```typescript
// FROM:
const passwordHash = await bcrypt.hash(password);
// TO:
const passwordHash = bcrypt.hashSync(password, 10);
```

**Line 103** — Compare call (login):
```typescript
// FROM:
const valid = await bcrypt.compare(password, user.password_hash);
// TO:
const valid = bcrypt.compareSync(password, user.password_hash);
```

No other files need changes. The function will be redeployed automatically.

