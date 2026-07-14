"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { requestPasswordReset, resetPassword } from "@/lib/auth/actions";
import { OTP_REQUEST_INIT, RESET_INIT } from "@/lib/auth/form-state";
import { ui } from "@/lib/i18n";
import { OtpInput } from "@/components/auth/otp-input";
import {
  AuthHeading,
  EmailField,
  FieldError,
  FormError,
  PasswordField,
  ResendButton,
  SubmitButton,
} from "@/components/auth/fields";

/**
 * Mot de passe oublié (bloc `auth`, flux OTP → mot de passe) :
 *   1. e-mail → `requestPasswordReset` envoie un code (réponse anti-énumération).
 *   2. code (6 cases) + nouveau mot de passe → `resetPassword` vérifie le code,
 *      pose le nouveau mot de passe et redirige (action terminale).
 */

/** Aligné sur le rate limit e-mail Supabase (`max_frequency` : 1 envoi/min). */
const RESEND_COOLDOWN_S = 60;

export function ResetForm() {
  const [requestState, requestAction] = useActionState(
    requestPasswordReset,
    OTP_REQUEST_INIT,
  );
  const [resetState, resetAction] = useActionState(resetPassword, RESET_INIT);

  const [step, setStep] = useState<"email" | "reset">("email");
  const [cooldown, setCooldown] = useState(0);
  const [sendCount, setSendCount] = useState(0);

  // Envoi réussi (initial ou renvoi) → écran code + nouveau mot de passe.
  useEffect(() => {
    if (!requestState.sent) return;
    setStep("reset");
    setSendCount((n) => n + 1);
    setCooldown(RESEND_COOLDOWN_S);
  }, [requestState]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1_000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const email = requestState.email;

  if (step === "email") {
    return (
      <div className="w-full space-y-6">
        <AuthHeading
          title={ui.auth.reset.emailTitle}
          subtitle={ui.auth.reset.emailSubtitle}
        />
        <form action={requestAction} className="space-y-4" noValidate>
          <EmailField
            defaultValue={email}
            errors={requestState.fieldErrors?.email}
          />
          <FormError message={requestState.error} />
          <SubmitButton label={ui.auth.reset.emailSubmit} />
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {ui.auth.reset.backToLogin}
          </Link>
        </p>
      </div>
    );
  }

  // step === "reset"
  return (
    <div className="w-full space-y-6">
      <AuthHeading
        title={ui.auth.reset.title}
        subtitle={ui.auth.reset.subtitle(email)}
      />
      <form action={resetAction} className="space-y-4" noValidate>
        <input type="hidden" name="email" value={email} />
        <div className="space-y-2">
          <span className="block text-sm font-medium">
            {ui.auth.reset.codeLabel}
          </span>
          <OtpInput
            groupLabel={ui.auth.reset.codeLabel}
            invalid={Boolean(resetState.fieldErrors?.code)}
            describedById={
              resetState.fieldErrors?.code ? "code-error" : undefined
            }
            autoFocus
          />
          <FieldError id="code-error" messages={resetState.fieldErrors?.code} />
        </div>
        <PasswordField
          id="password"
          name="password"
          label={ui.auth.reset.passwordLabel}
          autoComplete="new-password"
          hint={ui.auth.signup.passwordHint}
          errors={resetState.fieldErrors?.password}
        />
        <PasswordField
          id="confirm"
          name="confirm"
          label={ui.auth.reset.confirmLabel}
          autoComplete="new-password"
          errors={resetState.fieldErrors?.confirm}
        />
        <FormError message={resetState.error} />
        <SubmitButton label={ui.auth.reset.submit} />
      </form>

      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <form action={requestAction}>
          <input type="hidden" name="email" value={email} />
          <ResendButton
            cooldown={cooldown}
            idleLabel={ui.auth.reset.resend}
            countdownLabel={ui.auth.reset.resendIn}
          />
        </form>
        {sendCount > 1 ? (
          <p className="text-xs">{ui.auth.signup.resent}</p>
        ) : null}
        <button
          type="button"
          onClick={() => setStep("email")}
          className="underline-offset-4 hover:underline"
        >
          {ui.auth.reset.changeEmail}
        </button>
      </div>
    </div>
  );
}
