import { BellRing, CalendarCheck2, Scissors, ShieldCheck } from "lucide-react";

import { CtaFinal } from "@/components/landing/cta-final";
import { Faq, type FaqItem } from "@/components/landing/faq";
import { Features, type Feature } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import {
  HowItWorks,
  type HowItWorksStep,
} from "@/components/landing/how-it-works";
import { Navbar } from "@/components/landing/navbar";
import { Pricing, type PricingPlan } from "@/components/landing/pricing";
import {
  SocialProof,
  type SocialProofItem,
} from "@/components/landing/social-proof";
import { Problem } from "@/components/landing/problem";
import { brand } from "@/lib/brand";

/**
 * Landing du châssis — socle de sections rempli par la Phase 4.
 *
 * REMPLACER en Phase 4 : copy dérivé de `research/positioning.md` +
 * `product/pricing.md` — jamais laisser ce placeholder. `SITE_CONTENT`
 * ci-dessous est une **sentinelle** (comme `lib/brand.ts`) : un contenu
 * d'exemple complet — le cas canonique « réservation salon de coiffure » —
 * qui montre le niveau de spécificité attendu par `_shared/landing-playbook.md`
 * (headline ≤ 10 mots, stat sourcée, prix TTC, zéro texte de remplissage,
 * zéro buzzword).
 *
 * La Phase 4 remplace : chaque champ de `SITE_CONTENT`, la stat et sa source
 * (re-sourcées pour la niche du projet), le visuel du hero par un VRAI
 * screenshot de l'app générée (`next/image`), et GÉNÈRE les pages légales
 * pointées par le footer (`/legal/*` — jamais de liens morts).
 *
 * Structure canonique (playbook §Structure) : navbar, hero, micro-preuve
 * sociale, problème (section sombre de rupture), comment ça marche,
 * features, pricing, FAQ, CTA final, footer. La section témoignages est
 * CONDITIONNELLE : ajoutée en Phase 4 uniquement si l'intake fournit des
 * témoignages réels (nom + métier + ville).
 */

/** CTA primaire — même label partout (navbar, hero, pricing, CTA final). */
const CTA = { label: "Ouvrir mon agenda en ligne", href: "/signup" } as const;

const SECONDARY_CTA = {
  label: "Voir comment ça marche",
  href: "#comment-ca-marche",
} as const;

