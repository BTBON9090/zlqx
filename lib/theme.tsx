"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "mono" | "blue" | "custom";

interface ThemeState {
  mode: ThemeMode;
  customColor: string;
}

interface ThemeContextValue extends ThemeState {
  setMode: (mode: ThemeMode) => void;
  setCustomColor: (hex: string) => void;
  resetTheme: () => void;
}

const STORAGE_KEY = "zhipin-qianxun-theme";
const DEFAULT_COLOR = "#6366f1";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function clampHex(hex: string) {
  const value = hex.replace("#", "").trim();
  if (value.length === 3) return `#${value.split("").map((c) => c + c).join("")}`.toLowerCase();
  if (value.length === 6) return `#${value}`.toLowerCase();
  return DEFAULT_COLOR;
}

function hexToHsl(hex: string) {
  const normalized = clampHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number) {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Keep custom brand colors dark enough for white button labels. */
export function normalizeThemeColor(hex: string) {
  const safe = clampHex(hex);
  const { h, s, l } = hexToHsl(safe);
  if (l > 46) return hslToHex(h, Math.min(s, 82), 44);
  if (l < 16) return hslToHex(h, s, 22);
  return safe;
}

function applyTheme(state: ThemeState) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = state.mode;
  if (state.mode === "custom") {
    root.style.setProperty("--custom-color", state.customColor);
  } else {
    root.style.removeProperty("--custom-color");
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", state.mode === "blue" ? "#0a1f44" : state.mode === "custom" ? state.customColor : "#111111");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState>({ mode: "mono", customColor: DEFAULT_COLOR });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ThemeState>;
        if (parsed.mode === "blue" || parsed.mode === "custom" || parsed.mode === "mono") {
          setState({
            mode: parsed.mode,
            customColor: parsed.customColor ? clampHex(parsed.customColor) : DEFAULT_COLOR,
          });
        }
      }
    } catch {
      // Ignore invalid local preferences.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors.
    }
  }, [state, hydrated]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...state,
      setMode: (mode) => setState((prev) => ({ ...prev, mode })),
      setCustomColor: (hex) => setState({ mode: "custom", customColor: normalizeThemeColor(hex) }),
      resetTheme: () => setState({ mode: "mono", customColor: DEFAULT_COLOR }),
    }),
    [state]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
