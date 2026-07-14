import { PRODUCT_LOCALE } from "@/lib/brand";
import { env } from "@/lib/env";

/**
 * i18n — socle de langue du livrable (fondation, consommé en lecture seule).
 *
 * Le châssis est livré FR mais **i18n-ready au niveau CODE** : plus aucun
 * `lang="fr"` / `dir` / littéral FR en dur épars. Ce module est la **SOURCE
 * UNIQUE côté code** de :
 *   - `locale` — code BCP-47 de la langue du produit ;
 *   - `dir`    — sens d'écriture (`rtl` pour ar/he/fa/ur, `ltr` sinon) ;
 *   - `ui`     — dictionnaire de copy commune (au moins `fr` + `en`), pour ne
 *                plus hardcoder le FR dans les composants/emails.
 *
 * Contrat doctrinal : `CONVENTIONS.md` §12 (« le produit se génère dans la
 * langue `locale` ») + `_shared/state-schema.md` §Locale du livrable. La valeur
 * vient de `PRODUCT_LOCALE` (lib/brand.ts, sentinelle finalisée à l'étape 12,
 * écrivain unique) OU de l'env `NEXT_PUBLIC_LOCALE` (surcharge), défaut `fr-FR`.
 *
 * Écrivain unique : comme `lib/brand.ts`, `PRODUCT_LOCALE` est finalisé UNE fois
 * au walking skeleton — les blocs en fan-out **consomment** ce module (locale,
 * dir, ui), ils ne re-résolvent jamais la langue eux-mêmes.
 */

/** Langues à écriture de droite à gauche → `dir="rtl"` + miroir de layout. */
const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur"]);

/**
 * Résout la langue effective : l'env `NEXT_PUBLIC_LOCALE` (surcharge, ex.
 * prévisualisation multi-langue) prime, sinon `PRODUCT_LOCALE`, sinon `fr-FR`.
 */
function resolveLocale(): string {
  const override = env.NEXT_PUBLIC_LOCALE?.trim();
  if (override) return override;
  const fromBrand = PRODUCT_LOCALE?.trim();
  if (fromBrand) return fromBrand;
  return "fr-FR";
}

/** Extrait le sous-tag de langue d'un code BCP-47 (`fr-FR` → `fr`). */
function languageOf(bcp47: string): string {
  const [language] = bcp47.toLowerCase().split(/[-_]/);
  return language || "fr";
}

/** Direction d'écriture d'une langue donnée. */
function directionOf(language: string): "ltr" | "rtl" {
  return RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
}

/** Langue du livrable, code BCP-47 (ex. `fr-FR`). */
export const locale = resolveLocale();

/** Sous-tag de langue (ex. `fr`) — clé du dictionnaire. */
export const language = languageOf(locale);

/** Sens d'écriture pour `<html dir>` — `rtl` pour ar/he/fa/ur. */
export const dir: "ltr" | "rtl" = directionOf(language);

/**
 * Forme OpenGraph de la locale (`fr-FR` → `fr_FR`) pour `metadata.openGraph`.
 * cf. `app/layout.tsx` (`og:locale`) et l'étape 16 (SEO — `hreflang`/`lang`).
 */
export const ogLocale = locale.replace(/-/g, "_");

/**
 * Dictionnaire de copy UI commune. Placeholders de **langue de travail** : le
 * build (étape 12) régénère/traduit la copy finale dans `locale`, mais dès la
 * livraison les composants passent par ces clés au lieu de coder du FR en dur.
 * Étendre par domaine au besoin (garder les clés stables entre langues).
 */
