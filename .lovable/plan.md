

## Plan: Sidebar Redesign — High-Fidelity Polish

### Changes to `src/components/LeftSidebar.tsx`

**Header:**
- Replace `GestionRoomLogo` with inline logo: `LayoutDashboard` icon (black, `strokeWidth={1.5}`) + "GestionRoom" text
- Replace `PanelLeftClose`/`PanelLeft` toggle with `ChevronLeft`/`ChevronRight` inside a small bordered button (`border border-border rounded-md h-7 w-7`)

**Navigation icons:**
- Add `strokeWidth={1.5}` to all nav icons for a thinner, premium look

**Sidebar container styling:**
- Background: `bg-[#F9FAFB]` (light mode), keep dark mode via CSS vars
- Border: `border-r border-[#F0F0F0]` — remove any shadow classes
- Remove `bg-sidebar` class, use explicit hex colors

**User footer:**
- Already has avatar + name + email + MoreVertical — add `strokeWidth={1.5}` to MoreVertical
- Wire the MoreVertical button to a `DropdownMenu` with "Ajustes" (navigates to `/ajustes`) and "Cerrar sesión" options

**Unlock card:**
- Keep as-is, add `strokeWidth={1.5}` to icons inside it

### Files Modified

| File | Changes |
|------|---------|
| `src/components/LeftSidebar.tsx` | Header logo swap, ChevronLeft toggle, strokeWidth 1.5 on all icons, explicit bg color, DropdownMenu on kebab |

