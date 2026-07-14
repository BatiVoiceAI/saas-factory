"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInWithPassword } from "@/lib/auth/actions";
import { LOGIN_INIT } from "@/lib/auth/form-state";
import { ui } from "@/lib/i18n";
import {
  AuthHeading,
  EmailField,
  FormError,
  PasswordField,
  SubmitButton,
} from "@/components/auth/fields";

/**
 * Connexion e-mail + mot de passe (bloc `auth`). Une seule étape :
 * `signInWithPassword` redirige côté serveur au succès. Lien « mot de passe
 * oublié » → /reset ; lien « créer un compte » → /signup.
 */
export function LoginForm() {
  const [state, action] = useActionState(signInWithPassword, LOGIN_INIT);

  return (
    <div className="w-full space-y-6">
      <AuthHeading title={ui.auth.login.title} subtitle={ui.auth.login.subtitle} />

      <form action={action} className="space-y-4" noValidate>
        <EmailField errors={state.fieldErrors?.email} />
        <PasswordField
          id="password"
          name="password"
          label={ui.auth.login.passwordLabel}
          autoComplete="current-password"
          errors={state.fieldErrors?.password}
        />
        <div className="-mt-1 text-right">
          <Link
            href="/reset"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {ui.auth.login.forgot}
          </Link>
        </div>
        <FormError message={state.error} />
        <SubmitButton label={ui.auth.login.submit} />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {ui.auth.login.noAccount}{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {ui.auth.login.signUpLink}
        </Link>
      </p>
    </div>
  );
}
