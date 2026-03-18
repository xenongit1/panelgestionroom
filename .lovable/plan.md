

## Fix: Stop exposing internal errors to clients

### Problem
All three Edge Functions (`panel-auth`, `validate-access-key`, `dashboard-data`) return `String(err)` directly to clients in their `catch` blocks, leaking internal implementation details (stack traces, library names, DB errors).

### Changes

**1. `supabase/functions/panel-auth/index.ts` (line 141-142)**
```typescript
// FROM:
} catch (err) {
    return jsonResponse({ error: String(err) }, 500);
}
// TO:
} catch (err) {
    console.error("panel-auth error:", err);
    return jsonResponse({ error: "Ha ocurrido un error en el servidor" }, 500);
}
```

**2. `supabase/functions/validate-access-key/index.ts` (line 80-84)**
```typescript
// FROM:
} catch (err) {
    return new Response(
      JSON.stringify({ valid: false, reason: "invalid", error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
}
// TO:
} catch (err) {
    console.error("validate-access-key error:", err);
    return new Response(
      JSON.stringify({ valid: false, reason: "server_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
}
```

**3. `supabase/functions/dashboard-data/index.ts` (line 86-90)**
```typescript
// FROM:
} catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
}
// TO:
} catch (err) {
    console.error("dashboard-data error:", err);
    return new Response(
      JSON.stringify({ error: "Ha ocurrido un error en el servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
}
```

All three functions get the same treatment: log the real error server-side via `console.error`, return a generic message to the client.