const SITE_CONTENT = {
  nav: {
    links: [
      { label: "Fonctionnalités", href: "#fonctionnalites" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "FAQ", href: "#faq" },
    ],
  },

  hero: {
    headline: "Un agenda plein, sans passer la journée au téléphone",
    subtitle:
      "Vos clientes réservent en ligne 24h/24 ; vous recevez un SMS et votre agenda se met à jour tout seul.",
    reassurance: "Essai 30 jours. Sans carte bancaire. Annulation en 1 clic.",
  },

  socialProof: [
    { kind: "founder", text: "Développé avec des coiffeuses indépendantes de Lyon" },
    { kind: "guarantee", text: "Essai 30 jours, sans carte bancaire" },
    { kind: "launch", text: "Offre fondateur : -50 % pour les 20 premiers salons" },
  ] satisfies ReadonlyArray<SocialProofItem>,

  problem: {
    title: "Le téléphone sonne, la coupe attend",
    paragraphs: [
      "Chaque appel pris entre deux clientes, c'est une coloration interrompue et une cliente au bac qui patiente. Chaque appel manqué, c'est un rendez-vous qui part chez le salon d'en face.",
      "Le cahier de rendez-vous ne prend pas les réservations à 22 h. Vos clientes, si : elles réservent quand elles y pensent — le soir, le dimanche, entre deux stories.",
    ],
    stat: {
      value: "35 %",
      description: "des rendez-vous se prennent hors horaires d'ouverture du salon",
      source: "étude Zenoti", // Phase 4 : re-sourcer chaque stat pour la niche du projet
    },
  },

  howItWorks: {
    title: "Trois gestes, et vos clientes réservent seules",
    steps: [
      {
        title: "Créez votre page en 10 minutes",
        description:
          "Vous listez vos prestations, vos prix et vos horaires ; votre page de réservation est en ligne.",
        benefit: "Aucune connaissance technique requise.",
      },
      {
        title: "Partagez le lien",
        description:
          "Instagram, fiche Google, vitrine : vos clientes choisissent leur créneau, même salon fermé.",
        benefit: "Votre agenda se remplit sans vous.",
      },
      {
        title: "Recevez vos clientes",
        description:
          "Rappel SMS automatique la veille et 2 h avant le rendez-vous ; la cliente confirme ou libère le créneau.",
        benefit: "Moins de no-shows, zéro relance à faire.",
      },
    ] satisfies ReadonlyArray<HowItWorksStep>,
  },

  features: {
    title: "Pensé pour le bac, pas pour le bureau",
    subtitle:
      "Chaque fonction règle un problème précis de salon indépendant — rien de plus.",
    items: [
      {
        icon: CalendarCheck2,
        title: "Ne perdez plus une cliente parce que vous étiez occupée",
        description:
          "Vos clientes réservent depuis Instagram ou Google, même quand le salon est fermé. Vous validez, ou le créneau se bloque automatiquement — vous gardez le contrôle de votre agenda.",
      },
      {
        icon: BellRing,
        title: "Des rappels SMS qui font venir les clientes",
        description:
          "SMS automatique la veille et 2 h avant le rendez-vous ; la cliente confirme en un clic ou libère le créneau pour quelqu'un d'autre. Rien à envoyer vous-même.",
      },
      {
        icon: Scissors,
        title: "Vos prestations, vos prix, vos durées",
        description:
          "« Coupe femme — 45 € — 45 min » : chaque prestation affiche son prix TTC et sa durée réelle. Les créneaux se calent tout seuls, sans chevauchement.",
      },
      {
        icon: ShieldCheck,
        title: "Vos données restent les vôtres",
        description:
          "Fichier clientes exportable en un clic, hébergement en Europe, conformité RGPD. Si vous partez, vous partez avec tout.",
      },
    ] satisfies ReadonlyArray<Feature>,
  },

  pricing: {
    title: "Un prix clair, affiché, sans surprise",
    subtitle: "Prix TTC, sans frais d'installation ni option cachée.",
    annualNote: "2 mois offerts en paiement annuel.",
    cancellationNote: "Sans engagement. Annulez en 1 clic depuis votre compte.",
    plans: [
      {
        name: "Solo",
        price: "19 €",
        period: "/mois TTC",
        description: "Pour l'indépendante, en salon ou à domicile.",
        features: [
          "Réservations en ligne illimitées",
          "Page de réservation à vos couleurs",
          "50 rappels SMS par mois",
          "Fichier clientes exportable (CSV)",
          "Synchronisation Google Agenda",
        ],
        cta: CTA,
      },
      {
        name: "Salon",
        price: "39 €",
        period: "/mois TTC",
        description: "Pour un salon jusqu'à 5 collaborateurs.",
        recommended: true,
        features: [
          "Tout Solo, agendas pour 5 collaborateurs",
          "200 rappels SMS par mois",
          "Acompte en ligne à la réservation",
          "Statistiques de remplissage par semaine",
          "Support prioritaire 7 j/7",
        ],
        cta: CTA,
      },
      {
        name: "Multi-salons",
        price: "79 €",
        period: "/mois TTC",
        description: "Pour les gérantes de plusieurs adresses.",
        features: [
          "Salons et agendas illimités",
          "500 rappels SMS par mois",
          "Vue consolidée multi-adresses",
          "Rôles gérante / manager / coiffeuse",
          "Accompagnement à la mise en route",
        ],
        cta: CTA,
      },
    ] satisfies ReadonlyArray<PricingPlan>,
  },

  faq: {
    title: "Les questions qu'on nous pose avant de se lancer",
    items: [
      {
        question: "Faut-il une carte bancaire pour l'essai ?",
        answer:
          "Non. L'essai de 30 jours est complet et sans carte bancaire ; vous ne payez qu'au moment où vous décidez de rester.",
      },
      {
        question: "Puis-je annuler à tout moment ?",
        answer:
          "Oui, en 1 clic depuis votre compte, sans préavis ni frais. Votre page reste en ligne jusqu'à la fin du mois déjà payé.",
      },
      {
        question: "Mes clientes doivent-elles créer un compte ?",
        answer:
          "Non : elles choisissent un créneau, laissent leur nom et leur téléphone, c'est réservé. Trois clics, pas de mot de passe.",
      },
      {
        question: "Que deviennent mes données si je pars ?",
        answer:
          "Vous exportez votre fichier clientes et l'historique des rendez-vous en un clic (CSV), puis tout est supprimé de nos serveurs sous 30 jours, conformément au RGPD.",
      },
    ] satisfies ReadonlyArray<FaqItem>,
  },

  ctaFinal: {
    title: "Votre agenda se remplit pendant que vous coiffez",
    subtitle:
      "Créez votre page de réservation en 10 minutes ; vos clientes réservent dès ce soir.",
    reassurance: "Essai 30 jours. Sans carte bancaire. Annulation en 1 clic.",
  },

  footer: {
    mission: "La page de réservation des salons indépendants.",
    city: "Lyon, France",
    productLinks: [
      { label: "Fonctionnalités", href: "#fonctionnalites" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "FAQ", href: "#faq" },
      { label: "Se connecter", href: "/login" },
    ],
    // Phase 4 : GÉNÉRER ces pages (playbook §Footer + légal FR) — jamais de liens morts.
    legalLinks: [
      { label: "Mentions légales", href: "/legal/mentions-legales" },
      { label: "Politique de confidentialité", href: "/legal/confidentialite" },
      { label: "CGV", href: "/legal/cgv" },
    ],
    contact: { email: "contact@salon.example" },
  },
} as const;

