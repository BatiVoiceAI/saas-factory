"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { requestOtp, verifyOtp, type AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Formulaire d'authentification PASSWORDLESS (bloc `auth`).
 *
 * Un seul composant, deux écrans :
 *  1. « Continuer avec e-mail » — saisie de l'adresse, envoi du code.
 *  2. Vérification — saisie du code à 6 chiffres (paste-friendly), renvoi avec
 *     cooldown de 60 s, ou clic sur le magic link contenu dans le même e-mail
 *     (qui aboutit via /auth/callback, sans repasser par cet écran).
 *
 * Connexion et création de compte partagent ce parcours (`shouldCreateUser`).
 * L'état est piloté par `useActionState` ; en cas de code valide l'action
 * redirige, donc pas de branche « succès » à gérer ici.
 *
 * Dépend des primitives du bloc `ui-shell` (`@/components/ui/*`).
 */

const INITIAL_STATE: AuthState = { step: "email" };

/** Aligné sur le rate limit e-mail Supabase (`max_frequency` : 1 envoi/min). */
const RESEND_COOLDOWN_S = 60;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Un instant…" : label}
    </Button>
  );
}

function ResendButton({ cooldown }: { cooldown: number }) {
  const { pending } = useFormStatus();
  const disabled = pending || cooldown > 0;
  return (
    <button
      type="submit"
      disabled={disabled}
      className="font-medium text-foreground underline-offset-4 hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-60"
    >
      {pending
        ? "Renvoi en cours…"
        : cooldown > 0
          ? `Renvoyer le code (${cooldown} s)`
          : "Renvoyer le code"}
    </button>
  );
}

export function AuthForm() {
  const [requestState, requestAction] = useActionState(
    requestOtp,
    INITIAL_STATE,
  );
  const [verifyState, verifyAction] = useActionState(verifyOtp, INITIAL_STATE);

  // « Utiliser une autre adresse » : retour local à l'écran e-mail (React 19
  // n'expose pas de reset d'`useActionState` — on dérive l'écran affiché).
  const [changingEmail, setChangingEmail] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sendCount, setSendCount] = useState(0);

  // À chaque envoi réussi (initial ou renvoi) : écran de vérification + reset
  // du cooldown de renvoi.
  useEffect(() => {
    if (requestState.step !== "verify") return;
    setChangingEmail(false);
    setSendCount((n) => n + 1);
    setCooldown(RESEND_COOLDOWN_S);
  }, [requestState]);

  // Décompte 1 s par 1 s, sans interval résiduel.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1_000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const onVerifyScreen = requestState.step === "verify" && !changingEmail;
  const email = requestState.email ?? "";

  if (!onVerifyScreen) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Continuer avec votre e-mail
          </h1>
          <p className="text-sm text-muted-foreground">
            Recevez un code de connexion à usage unique — pas de mot de passe.
            Le même écran sert à créer votre compte.
          </p>
        </div>

        <form action={requestAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              defaultValue={email}
              required
              aria-invalid={Boolean(requestState.fieldErrors?.email)}
            />
            {requestState.fieldErrors?.email?.[0] ? (
              <p className="text-sm text-destructive">
                {requestState.fieldErrors.email[0]}
              </p>
            ) : null}
          </div>

          {requestState.step === "email" && requestState.error ? (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {requestState.error}
            </p>
          ) : null}

          <SubmitButton label="Recevoir mon code" />
        </form>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Vérifiez vos e-mails
        </h1>
        <p className="text-sm text-muted-foreground">
          Un code à 6 chiffres a été envoyé à{" "}
          <span className="font-medium text-foreground">{email}</span>, ou
          cliquez sur le lien de connexion contenu dans l&apos;e-mail.
        </p>
      </div>

      <form action={verifyAction} className="space-y-4" noValidate>
        <input type="hidden" name="email" value={email} />
        <div className="space-y-2">
          <Label htmlFor="token">Code de connexion</Label>
          <Input
            id="token"
            name="token"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            required
            className="text-center text-lg tracking-widest"
            aria-invalid={Boolean(verifyState.fieldErrors?.token)}
            onChange={(event) => {
              // Paste-friendly : « 123 456 » collé devient « 123456 ».
              event.currentTarget.value = event.currentTarget.value
                .replace(/\D/g, "")
                .slice(0, 6);
            }}
          />
          {verifyState.fieldErrors?.token?.[0] ? (
            <p className="text-sm text-destructive">
              {verifyState.fieldErrors.token[0]}
            </p>
          ) : null}
        </div>

        {verifyState.error ? (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {verifyState.error}
          </p>
        ) : null}

        <SubmitButton label="Se connecter" />
      </form>

      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <form action={requestAction}>
          <input type="hidden" name="email" value={email} />
          <ResendButton cooldown={cooldown} />
        </form>
        {sendCount > 1 ? (
          <p className="text-xs">Nouveau code envoyé.</p>
        ) : null}
        {requestState.step === "verify" && requestState.error ? (
          <p role="alert" className="text-xs text-destructive">
            {requestState.error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setChangingEmail(true)}
          className="underline-offset-4 hover:underline"
        >
          Utiliser une autre adresse
        </button>
      </div>
    </div>
  );
}
