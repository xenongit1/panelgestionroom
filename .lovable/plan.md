

## Plan: Rebuild Auth Visual System

### Summary

Complete visual rebuild of the auth module. New dedicated `AuthBrand` component, rebuilt `AuthLayout`, and visual polish on all auth pages. Zero logic changes.

---

### Files

#### 1. `src/components/auth/AuthBrand.tsx` — NEW

Dedicated brand block for auth screens only (not reusing sidebar logo):

```
<img> logo-mark-dark.svg
<span> "GestionRoom"
<span> "Panel de Control"
```

- Mobile: logo `h-14 w-14`, title `text-[28px] font-semibold tracking-[-0.03em]`, subtitle `text-[11px] uppercase tracking-[0.14em] text-[#8F8F8F]`
- Desktop: logo `sm:h-16 sm:w-16`, title `sm:text-[30px]`
- Gap between logo and text: `gap-3`
- All text colors hardcoded (no `text-foreground` that could inherit white)
- Title: `text-[#1A1A1A]`, subtitle: `text-[#8F8F8F]`

#### 2. `src/components/auth/AuthLayout.tsx` — NEW (replaces old `src/components/AuthLayout.tsx`)

Shared wrapper for all auth screens:

- Outer: `min-h-[100dvh]`, centered flex, `p-5 sm:p-6`, `font-sans` class forced
- Inline style: `fontFamily: "'Geist', system-ui, sans-serif"` as belt-and-suspenders
- Background: `#F7F7F8` + subtle radial dot pattern (`rgba(0,0,0,0.03)`, `30px 30px`)
- Renders `<AuthBrand />` above the card
- Card: `max-w-[500px]`, `bg-white`, `rounded-2xl`, `p-6 sm:p-10`, border `#E8E8E8`, shadow `0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)`
- Brand block margin-bottom: `mb-8`

#### 3. `src/pages/LoginPage.tsx` — UPDATE

- Import from `@/components/auth/AuthLayout` (new path)
- Headings: hardcoded `text-[#1A1A1A]` instead of `text-foreground`
- Subtitles: `text-[#888]` (already correct)
- Input classes: `h-12` (uniform, no sm variant), `bg-[#FAFAFA]`, `border-[#E0E0E0]`, `text-[#1A1A1A]`, `placeholder:text-[#A0A0A0]`, `pl-11`, `rounded-lg`
- Button: unchanged (already premium)
- "Mantener sesion" label: `text-[#777]`
- Secondary link: `text-[#999]`

#### 4. `src/pages/ActivatePage.tsx` — UPDATE

- Import from `@/components/auth/AuthLayout`
- Same input/heading color fixes as LoginPage
- All `text-foreground` on headings/labels replaced with `text-[#1A1A1A]`
- Section divider text: `text-[#999]`
- Verified badge: keep emerald styling (explicit colors, safe)
- Company name display: `text-[#1A1A1A]`

#### 5. `src/index.css` — No changes needed

Already has Geist on html/body/button/input/textarea/select with antialiasing and optimizeLegibility.

#### 6. `tailwind.config.ts` — No changes needed

Already has `fontFamily.sans: ['Geist', ...]`.

#### 7. `src/components/AuthLayout.tsx` — DELETE (old file)

Replaced by `src/components/auth/AuthLayout.tsx`.

---

### What does NOT change

All state, handlers, API calls, edge functions, routing, session logic, GestionRoomLogo.tsx, sidebar, dashboard.

