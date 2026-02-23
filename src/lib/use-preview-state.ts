import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { decodePreviewState } from "./state-codec";

let _vars: Record<string, unknown> | null = null;

function getVars(): Record<string, unknown> {
  if (_vars !== null) return _vars;
  if (typeof window === "undefined") {
    _vars = {};
    return _vars;
  }
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("__pp");
  if (!encoded) {
    _vars = {};
    return _vars;
  }
  const snapshot = decodePreviewState(encoded);
  _vars = snapshot?.vars ?? {};
  return _vars;
}

/**
 * Drop-in replacement for `useState` that reads its initial value from
 * page-preview state when running inside a preview iframe.
 *
 * ```ts
 * import { usePreviewState } from "page-preview/lib";
 *
 * // In normal mode: behaves exactly like useState(0)
 * // In preview mode: reads initial value from variant state.vars.currentStep
 * const [currentStep, setCurrentStep] = usePreviewState("currentStep", 0);
 * ```
 *
 * Story file:
 * ```ts
 * variants: [
 *   { id: "step-2", label: "Countries", state: { vars: { currentStep: 2 } } },
 * ]
 * ```
 */
export function usePreviewState<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const vars = getVars();
  const initial = key in vars ? (vars[key] as T) : defaultValue;
  return useState<T>(initial);
}
