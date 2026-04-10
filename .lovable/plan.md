

## Plan: Premium UI Overhaul with Theme Customizer

Redesign the entire dashboard UI to match the reference images — a polished SaaS-style panel with a theme customizer popover, refined sidebar, enhanced top bar, and dark mode support.

---

### 1. Theme System — Context & CSS Variables

**New file: `src/contexts/ThemeContext.tsx`**
- React context managing: `preset`, `scale`, `radius`, `colorMode`, `contentLayout`, `sidebarMode`
- Persists settings to `localStorage` under `gr_theme`
- On preset change, applies a CSS class (e.g., `theme-underground`) to `<html>` that overrides `--primary` and `--ring` HSL values
- On `colorMode` change, toggles `dark` class on `<html>`
- On `scale` change, sets a CSS variable `--ui-scale` (0.875 for XS, 1.125 for LG, 1 for default) applied to `font-size` on `<html>`
- On `radius` change, updates `--radius` (0 for none, 0.25rem SM, 0.5rem MD, 0.75rem LG, 1rem XL)
- Exposes `resetTheme()` to restore defaults

**Modify: `src/index.css`**
- Add 8 theme preset classes (`:root.theme-underground`, etc.) each overriding `--primary`, `--primary-foreground`, `--ring`, `--sidebar-primary` with the corresponding color
- Presets: Default (blue), Underground (green #22c55e), Rose Garden (pink #f43f5e), Lake View (cyan #06b6d4), Sunset Glow (orange #f97316), Forest Whisper (emerald #10b981), Ocean Breeze (blue #3b82f6), Lavender Dream (violet #8b5cf6)

**Modify: `src/App.tsx`**
- Wrap everything in `<ThemeProvider>`

---

### 2. Theme Customizer Popover

**New file: `src/components/ThemeCustomizer.tsx`**
- Triggered by a gear/palette icon in the TopBar
- Uses `Popover` from shadcn
- Sections matching the reference image exactly:
  - **Theme preset**: `Select` dropdown with colored dots + preset names
  - **Scale**: Segmented toggle (None / XS / LG)
  - **Radius**: Segmented toggle (None / SM / MD / LG / XL)
  - **Color mode**: Light / Dark toggle
  - **Content layout**: Full / Centered toggle
  - **Sidebar mode**: Default / Icon toggle
  - **Reset to Default** button at bottom
- All controls read/write from ThemeContext

---

### 3. Sidebar Redesign

**Modify: `src/components/LeftSidebar.tsx`**
- White/light background in light mode (not dark navy) — matches reference
- Cleaner nav items with subtle hover states and active indicator
- Add category labels/groups (e.g., "Principal", "Gestión")
- Add badges: "New" in soft green for newer sections
- Bottom section: "Unlock Everything" card with subtle gradient background, description text, and "Get Full Access" button (links to pricing page)
- User info card at very bottom with avatar, name, email
- Respond to `sidebarMode` from ThemeContext — collapse to icon-only when set to "Icon"
- Use light sidebar colors: white bg, gray text, primary accent for active

**Modify: `src/index.css`**
- Update sidebar CSS variables for light mode: white background, dark text

---

### 4. Top Bar Enhancement

**Modify: `src/components/TopBar.tsx`**
- Search input with `⌘ K` keyboard shortcut badge inside the input (visual only)
- Notification bell with red dot indicator
- Dark mode toggle button (moon/sun icon) — calls ThemeContext
- Theme customizer trigger (palette icon) — opens the popover
- User avatar dropdown (using `DropdownMenu` from shadcn) with items: Account, Billing, Notifications, Log out
- Remove the current title/subtitle — move to a simpler layout matching reference

---

### 5. Content Layout Support

**Modify: `src/components/DashboardLayout.tsx`**
- Read `contentLayout` from ThemeContext
- When "Centered", wrap main content in `max-w-6xl mx-auto`
- When "Full", use full width (current behavior)
- Read `sidebarMode` and pass to LeftSidebar

---

### 6. Dark Mode CSS

**Modify: `src/index.css`**
- Refine `.dark` variables for a deep charcoal look (not pure black):
  - `--background: 224 10% 10%` (charcoal)
  - `--card: 224 10% 12%`
  - Cards, sidebar, and popover get subtle contrast differences
- Sidebar in dark mode: very dark background with lighter text

---

### Files Summary

| Action | File |
|--------|------|
| Create | `src/contexts/ThemeContext.tsx` |
| Create | `src/components/ThemeCustomizer.tsx` |
| Modify | `src/index.css` — theme presets, dark mode refinement, sidebar light colors |
| Modify | `src/App.tsx` — wrap in ThemeProvider |
| Modify | `src/components/LeftSidebar.tsx` — light sidebar, categories, badges, unlock card, collapse support |
| Modify | `src/components/TopBar.tsx` — search with ⌘K, notifications dot, dark toggle, customizer trigger, user dropdown |
| Modify | `src/components/DashboardLayout.tsx` — content layout and sidebar mode support |

No backend or database changes required.

