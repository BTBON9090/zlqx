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
      setCustomColor: (hex) => setState({ mode: "custom", customColor: clampHex(hex) }),
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
