import { ChevronDown } from "lucide-react";
import type { FAQPage, WithContext } from "schema-dts";

import { cn } from "@/lib/utils";

/**
 * FAQ / objections — section 9 du playbook (`_shared/landing-playbook.md`).
 *
 * Rôle : lever les dernières frictions. 3-5 questions RÉELLES (prix, données,
 * annulation, compte), réponses 1-2 phrases.
 *
 * Accordéon accessible SANS JavaScript : `<details>/<summary>` natifs —
 * clavier, lecteur d'écran et find-in-page fonctionnent d'office, et les
 * réponses restent dans le HTML (exigence playbook : jamais d'image ni de
 * tab caché en JS). Le schema FAQPage (JSON-LD, typé `schema-dts`) est émis
 * par le composant — rien à câbler côté page.
 */

export interface FaqItem {
  question: string;
  /** Réponse en 1-2 phrases, concrète (chiffres, délais, conditions). */
  answer: string;
}

export interface FaqProps {
  title: string;
  subtitle?: string;
  /** 3 à 5 questions MAX (playbook §Structure canonique). */
  items: ReadonlyArray<FaqItem>;
  id?: string;
  className?: string;
}

export function Faq({ title, subtitle, items, id = "faq", className }: FaqProps) {
  const headingId = `${id}-titre`;

  const jsonLd: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-16 border-t border-border bg-background py-16", className)}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container flex max-w-3xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <h2
            id={headingId}
            className="text-3xl font-semibold tracking-tight sm:text-4xl [font-family:var(--font-display,inherit)]"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className="divide-y divide-border rounded-lg border border-border">
          {items.map((item, index) => (
            <details
              key={item.question}
              className="group px-6 py-5"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </summary>
              <p className="pt-3 text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
