"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { requestSignupOtp, setPassword, verifyOtp } from "@/lib/auth/actions";
import {
  OTP_REQUEST_INIT,
  OTP_VERIFY_INIT,
  PASSWORD_INIT,
} from "@/lib/auth/form-state";
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
 * Inscription multi-étapes (bloc `auth`, flux OTP → mot de passe) :
 *   1. e-mail       → `requestSignupOtp` envoie un code à 6 chiffres.
 *   2. code (6 cases) → `verifyOtp` vérifie et ouvre la session.
 *   3. mot de passe → `setPassword` pose le mot de passe et redirige.
 *
 * Trois Server Actions, trois `useActionState` ; l'étape affichée est dérivée
 * localement de leurs résultats. `setPassword` redirige côté serveur au succès,
 * donc pas de branche « succès » à gérer ici.
 */

/** Aligné sur le rate limit e-mail Supabase (`max_frequency` : 1 envoi/min). */
const RESEND_COOLDOWN_S = 60;

export function SignupForm() {
  const [requestState, requestAction] = useActionState(
    requestSignupOtp,
    OTP_REQUEST_INIT,
  );
  const [verifyState, verifyAction] = useActionState(verifyOtp, OTP_VERIFY_INIT);
  const [passwordState, passwordAction] = useActionState(
    setPassword,
    PASSWORD_INIT,
  );

  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [cooldown, setCooldown] = useState(0);
  const [sendCount, setSendCount] = useState(0);

  // Envoi réussi (initial ou renvoi) → écran code + reset du cooldown.
  useEffect(() => {
    if (!requestState.sent) return;
    setStep("otp");
    setSendCount((n) => n + 1);
    setCooldown(RESEND_COOLDOWN_S);
  }, [requestState]);

  // Code vérifié → écran « créer un mot de passe ».
  useEffect(() => {
    if (verifyState.verified) setStep("password");
  }, [verifyState]);

  // Décompte du cooldown de renvoi, sans interval résiduel.
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
          title={ui.auth.signup.emailTitle}
          subtitle={ui.auth.signup.emailSubtitle}
        />
        <form action={requestAction} className="space-y-4" noValidate>
          <EmailField
            defaultValue={email}
            errors={requestState.fieldErrors?.email}
          />
          <FormError message={requestState.error} />
          <SubmitButton label={ui.auth.signup.emailSubmit} />
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {ui.auth.signup.haveAccount}{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {ui.auth.signup.signInLink}
          </Link>
        </p>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="w-full space-y-6">
        <AuthHeading
          title={ui.auth.signup.otpTitle}
          subtitle={ui.auth.signup.otpSubtitle(email)}
        />
        <form action={verifyAction} className="space-y-4" noValidate>
          <input type="hidden" name="email" value={email} />
          <div className="space-y-2">
            <span className="block text-sm font-medium">
              {ui.auth.signup.codeLabel}
            </span>
            <OtpInput
              groupLabel={ui.auth.signup.codeLabel}
              invalid={Boolean(verifyState.fieldErrors?.code)}
              describedById={
                verifyState.fieldErrors?.code ? "code-error" : undefined
              }
              autoFocus
            />
            <FieldError id="code-error" messages={verifyState.fieldErrors?.code} />
          </div>
          <FormError message={verifyState.error} />
          <SubmitButton label={ui.auth.signup.otpSubmit} />
        </form>

        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <form action={requestAction}>
            <input type="hidden" name="email" value={email} />
            <ResendButton
              cooldown={cooldown}
              idleLabel={ui.auth.signup.resend}
              countdownLabel={ui.auth.signup.resendIn}
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
            {ui.auth.signup.changeEmail}
          </button>
        </div>
      </div>
    );
  }

  // step === "password"
  return (
    <div className="w-full space-y-6">
      <AuthHeading
        title={ui.auth.signup.passwordTitle}
        subtitle={ui.auth.signup.passwordSubtitle}
      />
      <form action={passwordAction} className="space-y-4" noValidate>
        <PasswordField
          id="password"
          name="password"
          label={ui.auth.signup.passwordLabel}
          autoComplete="new-password"
          hint={ui.auth.signup.passwordHint}
          errors={passwordState.fieldErrors?.password}
        />
        <PasswordField
          id="confirm"
          name="confirm"
          label={ui.auth.signup.confirmLabel}
          autoComplete="new-password"
          errors={passwordState.fieldErrors?.confirm}
        />
        <FormError message={passwordState.error} />
        <SubmitButton label={ui.auth.signup.passwordSubmit} />
      </form>
    </div>
  );
}
