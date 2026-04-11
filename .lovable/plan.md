

## Plan: Premium Auth Screens Redesign (adjusted)

### Summary

Visual-only redesign of auth screens (activate, register, login, already-activated) to a premium light SaaS aesthetic. No logic changes. Adjustments applied per user feedback.

---

### User adjustments applied

1. **Font consistency**: Apply `Geist` not only in `tailwind.config.ts` but also explicitly in `src/index.css` on `html, body, button, input, textarea, select` to eliminate any inheritance gaps.
2. **Card width**: Use `max-w-[480px]` instead of `max-w-[440px]` for comfortable breathing room on the registration form.
3. **Realistic placeholders**: Use professional examples like "admin", "nombre@tuempresa.com", "+34 600 123 456", "Escape Factory Madrid", "España", "Madrid".
4. **Ultra-subtle background pattern**: Dot grid at very low opacity (~0.15) and small size (~1px dots, 28px spacing) so it reads as texture, not decoration.

---

### Files

| File | Change |
|------|--------|
| `tailwind.config.ts` | Change `fontFamily.sans` from `['Inter', ...]` to `['Geist', 'system-ui', 'sans-serif']` |
| `src/index.css` | Add explicit `font-family: 'Geist', system-ui, sans-serif` rule on `html, body, button, input, textarea, select`. Remove the `!important` on body font if redundant after this |
| `src/components/AuthLayout.tsx` | **New** — shared auth wrapper: `min-h-screen bg-[#F7F7F8]` with ultra-subtle radial-gradient dot pattern, centered flex column, logo on top, white card (`max-w-[480px] rounded-2xl border border-[#E8E8E8] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-10`), fade-in animation |
| `src/pages/ActivatePage.tsx` | Replace dark glassmorphism container with `AuthLayout`. Light input classes (`bg-[#FAFAFA] border-[#E2E2E2] text-foreground placeholder:text-[#A0A0A0]`). Icons `text-[#999] strokeWidth={1.5}`. Black primary button. Realistic placeholders. All state/logic untouched |
| `src/pages/LoginPage.tsx` | Same visual migration — wrap in `AuthLayout`, light inputs, black button, light checkbox styling. Logic untouched |

### What does NOT change

- All handlers, state, API calls, session logic, edge functions, routing
- Step flow (key → register → has_owner)
- DashboardLayout, feature pages, sidebar

