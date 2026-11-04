import { useSyncExternalStore } from "react";

export type ToastTone = "default" | "success" | "error";

export type ToastInput = {
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
  tone?: ToastTone;
};

export type ToastState = ToastInput & { id: number };

let current: ToastState | null = null;
let nextId = 1;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function showToast(input: ToastInput): void {
  current = { ...input, id: nextId };
  nextId += 1;
  emit();
}

export function dismissToast(): void {
  if (current === null) return;
  current = null;
  emit();
}

export function useToastState(): ToastState | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