export type UIStrings = {
  /** Actions transverses (boutons, liens). */
  actions: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    continue: string;
    back: string;
    confirm: string;
    close: string;
    signIn: string;
    signOut: string;
  };
  /** États d'écran génériques (chargement, vide, erreur, succès). */
  states: {
    loading: string;
    empty: string;
    error: string;
    saved: string;
  };
  /** Barre supérieure de la surface authentifiée (menu utilisateur). */
  nav: {
    /** Label a11y du déclencheur du menu utilisateur. */
    userMenu: string;
    /** Repli quand l'e-mail de l'utilisateur est absent. */
    account: string;
  };
  /** Copy des emails transactionnels (bloc `notifications`). */
  email: {
    /** Objet de l'email de bienvenue. */
    welcomeSubject: string;
    /** Titre (le prénom déjà résolu est passé en argument). */
    welcomeHeading: (greetingName: string) => string;
    /** Corps principal, paramétré par le nom du produit. */
    welcomeBody: (productName: string) => string;
    /** Libellé du bouton d'action. */
    welcomeCta: string;
    /** Ligne « si vous n'êtes pas à l'origine de cette inscription… ». */
    welcomeIgnore: string;
    /** Signature de bas d'email. */
    welcomeSignoff: (productName: string) => string;
    /** Salutation de repli quand aucun prénom n'est fourni. */
    greetingFallback: string;
  };
  /** Copy du bloc `waitlist` (archétype landing) : formulaire + email de confirmation. */
  waitlist: {
    /** Label du champ e-mail (accessibilité — toujours présent, même masqué visuellement). */
    emailLabel: string;
    /** Placeholder du champ e-mail. */
    emailPlaceholder: string;
    /** Libellé du bouton d'inscription (état idle). */
    submit: string;
    /** Libellé du bouton pendant l'envoi (état loading). */
    submitting: string;
    /** Titre affiché après inscription (écran de succès + toast). */
    successTitle: string;
    /** Message de remerciement affiché après inscription (état success). */
    successBody: string;
    /** Message d'erreur générique (état error / toast). */
    error: string;
    /** Objet de l'email de confirmation. */
    confirmationSubject: string;
    /** Titre de l'email de confirmation. */
    confirmationHeading: string;
    /** Corps de l'email de confirmation, paramétré par le nom du produit. */
    confirmationBody: (productName: string) => string;
    /** Signature de bas d'email. */
    confirmationSignoff: (productName: string) => string;
  };
  /**
   * Copy du bloc `auth` (flux OTP → mot de passe). Toute la surface rendue des
   * écrans de connexion / inscription / réinitialisation passe par ces clés —
   * aucun littéral en dur dans `components/auth/*`, pour que l'écran suive
   * `locale` (FR au défaut, EN pour un livrable `en-US`).
   */
  auth: {
    /** Libellé du champ e-mail (a11y — toujours présent). */
    emailLabel: string;
    /** Placeholder du champ e-mail. */
    emailPlaceholder: string;
    /** Placeholder du champ mot de passe. */
    passwordPlaceholder: string;
    /** Label du bouton « afficher le mot de passe » (a11y). */
    showPassword: string;
    /** Label du bouton « masquer le mot de passe » (a11y). */
    hidePassword: string;
    /** Libellé de tout bouton d'auth pendant l'envoi (état loading). */
    submitPending: string;
    /** Label a11y d'une case de code : `(rang, total)`. */
    codeDigitLabel: (index: number, total: number) => string;
    /** Inscription multi-étapes : e-mail → code à 6 chiffres → mot de passe. */
    signup: {
      emailTitle: string;
      emailSubtitle: string;
      emailSubmit: string;
      otpTitle: string;
      otpSubtitle: (email: string) => string;
      codeLabel: string;
      otpSubmit: string;
      passwordTitle: string;
      passwordSubtitle: string;
      passwordLabel: string;
      confirmLabel: string;
      passwordSubmit: string;
      /** Aide sous le champ mot de passe (règles de force). */
      passwordHint: string;
      resend: string;
      resendIn: (seconds: number) => string;
      resent: string;
      changeEmail: string;
      haveAccount: string;
      signInLink: string;
    };
    /** Connexion : e-mail + mot de passe. */
    login: {
      title: string;
      subtitle: string;
      passwordLabel: string;
      submit: string;
      forgot: string;
      noAccount: string;
      signUpLink: string;
    };
    /** Mot de passe oublié : e-mail → code → nouveau mot de passe. */
    reset: {
      emailTitle: string;
      emailSubtitle: string;
      emailSubmit: string;
      backToLogin: string;
      title: string;
      subtitle: (email: string) => string;
      codeLabel: string;
      passwordLabel: string;
      confirmLabel: string;
      submit: string;
      resend: string;
      resendIn: (seconds: number) => string;
      changeEmail: string;
    };
    /** Messages d'erreur (validation zod + refus Supabase, sans fuite d'info). */
    errors: {
      emailInvalid: string;
      code: string;
      codeIncorrect: string;
      passwordShort: string;
      passwordLong: string;
      passwordLetter: string;
      passwordNumber: string;
      passwordMismatch: string;
      passwordWeak: string;
      passwordRequired: string;
      sendFailed: string;
      rateLimit: string;
      accessDenied: string;
      invalidCredentials: string;
      sessionExpired: string;
      generic: string;
      oauthFailed: string;
    };
  };
};