/**
 * Visuel d'exemple du slot hero — maquette de la page de réservation,
 * construite avec les tokens du châssis.
 *
 * Phase 4 : REMPLACER par un VRAI screenshot de l'app générée
 * (`next/image`, écran le plus parlant : agenda rempli ou page de
 * réservation). Un faux dashboard en production est un marqueur de slop
 * (doctrine §Icônes et images) — cette maquette n'existe que pour montrer
 * le cadrage attendu du slot.
 */
function ExampleHeroVisual() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3 rounded-md bg-muted/40 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold tracking-tight">Choisissez votre prestation</p>
        <p className="text-xs text-muted-foreground">mar. 14h — 19h</p>
      </div>
      {[
        { name: "Coupe femme", detail: "45 € · 45 min" },
        { name: "Balayage", detail: "90 € · 1 h 30" },
        { name: "Brushing", detail: "25 € · 30 min" },
      ].map((service) => (
        <div
          key={service.name}
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium">{service.name}</p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {service.detail}
            </p>
          </div>
          <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            Réserver
          </span>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar
        brandName={brand.name}
        links={SITE_CONTENT.nav.links}
        cta={CTA}
      />

      <main>
        <Hero
          headline={SITE_CONTENT.hero.headline}
          subtitle={SITE_CONTENT.hero.subtitle}
          cta={CTA}
          secondaryCta={SECONDARY_CTA}
          reassurance={SITE_CONTENT.hero.reassurance}
          visual={<ExampleHeroVisual />}
        />

        <SocialProof items={SITE_CONTENT.socialProof} />

        <Problem
          title={SITE_CONTENT.problem.title}
          paragraphs={SITE_CONTENT.problem.paragraphs}
          stat={SITE_CONTENT.problem.stat}
        />

        <HowItWorks
          title={SITE_CONTENT.howItWorks.title}
          steps={SITE_CONTENT.howItWorks.steps}
        />

        <Features
          title={SITE_CONTENT.features.title}
          subtitle={SITE_CONTENT.features.subtitle}
          features={SITE_CONTENT.features.items}
        />

        <Pricing
          title={SITE_CONTENT.pricing.title}
          subtitle={SITE_CONTENT.pricing.subtitle}
          plans={SITE_CONTENT.pricing.plans}
          annualNote={SITE_CONTENT.pricing.annualNote}
          cancellationNote={SITE_CONTENT.pricing.cancellationNote}
        />

        <Faq title={SITE_CONTENT.faq.title} items={SITE_CONTENT.faq.items} />

        <CtaFinal
          title={SITE_CONTENT.ctaFinal.title}
          subtitle={SITE_CONTENT.ctaFinal.subtitle}
          cta={CTA}
          secondaryCta={SECONDARY_CTA}
          reassurance={SITE_CONTENT.ctaFinal.reassurance}
        />
      </main>

      <Footer
        brandName={brand.name}
        mission={SITE_CONTENT.footer.mission}
        city={SITE_CONTENT.footer.city}
        productLinks={SITE_CONTENT.footer.productLinks}
        legalLinks={SITE_CONTENT.footer.legalLinks}
        contact={SITE_CONTENT.footer.contact}
      />
    </>
  );
}
