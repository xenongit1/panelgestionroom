

## Plan: High-Fidelity UI Correction to Match Reference Designs

Align the dashboard interface pixel-perfectly with the Shadcn UI Kit reference images, adapting all content to GestionRoom branding and data.

---

### 1. Sidebar Overhaul (`src/components/LeftSidebar.tsx`)

**Header section:**
- Replace plain logo with GestionRoom branding + a `PanelLeftClose` icon button on the right side for toggling sidebar collapse (calls `setSidebarMode` from ThemeContext)
- Logo should use `dark:invert` to be black in light mode, white in dark mode

**Navigation groups:**
- Keep current structure (Principal, Gestion, Sistema) but style nav items to match reference: lighter font weight, rounded-md hover backgrounds, left border or bg highlight for active state
- "New" badge on Reservas stays with soft green pill styling matching reference exactly

**Unlock Everything card:**
- Restyle to match reference: subtle background (not gradient-heavy), clean title "Unlock Everything", description text, and a green "Get Full Access" button with a checkmark/sparkle icon and subtle glow effect

**User footer:**
- Show: circular avatar with initials, full name ("Pedro Garcia" or from session data), email below, and a vertical kebab (three dots / `MoreVertical` icon) on the right
- Remove `@username` format, show real name and email from profile/session

---

### 2. TopBar Cleanup (`src/components/TopBar.tsx`)

- Keep the sidebar toggle icon (matching the `PanelLeftClose` from reference) as the first element, followed by the search bar
- Search bar: wider, with `⌘ K` badge - keep current implementation, just ensure sizing matches
- Right side: notification bell (with red dot), dark mode toggle (moon/sun), theme customizer (paintbrush), user avatar dropdown - all already implemented, minor spacing adjustments
- Remove the `h1` title from the top bar (the page title should not appear here per the reference)

---

### 3. Dashboard Content (`src/pages/Index.tsx`)

- Remove any calendar component if present
- Keep current structure: KPICards + ReservationsTable + RightSidebar
- This is already correct based on the code review

---

### 4. KPI Cards Polish (`src/components/KPICards.tsx`)

- Minor styling refinements: ensure `rounded-xl` on cards, proper icon container sizing (40x40 with rounded-lg), consistent spacing
- Already mostly correct - just ensure border radius follows theme system

---

### 5. Reservations Table Polish (`src/components/ReservationsTable.tsx`)

- Empty state: make "reservas" bold/highlighted in "No hay reservas para mostrar" 
- Ensure filter buttons match reference pill style
- Already mostly correct

---

### 6. Right Sidebar Polish (`src/components/RightSidebar.tsx`)

- Already has Integraciones (Stripe) and Proximas Reservas sections
- Minor spacing/typography adjustments to match reference

---

### 7. DashboardLayout Adjustments (`src/components/DashboardLayout.tsx`)

- Move the sidebar toggle trigger to TopBar instead of sidebar header
- Ensure the layout properly handles the sidebar collapse with the panel icon

---

### 8. GestionRoomLogo Update (`src/components/GestionRoomLogo.tsx`)

- In light mode: logo should appear dark (black) - currently uses `invert` for dark variant
- Fix: in sidebar (light bg), the white logo needs `invert` class by default; remove invert in dark mode
- The logo import is `gestionroom-logo-white.png`, so in light sidebar it needs inverting to appear dark

---

### Files Modified

| File | Changes |
|------|---------|
| `src/components/LeftSidebar.tsx` | Header with collapse icon, restyled nav, unlock card, user footer with name/email/kebab |
| `src/components/TopBar.tsx` | Remove h1 title, add sidebar toggle icon, adjust spacing |
| `src/components/DashboardLayout.tsx` | Pass sidebar toggle handler to TopBar |
| `src/components/GestionRoomLogo.tsx` | Fix light/dark mode logo color logic |
| `src/components/ReservationsTable.tsx` | Bold "reservas" in empty state text |
| `src/components/KPICards.tsx` | Ensure rounded-xl cards |

No backend changes required.

