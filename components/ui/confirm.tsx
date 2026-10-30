"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "default";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((next) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setOptions(next);
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={!!options} onOpenChange={(open) => !open && settle(false)}>
        <DialogContent size="sm" className="p-0" hideClose>
          <div className="px-6 pb-5 pt-6">
            <div className={`flex size-10 items-center justify-center rounded-xl ${options?.tone === "danger" ? "bg-signal-soft text-danger" : "bg-pine-soft text-pine"}`}>
              <AlertTriangle className="size-4.5" />
            </div>
            <h2 className="mt-4 text-[16px] font-semibold tracking-[-0.02em] text-ink">{options?.title}</h2>
            <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-5 text-muted">{options?.description}</p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => settle(false)}>{options?.cancelText ?? "取消"}</Button>
            <Button variant={options?.tone === "danger" ? "danger" : "primary"} onClick={() => settle(true)}>
              {options?.confirmText ?? "确认"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context;
}
