

## Plan: Limpieza UI/UX del Panel (Revisado)

### Summary
Cleanup pass: simplify dashboard, refine sidebar, soften light mode (including hardcoded colors), single data fetch, mobile-first layout, remove fake search, clean up TopBar menu. No architecture changes.

---

### 1. Light Mode + Hardcoded Colors (`index.css` + components)

**`index.css`**:
- Soften `:root` variables: `--background: 0 0% 98%`, `--foreground: 0 0% 12%`, `--border: 0 0% 90%`, `--muted: 0 0% 95%`, `--sidebar-background: 0 0% 96%`
- Remove grid background pattern from body
- Add custom thin scrollbar (webkit + Firefox)

**Hardcoded color replacements across components**:
- `LeftSidebar.tsx`: Replace `bg-[#F9FAFB]` → `bg-sidebar`, `border-[#F0F0F0]` → `border-sidebar-border` (3 occurrences)
- `MonthlyKPIs.tsx`: Replace `text-emerald-600 bg-emerald-500/10` → `text-success bg-success/10`, `text-blue-600 bg-blue-500/10` → `text-primary bg-primary/10`, `text-amber-600 bg-amber-500/10` → `text-warning bg-warning/10`
- `OccupationCalendar.tsx`: Replace `bg-emerald-500` → `bg-success`, `bg-amber-400` → `bg-warning`
- `RightSidebar.tsx` badges: `bg-emerald-500/10 text-emerald-600` → `bg-success/10 text-success`, `bg-amber-400/10 text-amber-600` → `bg-warning/10 text-warning` (but RightSidebar is being deleted, so only calendar matters)

---

### 2. Dashboard Simplification + Single Data Fetch (`Index.tsx`)

- **Delete `RightSidebar.tsx`** and `RightSidebarWrapper` in `Index.tsx`
- **Remove double `dashboard-data` call**: Delete the separate `useEffect` in `RightSidebarWrapper`. Use only `DashboardContent`'s single fetch, which already gets `nextSession`, `todayReservations`, `reservations`, etc.
- **Remove `showRightSidebar` prop** from `DashboardLayout` and the rendering slot for it
- **Inline `NextSessionWidget`** into main dashboard content
- **Delete `MonthlyKPIs.tsx`**: Merge its metrics (Facturación, Ocupación) into `KPICards` as a single compact 4-card row (Reservas, Salas, Facturación est., Ocupación est.). Remove "Game Masters" and "Grupos del Mes" cards.
- **KPICards**: Reduce padding to `p-4`, icon box to `h-8 w-8`, value font to `text-xl`. No large icon boxes.

**Mobile order** (via flex order classes):
1. NextSessionWidget (`order-1`)
2. BlockSlotDialog / "Cerrar Hora" (`order-2`)
3. KPI metrics compact row (`order-3`)
4. ReservationsTable — on mobile render as cards, not table (`order-4`)
5. OccupationCalendar (`order-5`)

---

### 3. Sidebar (`LeftSidebar.tsx`, `DashboardLayout.tsx`)

- **Width**: `w-[224px]` expanded, `w-[72px]` collapsed
- **Delete** "Unlock Everything" upsell card entirely
- **Collapse button**: Move outside sidebar, floating on the outer edge (absolute, translated right, on the sidebar border)
- **Mobile**: Don't render sidebar. Add hamburger `Menu` icon in `TopBar`. Opens a `Sheet` (side="left") with same nav items. Sheet closes on nav click.
- `DashboardLayout`: Add `isMobile` check. On mobile: no `<LeftSidebar>`, render `<Sheet>` triggered from TopBar. Pass `onMenuToggle` prop to TopBar.

---

### 4. TopBar (`TopBar.tsx`)

- **Remove fake search bar** entirely (the `readOnly` Input with ⌘K)
- **Add mobile menu trigger**: Accept `onMenuOpen` prop, render `Menu` hamburger icon on mobile (left side)
- **User dropdown cleanup**: Replace English labels with Spanish — "Account" → "Mi cuenta", "Billing" → remove (Stripe/billing removed), "Settings" → "Ajustes". Remove `CreditCard` import. Keep only: Mi cuenta, Ajustes, separator, Cerrar sesión.

---

### 5. OccupationCalendar improvements

- Increase cell size: remove `aspect-square` on small cells, use `min-h-[40px] min-w-[40px]`
- Use full day labels: "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"
- On desktop, give calendar 50% width alongside reservations (`lg:grid-cols-2` instead of `lg:grid-cols-3` with 1-col calendar)
- Replace hardcoded emerald/amber with `bg-success`/`bg-warning` tokens

---

### 6. ReservationsTable mobile

- On mobile (`useIsMobile()`), render card-based list instead of `<Table>` — similar to what `ReservasPage` already does
- Each card shows: client, sala, time, status badge

---

### 7. ReservaDetailPage — Mobile layout only

- **NOT converting to dialog/sheet** — it stays a full page
- Improve mobile paddings: reduce `max-w-3xl` padding, ensure action buttons wrap with `flex-wrap gap-2`
- Ensure info grid uses `grid-cols-1` on mobile (already does via `sm:grid-cols-2`)

---

### 8. Dialog → Sheet on mobile (real dialogs only)

- `BlockSlotDialog.tsx`: On mobile, use `Sheet` (side="bottom") instead of `Dialog`
- `ReservasPage.tsx` create/edit dialog: On mobile, use `Sheet` (side="bottom") or fullscreen `DialogContent`
- Keep desktop dialogs unchanged

---

### 9. Files Changed

| File | Change |
|---|---|
| `src/index.css` | Soften light vars, remove grid bg, add scrollbar |
| `src/components/LeftSidebar.tsx` | Narrower, remove upsell, replace hardcoded colors, external collapse btn, mobile Sheet |
| `src/components/DashboardLayout.tsx` | Remove right sidebar slot, mobile Sheet logic |
| `src/components/TopBar.tsx` | Remove search, add hamburger, clean menu labels |
| `src/components/RightSidebar.tsx` | DELETE |
| `src/pages/Index.tsx` | Single data fetch, inline NextSession, mobile ordering |
| `src/components/KPICards.tsx` | Merge MonthlyKPIs, compact 4-card row |
| `src/components/dashboard/MonthlyKPIs.tsx` | DELETE (merged) |
| `src/components/dashboard/OccupationCalendar.tsx` | Larger cells, full day labels, token colors |
| `src/components/ReservationsTable.tsx` | Mobile card view |
| `src/components/dashboard/BlockSlotDialog.tsx` | Mobile Sheet |
| `src/pages/ReservasPage.tsx` | Mobile dialog → Sheet |
| `src/pages/ReservaDetailPage.tsx` | Mobile padding/wrap improvements only |

