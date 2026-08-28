"use client";

import type { SaveState } from "@/features/onboarding/types";

import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

export function useAutosave<T>({
  value,
  enabled,
  save,
}: {
  value: T;
  enabled: boolean;
  save: (value: T) => Promise<{ success: boolean }>;
}) {
  const [state, setState] = useState<SaveState>("idle");
  const initialValue = useRef(JSON.stringify(value));
  const serialized = JSON.stringify(value);
  const runSave = useEffectEvent(async (nextValue: T) => {
    setState("saving");
    const result = await save(nextValue);
    setState(result.success ? "saved" : "error");
  });

  useEffect(() => {
    if (!enabled || serialized === initialValue.current) return;

    const timer = window.setTimeout(() => {
      startTransition(() => {
        void runSave(value);
      });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [enabled, serialized, value]);

  return { state, setState };
}