const fr: UIStrings = {
  actions: {
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    continue: "Continuer",
    back: "Retour",
    confirm: "Confirmer",
    close: "Fermer",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
  },
  states: {
    loading: "Chargement…",
    empty: "Rien à afficher pour le moment.",
    error: "Une erreur est survenue. Veuillez réessayer.",
    saved: "Enregistré.",
  },
  nav: {
    userMenu: "Menu utilisateur",
    account: "Compte",
  },
  email: {
    welcomeSubject: "Bienvenue à bord 🎉",
    welcomeHeading: (greetingName) => `Bienvenue, ${greetingName} 👋`,
    welcomeBody: (productName) =>
      `Merci d'avoir rejoint ${productName}. Votre compte est prêt — connectez-vous et commencez à explorer.`,
    welcomeCta: "Ouvrir mon tableau de bord",
    welcomeIgnore:
      "Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet e-mail.",
    welcomeSignoff: (productName) => `— L'équipe ${productName}`,
    greetingFallback: "à vous",
  },
  waitlist: {
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "vous@exemple.com",
    submit: "Rejoindre la liste",
    submitting: "Inscription…",
    successTitle: "Vous êtes inscrit·e 🎉",
    successBody:
      "Merci ! Nous vous préviendrons par e-mail dès l'ouverture.",
    error: "L'inscription a échoué. Veuillez réessayer.",
    confirmationSubject: "Vous êtes sur la liste 🎉",
    confirmationHeading: "Bienvenue sur la liste d'attente 👋",
    confirmationBody: (productName) =>
      `Merci de votre intérêt pour ${productName}. Vous êtes bien inscrit·e — nous vous préviendrons en priorité dès l'ouverture.`,
    confirmationSignoff: (productName) => `— L'équipe ${productName}`,
  },
  auth: {
    emailLabel: "E-mail",
    emailPlaceholder: "vous@exemple.com",
    passwordPlaceholder: "••••••••",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    submitPending: "Un instant…",
    codeDigitLabel: (index, total) => `Chiffre ${index} sur ${total}`,
    signup: {
      emailTitle: "Créer votre compte",
      emailSubtitle:
        "Saisissez votre e-mail : nous vous envoyons un code de vérification à 6 chiffres.",
      emailSubmit: "Recevoir mon code",
      otpTitle: "Vérifiez vos e-mails",
      otpSubtitle: (email) =>
        `Nous avons envoyé un code à 6 chiffres à ${email}.`,
      codeLabel: "Code de vérification",
      otpSubmit: "Vérifier le code",
      passwordTitle: "Créer un mot de passe",
      passwordSubtitle:
        "Votre e-mail est vérifié. Choisissez un mot de passe pour finaliser votre compte.",
      passwordLabel: "Mot de passe",
      confirmLabel: "Confirmer le mot de passe",
      passwordSubmit: "Créer mon compte",
      passwordHint: "Au moins 8 caractères, avec une lettre et un chiffre.",
      resend: "Renvoyer le code",
      resendIn: (seconds) => `Renvoyer le code (${seconds} s)`,
      resent: "Nouveau code envoyé.",
      changeEmail: "Utiliser une autre adresse",
      haveAccount: "Vous avez déjà un compte ?",
      signInLink: "Se connecter",
    },
    login: {
      title: "Se connecter",
      subtitle: "Connectez-vous avec votre e-mail et votre mot de passe.",
      passwordLabel: "Mot de passe",
      submit: "Se connecter",
      forgot: "Mot de passe oublié ?",
      noAccount: "Pas encore de compte ?",
      signUpLink: "Créer un compte",
    },
    reset: {
      emailTitle: "Mot de passe oublié",
      emailSubtitle:
        "Saisissez votre e-mail : nous vous envoyons un code pour définir un nouveau mot de passe.",
      emailSubmit: "Recevoir mon code",
      backToLogin: "Retour à la connexion",
      title: "Nouveau mot de passe",
      subtitle: (email) =>
        `Saisissez le code envoyé à ${email}, puis votre nouveau mot de passe.`,
      codeLabel: "Code de vérification",
      passwordLabel: "Nouveau mot de passe",
      confirmLabel: "Confirmer le mot de passe",
      submit: "Réinitialiser le mot de passe",
      resend: "Renvoyer le code",
      resendIn: (seconds) => `Renvoyer le code (${seconds} s)`,
      changeEmail: "Utiliser une autre adresse",
    },
    errors: {
      emailInvalid: "Adresse e-mail invalide.",
      code: "Le code contient 6 chiffres.",
      codeIncorrect:
        "Code incorrect ou expiré. Vérifiez la saisie ou demandez un nouveau code.",
      passwordShort: "Le mot de passe doit contenir au moins 8 caractères.",
      passwordLong: "Le mot de passe ne peut pas dépasser 72 caractères.",
      passwordLetter: "Le mot de passe doit contenir au moins une lettre.",
      passwordNumber: "Le mot de passe doit contenir au moins un chiffre.",
      passwordMismatch: "Les mots de passe ne correspondent pas.",
      passwordWeak:
        "Ce mot de passe est trop faible. Choisissez-en un plus robuste.",
      passwordRequired: "Saisissez votre mot de passe.",
      sendFailed: "L'envoi du code a échoué. Vérifiez l'adresse et réessayez.",
      rateLimit:
        "Trop de demandes rapprochées. Patientez une minute avant de réessayer.",
      accessDenied:
        "Cette adresse n'est pas autorisée à accéder à cet outil. Demandez une invitation à l'administrateur.",
      invalidCredentials: "E-mail ou mot de passe incorrect.",
      sessionExpired:
        "Votre session a expiré. Reprenez la vérification depuis le début.",
      generic: "Une erreur est survenue. Veuillez réessayer.",
      oauthFailed: "La connexion a échoué ou a expiré. Réessayez.",
    },
  },
};

