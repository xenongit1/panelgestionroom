

## Plan: Add SVG logos and use in auth screens

### Changes

1. **Copy uploaded SVGs to `public/`**: `public/logo-mark-dark.svg` and `public/logo-mark-light.svg`

2. **Update `src/components/AuthLayout.tsx`**: Replace `GestionRoomLogo` with `<img src="/logo-mark-dark.svg" />` (dark mark on light background). Keep the "GestionRoom" text and "Panel de Control" subtitle below it, styled consistently.

3. **Update `src/components/GestionRoomLogo.tsx`**: For the sidebar (`size="default"`), keep existing behavior unchanged. For `variant="light"` use `/logo-mark-dark.svg`, for `variant="dark"` use `/logo-mark-light.svg` — replacing the PNG+invert hack with clean SVG sources.

### No logic changes
All state, handlers, API calls, session management untouched.

### Files
| File | Change |
|------|--------|
| `public/logo-mark-dark.svg` | **New** — copy from upload |
| `public/logo-mark-light.svg` | **New** — copy from upload |
| `src/components/AuthLayout.tsx` | Use `/logo-mark-dark.svg` directly |
| `src/components/GestionRoomLogo.tsx` | Use SVGs instead of PNG+invert |

