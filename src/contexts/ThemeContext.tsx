import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemePreset = "default" | "underground" | "rose-garden" | "lake-view" | "sunset-glow" | "forest-whisper" | "ocean-breeze" | "lavender-dream";
export type ScaleOption = "default" | "xs" | "lg";
export type RadiusOption = "none" | "sm" | "md" | "lg" | "xl";
export type ColorMode = "light" | "dark";
export type ContentLayout = "full" | "centered";
export type SidebarMode = "default" | "icon";

interface ThemeState {
  preset: ThemePreset;
  scale: ScaleOption;
  radius: RadiusOption;
  colorMode: ColorMode;
  contentLayout: ContentLayout;
  sidebarMode: SidebarMode;
}

interface ThemeContextValue extends ThemeState {
  setPreset: (p: ThemePreset) => void;
  setScale: (s: ScaleOption) => void;
  setRadius: (r: RadiusOption) => void;
  setColorMode: (m: ColorMode) => void;
  setContentLayout: (l: ContentLayout) => void;
  setSidebarMode: (m: SidebarMode) => void;
  resetTheme: () => void;
}

const defaults: ThemeState = {
  preset: "default",
  scale: "default",
  radius: "md",
  colorMode: "light",
  contentLayout: "full",
  sidebarMode: "default",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PRESETS: ThemePreset[] = ["default", "underground", "rose-garden", "lake-view", "sunset-glow", "forest-whisper", "ocean-breeze", "lavender-dream"];

const scaleMap: Record<ScaleOption, number> = { xs: 0.875, default: 1, lg: 1.125 };
const radiusMap: Record<RadiusOption, string> = { none: "0", sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem" };

function applyToDOM(state: ThemeState) {
  const root = document.documentElement;

  // Preset
  PRESETS.forEach((p) => root.classList.remove(`theme-${p}`));
  if (state.preset !== "default") root.classList.add(`theme-${state.preset}`);

  // Color mode
  root.classList.toggle("dark", state.colorMode === "dark");

  // Scale
  root.style.setProperty("--ui-scale", String(scaleMap[state.scale]));
  root.style.fontSize = `${scaleMap[state.scale] * 16}px`;

  // Radius
  root.style.setProperty("--radius", radiusMap[state.radius]);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(() => {
    try {
      const saved = localStorage.getItem("gr_theme");
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    applyToDOM(state);
    localStorage.setItem("gr_theme", JSON.stringify(state));
  }, [state]);

  const update = (patch: Partial<ThemeState>) => setState((s) => ({ ...s, ...patch }));

  return (
    <ThemeContext.Provider
      value={{
        ...state,
        setPreset: (preset) => update({ preset }),
        setScale: (scale) => update({ scale }),
        setRadius: (radius) => update({ radius }),
        setColorMode: (colorMode) => update({ colorMode }),
        setContentLayout: (contentLayout) => update({ contentLayout }),
        setSidebarMode: (sidebarMode) => update({ sidebarMode }),
        resetTheme: () => setState(defaults),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
