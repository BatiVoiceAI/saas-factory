"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";

import { ui } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Primitives partagées des formulaires d'auth (bloc `auth`) — un seul jeu de
 * champs/boutons pour l'inscription, la connexion et la réinitialisation, afin
 * que les trois écrans restent cohérents (a11y, états, styles). Toute la copy
 * vient de `ui.auth.*` (lib/i18n) : aucun littéral en dur → l'écran suit `locale`.
 */

/** Titre + sous-titre centrés en tête d'écran d'auth. */
export function AuthHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

/** Erreur de champ (premier message zod), reliée au champ par `id` (a11y). */
export function FieldError({
  id,
  messages,
}: {
  id: string;
  messages?: string[];
}) {
  if (!messages?.[0]) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {messages[0]}
    </p>
  );
}

/** Erreur transverse du formulaire (rate limit, refus, session expirée…). */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  );
}

/** Bouton de soumission pleine largeur, avec état « pending » (`useFormStatus`). */
export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? ui.auth.submitPending : label}
    </Button>
  );
}

/** Lien « Renvoyer le code » (submit stylé en lien), avec cooldown + pending. */
export function ResendButton({
  cooldown,
  idleLabel,
  countdownLabel,
}: {
  cooldown: number;
  idleLabel: string;
  countdownLabel: (seconds: number) => string;
}) {
  const { pending } = useFormStatus();
  const disabled = pending || cooldown > 0;
  return (
    <button
      type="submit"
      disabled={disabled}
      className="font-medium text-foreground underline-offset-4 hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-60"
    >
      {pending
        ? ui.auth.submitPending
        : cooldown > 0
          ? countdownLabel(cooldown)
          : idleLabel}
    </button>
  );
}

/** Champ e-mail standard (label + input + erreur). */
export function EmailField({
  defaultValue,
  errors,
}: {
  defaultValue?: string;
  errors?: string[];
}) {
  const invalid = Boolean(errors?.length);
  return (
    <div className="space-y-2">
      <Label htmlFor="email">{ui.auth.emailLabel}</Label>
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder={ui.auth.emailPlaceholder}
        defaultValue={defaultValue}
        required
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? "email-error" : undefined}
      />
      <FieldError id="email-error" messages={errors} />
    </div>
  );
}

/** Champ mot de passe avec bascule afficher/masquer et aide optionnelle. */
export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  hint,
  errors,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: "new-password" | "current-password";
  hint?: string;
  errors?: string[];
}) {
  const { pending } = useFormStatus();
  const [visible, setVisible] = useState(false);
  const invalid = Boolean(errors?.length);
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy =
    [hintId, invalid ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={ui.auth.passwordPlaceholder}
          required
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={pending}
          aria-label={visible ? ui.auth.hidePassword : ui.auth.showPassword}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} messages={errors} />
    </div>
  );
}
