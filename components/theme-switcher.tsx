"use client";

import { useEffect, useState } from "react";
import { Check, Palette, RefreshCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const presets = [
  { mode: "mono" as const, name: "黑白", note: "默认 · 极致克制", colors: ["#151617", "#f4f4f1", "#ffffff"] },
  { mode: "blue" as const, name: "蓝白", note: "清晰 · 专业可信", colors: ["#1d4ed8", "#e4edff", "#ffffff"] },
];

export function ThemeSwitcher() {
  const { mode, customColor, setMode, setCustomColor, resetTheme } = useTheme();
  const [draft, setDraft] = useState(customColor);

  useEffect(() => setDraft(customColor), [customColor]);

  const applyHex = () => {
    const value = draft.trim();
    if (/^#?[0-9a-fA-F]{6}$/.test(value)) {
      setCustomColor(value.startsWith("#") ? value : `#${value}`);
    } else {
      setDraft(customColor);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="切换界面样式"
          className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-[#eef0ec]"
        >
          <Palette className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[330px] p-0">
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3.5">
          <div>
            <div className="text-[13.5px] font-semibold text-ink">界面样式</div>
            <div className="mt-0.5 text-[11.5px] text-muted">切换配色，立即应用到整个工作台</div>
          </div>
          <span className="rounded-md bg-[#f0f2ee] px-2 py-1 text-[10.5px] text-muted">
            {mode === "mono" ? "黑白" : mode === "blue" ? "蓝白" : "自定义"}
          </span>
        </div>

        <div className="space-y-2 p-3">
          {presets.map((preset) => {
            const active = mode === preset.mode;
            return (
              <button
                key={preset.mode}
                onClick={() => setMode(preset.mode)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                  active ? "border-pine/35 bg-pine-soft/45" : "border-line hover:bg-[#fafbf8]"
                )}
              >
                <span className="flex -space-x-1.5">
                  {preset.colors.map((color) => (
                    <span key={color} className="size-6 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium text-ink">{preset.name}</span>
                  <span className="mt-0.5 block text-[10.5px] text-muted">{preset.note}</span>
                </span>
                {active ? <span className="flex size-5 items-center justify-center rounded-full bg-pine text-white"><Check className="size-3" /></span> : null}
              </button>
            );
          })}

          <div className={cn("rounded-xl border p-2.5 transition-colors", mode === "custom" ? "border-pine/35 bg-pine-soft/45" : "border-line")}>
            <button onClick={() => setMode("custom")} className="flex w-full items-center gap-3 text-left">
              <span className="flex -space-x-1.5">
                <span className="size-6 rounded-full border-2 border-white shadow-sm" style={{ background: customColor }} />
                <span className="size-6 rounded-full border-2 border-white bg-white shadow-sm" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium text-ink">自定义主题色</span>
                <span className="mt-0.5 block text-[10.5px] text-muted">输入任意 HEX 色值</span>
              </span>
              {mode === "custom" ? <span className="flex size-5 items-center justify-center rounded-full bg-pine text-white"><Check className="size-3" /></span> : null}
            </button>
            <div className="mt-2.5 flex items-center gap-2">
              <label
                className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-line"
                style={{ background: customColor }}
                title="选择颜色"
              >
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="选择自定义主题色"
                />
              </label>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={applyHex}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyHex();
                }}
                placeholder="#6366f1"
                className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-white px-2.5 font-mono text-[11.5px] text-ink outline-none focus:border-pine/50"
                aria-label="主题色 HEX 色值"
              />
              <button onClick={applyHex} className="h-8 shrink-0 rounded-lg bg-pine px-2.5 text-[10.5px] font-medium text-white transition-opacity hover:opacity-90">应用</button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[10px] text-muted">
          <span>仅保存在当前浏览器</span>
          <button onClick={resetTheme} className="flex items-center gap-1 font-medium text-pine hover:underline">
            <RefreshCw className="size-3" /> 恢复黑白
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