const en: UIStrings = {
  actions: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    continue: "Continue",
    back: "Back",
    confirm: "Confirm",
    close: "Close",
    signIn: "Sign in",
    signOut: "Sign out",
  },
  states: {
    loading: "Loading…",
    empty: "Nothing to show yet.",
    error: "Something went wrong. Please try again.",
    saved: "Saved.",
  },
  nav: {
    userMenu: "User menu",
    account: "Account",
  },
  email: {
    welcomeSubject: "Welcome aboard 🎉",
    welcomeHeading: (greetingName) => `Welcome, ${greetingName} 👋`,
    welcomeBody: (productName) =>
      `Thanks for signing up for ${productName}. Your account is ready — jump in and start exploring.`,
    welcomeCta: "Open your dashboard",
    welcomeIgnore:
      "If you didn't create this account, you can safely ignore this email.",
    welcomeSignoff: (productName) => `— The ${productName} team`,
    greetingFallback: "there",
  },
  waitlist: {
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    submit: "Join the list",
    submitting: "Joining…",
    successTitle: "You're on the list 🎉",
    successBody: "Thanks! We'll email you as soon as we open up.",
    error: "Something went wrong. Please try again.",
    confirmationSubject: "You're on the list 🎉",
    confirmationHeading: "Welcome to the waitlist 👋",
    confirmationBody: (productName) =>
      `Thanks for your interest in ${productName}. You're on the list — we'll give you priority access the moment we open up.`,
    confirmationSignoff: (productName) => `— The ${productName} team`,
  },
  auth: {
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
    showPassword: "Show password",
    hidePassword: "Hide password",
    submitPending: "One moment…",
    codeDigitLabel: (index, total) => `Digit ${index} of ${total}`,
    signup: {
      emailTitle: "Create your account",
      emailSubtitle:
        "Enter your email and we'll send you a 6-digit verification code.",
      emailSubmit: "Send my code",
      otpTitle: "Check your email",
      otpSubtitle: (email) => `We sent a 6-digit code to ${email}.`,
      codeLabel: "Verification code",
      otpSubmit: "Verify code",
      passwordTitle: "Create a password",
      passwordSubtitle:
        "Your email is verified. Choose a password to finish setting up your account.",
      passwordLabel: "Password",
      confirmLabel: "Confirm password",
      passwordSubmit: "Create account",
      passwordHint: "At least 8 characters, with a letter and a number.",
      resend: "Resend code",
      resendIn: (seconds) => `Resend code (${seconds}s)`,
      resent: "New code sent.",
      changeEmail: "Use a different address",
      haveAccount: "Already have an account?",
      signInLink: "Sign in",
    },
    login: {
      title: "Sign in",
      subtitle: "Sign in with your email and password.",
      passwordLabel: "Password",
      submit: "Sign in",
      forgot: "Forgot password?",
      noAccount: "No account yet?",
      signUpLink: "Create one",
    },
    reset: {
      emailTitle: "Forgot password",
      emailSubtitle:
        "Enter your email and we'll send you a code to set a new password.",
      emailSubmit: "Send my code",
      backToLogin: "Back to sign in",
      title: "New password",
      subtitle: (email) =>
        `Enter the code sent to ${email}, then your new password.`,
      codeLabel: "Verification code",
      passwordLabel: "New password",
      confirmLabel: "Confirm password",
      submit: "Reset password",
      resend: "Resend code",
      resendIn: (seconds) => `Resend code (${seconds}s)`,
      changeEmail: "Use a different address",
    },
    errors: {
      emailInvalid: "Invalid email address.",
      code: "The code is 6 digits.",
      codeIncorrect:
        "Incorrect or expired code. Check it or request a new one.",
      passwordShort: "Password must be at least 8 characters.",
      passwordLong: "Password can't be longer than 72 characters.",
      passwordLetter: "Password must contain at least one letter.",
      passwordNumber: "Password must contain at least one number.",
      passwordMismatch: "Passwords don't match.",
      passwordWeak: "That password is too weak. Please choose a stronger one.",
      passwordRequired: "Enter your password.",
      sendFailed: "We couldn't send the code. Check the address and try again.",
      rateLimit: "Too many attempts. Wait a minute before trying again.",
      accessDenied:
        "This address isn't allowed to access this tool. Ask an administrator for an invitation.",
      invalidCredentials: "Incorrect email or password.",
      sessionExpired: "Your session expired. Please start the verification again.",
      generic: "Something went wrong. Please try again.",
      oauthFailed: "Sign-in failed or expired. Please try again.",
    },
  },
};

/**
 * Dictionnaires disponibles, indexés par sous-tag de langue. Le châssis fournit
 * `fr` (langue de travail par défaut) + `en` ; un build dans une autre langue
 * ajoute son dictionnaire ou retombe sur `fr`.
 */
const dictionaries: Record<string, UIStrings> = { fr, en };

/** Retourne le dictionnaire d'une langue, avec repli sur `fr` (défaut châssis). */
export function getStrings(lang: string = language): UIStrings {
  return dictionaries[languageOf(lang)] ?? fr;
}

/** Copy UI résolue pour la langue du produit — à consommer dans les composants. */
export const ui: UIStrings = getStrings(language);
