"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function OtpInput({
  value,
  onChange,
  disabled,
  autoFocus,
  className,
  "aria-label": ariaLabel = "Code SMS",
}: OtpInputProps) {
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setDigit = (index: number, char: string) => {
    const next = digits.map((d, i) => (i === index ? char : d));
    onChange(next.join("").slice(0, LENGTH));
  };

  const focusAt = (index: number) => {
    const el = refs.current[Math.max(0, Math.min(LENGTH - 1, index))];
    el?.focus();
    el?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigit(index, "");
      return;
    }
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, LENGTH - index).split("");
      const next = [...digits];
      chars.forEach((c, i) => {
        next[index + i] = c;
      });
      onChange(next.join("").slice(0, LENGTH));
      focusAt(index + chars.length - 1);
      return;
    }
    setDigit(index, cleaned);
    if (index < LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        setDigit(index - 1, "");
        focusAt(index - 1);
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    onChange(pasted);
    focusAt(Math.min(pasted.length, LENGTH) - 1);
  };

  return (
    <div
      className={cn("flex items-center justify-between gap-2", className)}
      role="group"
      aria-label={ariaLabel}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Chiffre ${index + 1}`}
          className={cn(
            "h-12 w-11 rounded-md border border-input bg-transparent text-center text-lg font-semibold tabular-nums shadow-xs outline-none transition-[color,box-shadow]",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50",
            "sm:w-12"
          )}
        />
      ))}
    </div>
  );
}
