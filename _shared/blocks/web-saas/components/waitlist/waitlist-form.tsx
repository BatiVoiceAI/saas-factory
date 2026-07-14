"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ui } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Formulaire de liste d'attente (bloc `waitlist`, archétype landing).
 *
 * Client Component : capture un e-mail et le POST vers `/api/waitlist`, qui
 * insère le lead (service-role) puis déclenche l'e-mail de confirmation (boucle
 * fermée — bloc notifications). État explicite `idle | loading | success | error`
 * pilotant le rendu ; retour visuel par toast (Sonner) + écran de succès.
 *
 * i18n : toute la copy vient de `lib/i18n` (`ui.waitlist.*`) — aucun littéral en
 * dur. Accessibilité : `<label>` associé au champ (masqué visuellement si le
 * design ne veut pas de label apparent), `aria-invalid`, `role="alert"` sur
 * l'erreur, `aria-busy` pendant l'envoi.
 *
 * Montable n'importe où sur la landing ; `source` identifie l'emplacement (ex.
 * "hero", "pricing") pour l'attribution du lead.
 */

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm({
  source,
  className,
}: {
  /** Provenance du lead (ex. "hero", "footer") — transmise à l'API. */
  source?: string;
  className?: string;
}) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const isLoading = status === "loading";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...(source ? { source } : {}) }),
      });

      const data = (await response
        .json()
        .catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !data?.ok) {
        setStatus("error");
        toast.error(data?.error ?? ui.waitlist.error);
        return;
      }

      setStatus("success");
      toast.success(ui.waitlist.successTitle);
    } catch {
      setStatus("error");
      toast.error(ui.waitlist.error);
    }
  }

  // État de succès : on remplace le formulaire par un message de remerciement.
  if (status === "success") {
    return (
      <div
        role="status"
        className={cn("flex flex-col gap-1 text-sm", className)}
      >
        <p className="font-medium text-foreground">{ui.waitlist.successTitle}</p>
        <p className="text-muted-foreground">{ui.waitlist.successBody}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isLoading}
      className={cn("flex w-full flex-col gap-2 sm:flex-row", className)}
      noValidate
    >
      {/* Label associé au champ — masqué visuellement (sr-only) mais lu par les
          lecteurs d'écran ; le placeholder ne remplace jamais un label. */}
      <label htmlFor={inputId} className="sr-only">
        {ui.waitlist.emailLabel}
      </label>
      <Input
        id={inputId}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        disabled={isLoading}
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (status === "error") setStatus("idle");
        }}
        aria-invalid={status === "error"}
        placeholder={ui.waitlist.emailPlaceholder}
        className="sm:flex-1"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? ui.waitlist.submitting : ui.waitlist.submit}
      </Button>
    </form>
  );
}
