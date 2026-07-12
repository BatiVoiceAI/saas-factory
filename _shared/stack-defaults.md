# Stack par défaut (bloc partagé — lu à la demande par 09-architecture / 11-project-setup / feature-dev)

Choix techniques éprouvés, réutilisés d'un projet à l'autre. Le CTO-agent s'appuie dessus ; il ne demande jamais ces choix à l'utilisateur. Les **accès** à ces outils sont connectés **une fois** via `infra-setup` (config globale `~/.saas-factory/`).

**Principe open-source vs manage.** Là où les deux existent vraiment, on **laisse le choix** : défaut **manage** (le plus simple, zéro-ops, déjà validé), mais l'alternative **open-source / self-host** est **offerte à `infra-setup`** via un choix de **PROFIL** posé une fois (voir ci-dessous). Ce profil pose la posture par défaut ; chaque service forké reste **swappable individuellement**. **Pour tout basculer d'un coup → change le PROFIL ici**, ou surcharge une ligne. Certains besoins sont honnêtement **provider-only** (marqués tels quels) : pas d'auto-hébergement pertinent pour le besoin cœur.

| Besoin | Manage (défaut) | Open-source / self-host |
|---|---|---|
| Web full-stack | Next.js 15 (App Router) + TypeScript strict | *(déjà OSS — pas de fork)* |
| Repo + CI | GitHub (+ Actions) | Gitea/Forgejo ou GitLab self-host |
| BDD + Auth | Supabase cloud (Postgres, RLS, Auth) | Supabase self-hosted (Docker/VPS) · Neon |
| Hébergement du SaaS | Vercel (zéro-ops, sous-domaines + preview auto) · Cloudflare Pages/Workers (edge) | Coolify (self-host, 1 VPS pour tout) |
| Observabilité | Sentry + PostHog cloud | PostHog self-host + GlitchTip (ou Sentry self-host) |
| LLM texte | Gemini 2.5 Flash · GPT-4o (provider) | Ollama + modèles ouverts (local) — ⚠️ **moins puissants, à assumer** |
| DNS + CDN | **Provider-only** — Cloudflare (autres providers DNS possibles ; auto-héberger l'autoritatif = hors sujet, pas d'« OSS ») | — |
| Email transactionnel + confirmation compte | **Provider-only** — Resend (alt Postmark) ; la délivrabilité = un provider · **domaine d'envoi générique unique** `mail.<domain>`, From `noreply@<domain>` (voir note ↓) | SMTP self-host possible mais **délivrabilité fragile → non recommandé** |
| Paiement (optionnel) | **Provider-only** — Stripe (web) / RevenueCat (mobile) ; pas d'auto-hébergement du paiement carte | — |
| Génération d'images / visuels | Nano Banana (Gemini 2.5 Flash Image — modèle **Google**) ; clé Google requise même si le LLM texte est non-Google (ex. GPT-4o) | — · `visuals = "none"` coupe la génération |
| Transcription | Whisper / gpt-4o-transcribe (alt Groq rapide, Azure realtime) | Whisper local (self-host) |
| Backend edge | Cloudflare Workers + D1 + KV | route API Next.js (self-host avec l'hébergement) |
| Desktop / mobile | Swift Core-first (macOS) · .NET/WPF (Windows) · SwiftUI (iOS) | *(natif — pas de fork)* |

> **Email — un seul domaine d'envoi générique pour toute la factory.** Jamais un domaine par projet : sous-domaine unique **`mail.<domain>`** (sous-domaine, pas l'apex → protège la réputation), expéditeur par défaut **`EMAIL_FROM = noreply@<domain>`** (nom d'affichage = nom du projet, domaine générique). **Vérifié une seule fois** dans Resend (SPF/DKIM/DMARC + return-path via Cloudflare) puis **réutilisé tel quel** par chaque nouveau projet. Le même domaine + le même compte Resend servent **les deux flux** : la **confirmation de compte** (Supabase Auth avec **SMTP custom = Resend** — ce qui **lève la limite de débit** du SMTP intégré de Supabase → aucun upgrade payant) **et** le **transactionnel** (welcome, rappels, RDV — **API Resend**). Reste **provider-only** (pas de fork self-host, cf. tableau). `EMAIL_FROM` et le domaine **ne sont pas** des secrets ; seul `RESEND_API_KEY` l'est (`.env`).

Règles transverses : TypeScript/Swift strict, tests dès la 1ʳᵉ feature, secrets en variables d'env, i18n si public. **Pour changer un provider partout → modifier ce fichier uniquement** (ex. passer l'hébergement à Coolify self-host, ou la BDD à Supabase self-hosted / Neon).
