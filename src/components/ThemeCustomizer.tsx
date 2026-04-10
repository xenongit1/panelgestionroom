import { Paintbrush, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme, type ThemePreset, type ScaleOption, type RadiusOption, type ColorMode, type ContentLayout, type SidebarMode } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const presets: { value: ThemePreset; label: string; color: string }[] = [
  { value: "default", label: "Default", color: "hsl(217 91% 60%)" },
  { value: "underground", label: "Underground", color: "hsl(142 71% 45%)" },
  { value: "rose-garden", label: "Rose Garden", color: "hsl(347 77% 50%)" },
  { value: "lake-view", label: "Lake View", color: "hsl(192 91% 36%)" },
  { value: "sunset-glow", label: "Sunset Glow", color: "hsl(25 95% 53%)" },
  { value: "forest-whisper", label: "Forest Whisper", color: "hsl(160 84% 39%)" },
  { value: "ocean-breeze", label: "Ocean Breeze", color: "hsl(217 91% 60%)" },
  { value: "lavender-dream", label: "Lavender Dream", color: "hsl(258 90% 66%)" },
];

function SegmentedControl<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ThemeCustomizer() {
  const theme = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Paintbrush className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Theme Customizer</h4>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={theme.resetTheme}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>

          <Separator />

          {/* Preset */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Theme Preset</label>
            <Select value={theme.preset} onValueChange={(v) => theme.setPreset(v as ThemePreset)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      {p.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scale */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Scale</label>
            <SegmentedControl
              options={[
                { value: "xs" as ScaleOption, label: "XS" },
                { value: "default" as ScaleOption, label: "Default" },
                { value: "lg" as ScaleOption, label: "LG" },
              ]}
              value={theme.scale}
              onChange={theme.setScale}
            />
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Radius</label>
            <SegmentedControl
              options={[
                { value: "none" as RadiusOption, label: "None" },
                { value: "sm" as RadiusOption, label: "SM" },
                { value: "md" as RadiusOption, label: "MD" },
                { value: "lg" as RadiusOption, label: "LG" },
                { value: "xl" as RadiusOption, label: "XL" },
              ]}
              value={theme.radius}
              onChange={theme.setRadius}
            />
          </div>

          {/* Color Mode */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Color Mode</label>
            <SegmentedControl
              options={[
                { value: "light" as ColorMode, label: "Light" },
                { value: "dark" as ColorMode, label: "Dark" },
              ]}
              value={theme.colorMode}
              onChange={theme.setColorMode}
            />
          </div>

          {/* Content Layout */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Content Layout</label>
            <SegmentedControl
              options={[
                { value: "full" as ContentLayout, label: "Full" },
                { value: "centered" as ContentLayout, label: "Centered" },
              ]}
              value={theme.contentLayout}
              onChange={theme.setContentLayout}
            />
          </div>

          {/* Sidebar Mode */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Sidebar Mode</label>
            <SegmentedControl
              options={[
                { value: "default" as SidebarMode, label: "Default" },
                { value: "icon" as SidebarMode, label: "Icon" },
              ]}
              value={theme.sidebarMode}
              onChange={theme.setSidebarMode}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
