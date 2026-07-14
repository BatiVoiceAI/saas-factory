"use client";

import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from "react";
import { useFormStatus } from "react-dom";
import { ui } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Saisie d'un code OTP en cases séparées (bloc `auth`).
 *
 * `length` cases (défaut 6), chacune un chiffre. La valeur jointe est portée par
 * un `<input type="hidden" name={name}>` pour la soumission du formulaire (les
 * Server Actions lisent `formData.get(name)`).
 *
 * A11y & confort : auto-avance à la frappe, Retour arrière recule, flèches
 * gauche/droite naviguent, un collage (« 123 456 ») distribue les chiffres.
 * Chaque case a un `aria-label` « Chiffre n sur N » ; le groupe expose
 * `aria-label` via `groupLabel`. Les cases se désactivent pendant la soumission
 * (`useFormStatus`).
 */

type OtpInputProps = {
  /** Nom du champ hidden soumis (défaut « code »). */
  name?: string;
  /** Nombre de cases (défaut 6). */
  length?: number;
  /** Étiquette accessible du groupe de cases. */
  groupLabel: string;
  /** Marque les cases en erreur (aria-invalid + style). */
  invalid?: boolean;
  /** id de l'élément décrivant l'erreur (aria-describedby). */
  describedById?: string;
  /** Focus la première case au montage. */
  autoFocus?: boolean;
};

export function OtpInput({
  name = "code",
  length = 6,
  groupLabel,
  invalid = false,
  describedById,
  autoFocus = false,
}: OtpInputProps) {
  const { pending } = useFormStatus();
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const value = digits.join("");

  function focusAt(index: number) {
    const el = refs.current[Math.max(0, Math.min(index, length - 1))];
    el?.focus();
    el?.select();
  }

  function setDigitAt(index: number, digit: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
  }

  function handleChange(index: number, raw: string) {
    // On ne garde que le dernier chiffre saisi (permet d'écraser une case pleine).
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigitAt(index, digit);
    if (digit) focusAt(index + 1);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      if (digits[index]) {
        setDigitAt(index, "");
        return;
      }
      // Case déjà vide : on recule et on efface la précédente.
      event.preventDefault();
      setDigitAt(index - 1, "");
      focusAt(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < pasted.length && index + i < length; i += 1) {
        next[index + i] = pasted[i] ?? "";
      }
      return next;
    });
    focusAt(index + pasted.length);
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label={groupLabel}>
      <input type="hidden" name={name} value={value} />
      {digits.map((digit, index) => (
        <input
          // eslint-disable-next-line react/no-array-index-key -- index = position stable de la case
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={pending}
          autoFocus={autoFocus && index === 0}
          aria-label={ui.auth.codeDigitLabel(index + 1, length)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedById}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.currentTarget.select()}
          className={cn(
            "h-12 w-full min-w-0 rounded-md border border-input bg-background text-center text-lg font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive focus-visible:ring-destructive",
          )}
        />
      ))}
    </div>
  );
}
