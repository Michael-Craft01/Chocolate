// Legacy shim — maps old AIAssistButton prop `onRefined` to ElaborateButton's `onElaborated`.
// Kept for backward compatibility; migrate call sites to import ElaborateButton directly.
"use client";

import { ElaborateButton } from './ElaborateButton';

interface AIAssistButtonProps {
  field: string;
  currentValue: string;
  context?: Record<string, unknown>;
  onRefined: (value: string) => void;
  className?: string;
}

export function AIAssistButton({ onRefined, ...rest }: AIAssistButtonProps) {
  return <ElaborateButton {...rest} onElaborated={onRefined} />;
}
