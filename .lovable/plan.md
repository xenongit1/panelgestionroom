
### Diagnóstico confirmado (bloqueante actual)

1. La Edge Function `validate-access-key` está consultando una columna eliminada: `panel_username` en `profiles`.
2. Eso provoca error SQL interno y la función cae en `valid: false, reason: "invalid"`, aunque la llave y `plan_status` sean correctos.
3. Lo validé con llamadas reales a la función: llaves existentes con plan activo devolvieron `invalid`.
4. `panel_users` está vacía (correcto para “primera configuración”), por lo que el flujo esperado debe ser “llave válida -> crear owner”.

---

### Plan de corrección inmediata

1. **Corregir `validate-access-key` para lectura real-time y compatible con nuevo esquema**
   - Quitar `panel_username` del `select` (ya no existe en DB).
   - Mantener cliente con `SUPABASE_SERVICE_ROLE_KEY` (ya está, se conserva).
   - Mantener búsqueda exacta por `.eq("access_key", key.trim())` + `.maybeSingle()`.
   - Validar `plan_status` estrictamente contra `["pro", "anual", "active"]`.
   - Devolver payload canónico:
     - `valid: true`
     - `profile_id`
     - `has_owner`
     - (opcionalmente `profile` para no romper el dashboard actual).
   - Añadir `console.error` detallado si falla query (`message`, `details`, `hint`, `code`) para depurar RLS/esquema.

2. **Ajustar `ActivatePage` al nuevo contrato de respuesta**
   - Usar `data.profile_id` como fuente principal (no depender de `data.profile.id`).
   - Si `valid: true` y `has_owner: false` -> mostrar formulario “Crear Cuenta de Administrador”.
   - Si `valid: true` y `has_owner: true` -> mostrar estado “Esta llave ya tiene un administrador. Identifícate para entrar”.
   - Si falla validación/llamada -> además del mensaje UI, hacer `console.error` en navegador con `fnError`/`data` para diagnóstico rápido.

3. **Blindar persistencia de sesión al crear admin**
   - Verificar en `ActivatePage` que `panel-auth/register` retorne `session.profile_id`.
   - Guardar `gr_session` siempre con `profile_id` (y `panel_user_id`, `username`, `role`).
   - Confirmar persistencia de `gr_access_key` y `gr_panel_activated`.

4. **Alinear tipos/UI con el esquema actual**
   - Quitar referencias residuales a `panel_username` en tipos y lecturas derivadas de `profile` para evitar futuros falsos negativos al refactorizar.
   - En UI de bienvenida/sidebar usar `session.username` como prioridad cuando aplique.

5. **Redeploy y verificación técnica**
   - Forzar redeploy de `validate-access-key` (y `panel-auth` por consistencia de contrato).
   - Probar con `curl_edge_functions`:
     - llave Pro válida -> `valid: true`, `profile_id`, `has_owner: false` (si tabla vacía).
     - llave inválida -> `valid: false`.
   - Probar flujo E2E en preview:
     - `/activate` -> validar llave -> crear usuario -> entrada directa al panel con `gr_session` persistido.

---

### Detalles técnicos (implementación)

- **Archivo principal a corregir**: `supabase/functions/validate-access-key/index.ts`
  - Cambio crítico: `select(...)` sin columnas obsoletas.
  - Respuesta estable para frontend: `{ valid, profile_id, has_owner, ... }`.
- **Frontend**: `src/pages/ActivatePage.tsx`
  - Adaptar lectura de respuesta y logging de errores API en consola.
- **Consistencia de datos de sesión**:
  - `src/pages/ActivatePage.tsx` y, si aplica, `src/pages/LoginPage.tsx` para garantizar `profile_id` en `gr_session`.
- **Limpieza preventiva**:
  - `src/types/dashboard.ts` y componentes que aún consumen `profile.panel_username`.
