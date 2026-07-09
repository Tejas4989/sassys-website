"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  length?: number;
  autoFocus?: boolean;
  className?: string;
}

export function PasscodeInput({ name, length = 6, autoFocus = false, className }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const value = digits.join("");

  function focusNext(idx: number) {
    refs.current[idx + 1]?.focus();
  }
  function focusPrev(idx: number) {
    refs.current[idx - 1]?.focus();
  }

  function handleChange(idx: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    if (digit) focusNext(idx);
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      } else {
        focusPrev(idx);
      }
    } else if (e.key === "ArrowLeft") {
      focusPrev(idx);
    } else if (e.key === "ArrowRight") {
      focusNext(idx);
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const next = Array(length).fill("");
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setDigits(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div className={cn("flex gap-3 justify-center", className)}>
      {/* Hidden input carries the full value for form submission */}
      <input type="hidden" name={name} value={value} />
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d"
          maxLength={1}
          value={d}
          autoFocus={autoFocus && i === 0}
          autoComplete="one-time-code"
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-12 h-14 text-center text-2xl font-mono font-bold rounded-xl border-2 bg-card transition-colors focus:outline-none focus:border-primary",
            d ? "border-primary/60" : "border-border"
          )}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
