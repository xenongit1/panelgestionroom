

## Plan: Monochrome Premium Palette & Grid Background

### What changes

**File: `src/index.css`**

1. **`:root` variables** — Replace all blue-tinted HSL values with pure monochrome (hue `0`, saturation `0%`):
   - `--foreground: 0 0% 3.9%`
   - `--card-foreground: 0 0% 3.9%`
   - `--popover-foreground: 0 0% 3.9%`
   - `--primary: 0 0% 9%` (deep black for buttons)
   - `--primary-foreground: 0 0% 98%`
   - `--secondary: 0 0% 96%`
   - `--secondary-foreground: 0 0% 10%`
   - `--muted: 0 0% 96%`
   - `--muted-foreground: 0 0% 46%`
   - `--accent: 0 0% 96%`
   - `--accent-foreground: 0 0% 10%`
   - `--border: 0 0% 92%`
   - `--input: 0 0% 92%`
   - `--ring: 0 0% 9%`
   - `--radius: 0.8rem`
   - Sidebar vars: `--sidebar-foreground: 0 0% 26%`, `--sidebar-border: 0 0% 92%`

2. **`.dark` variables** — Same monochrome treatment:
   - `--background: 0 0% 3.9%`
   - `--foreground: 0 0% 98%`
   - `--card: 0 0% 5%`
   - `--card-foreground: 0 0% 98%`
   - `--primary: 0 0% 98%` (inverted for dark)
   - `--primary-foreground: 0 0% 9%`
   - `--border: 0 0% 16%`
   - `--sidebar-background: 0 0% 2%`

3. **Body grid pattern** — Add a subtle 20×20px grid background via `background-image` using `linear-gradient` lines in `#f0f0f0`, disabled in dark mode.

4. Remove the "Azul Premium" comment and any blue references.

No other files affected — the theme presets in `ThemeContext` override `--primary` independently so they still work.

