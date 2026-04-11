

## Plan: Premium Visual Polish for Auth Screens (Mobile-First) — Revised

### Summary

Second-pass visual refinement of all auth screens. Pure CSS/markup changes — zero logic changes. Mobile-first layout, refined typography, stronger brand block, polished card/inputs/buttons.

---

### User adjustments applied

1. **Font enforcement in AuthLayout**: Add explicit `style={{ fontFamily: "'Geist', system-ui, sans-serif" }}` on the AuthLayout outer wrapper div, so auth screens never depend solely on `index.css` inheritance.
2. **Larger brand logo**: `h-14 w-14` on mobile, `sm:h-16 sm:w-16` on desktop (instead of reducing to `h-12`). Keeps generous presence on both breakpoints.

---

### Changes by file

#### 1. `src/components/AuthLayout.tsx`

- Outer div: add `style={{ fontFamily: "'Geist', system-ui, sans-serif" }}` alongside existing background styles
- Layout: `min-h-[100dvh]`, `p-5 sm:p-4`
- Logo: `h-14 w-14 sm:h-16 sm:w-16`
- "GestionRoom": `text-[22px] sm:text-2xl font-semibold tracking-[-0.02em]`
- "Panel de Control": `text-[11px] sm:text-xs font-medium uppercase tracking-[0.12em] text-[#999]`
- Gap between logo and text: `gap-2.5`, margin below brand block: `mb-6`
- Card: `p-6 sm:p-10`, `rounded-xl sm:rounded-2xl`, border `#EBEBEB`, layered shadow `0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)`
- Background dots opacity reduced from `0.06` to `0.04`

#### 2. `src/pages/LoginPage.tsx`

- Heading: `text-lg sm:text-xl font-semibold tracking-[-0.01em]`
- Subtitle: `text-[13px] text-[#888]`
- Inputs: `h-11 sm:h-12`, `pl-11`, icons `left-3.5 h-[18px] w-[18px]`, `rounded-lg`, `text-[14px]`
- Button: `h-12 text-[15px] font-medium rounded-lg active:scale-[0.98] transition-all`
- "Mantener sesion" label: `text-[13px]`
- Secondary link: `text-[13px]`, `mt-8`

#### 3. `src/pages/ActivatePage.tsx`

- Same input/button/typography refinements as LoginPage
- Section dividers: `text-[11px] tracking-[0.1em] uppercase`
- Verified badge: `text-[13px] rounded-lg`
- Company name: `text-lg sm:text-xl font-semibold`

#### 4. `src/index.css`

- Add `text-rendering: optimizeLegibility` to the html/body rule

### What does NOT change

All state, handlers, API calls, edge functions, routing, session logic, step flow, error handling, DashboardLayout, sidebar, feature pages.

