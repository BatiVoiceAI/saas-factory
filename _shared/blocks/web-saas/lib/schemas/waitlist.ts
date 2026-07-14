import { z } from "zod";

/**
 * Schéma zod du payload de capture d'un lead (bloc `waitlist`, archétype landing).
 *
 * C'est le contrat d'ENTRÉE de la route `app/api/waitlist/route.ts` : ce qu'un
 * visiteur envoie via le formulaire. `id`, `referrer`, `status` et `created_at`
 * sont posés par la base / le serveur — jamais par le client.
 *
 * L'e-mail est normalisé (trim + minuscule) ici pour être cohérent avec l'index
 * UNIQUE `lower(email)` de 0005_waitlist.sql (idempotence insensible à la casse).
 */
export const waitlistInputSchema = z.object({
  email: z
    .string({ required_error: "L'adresse e-mail est requise." })
    .trim()
    .toLowerCase()
    .email("Veuillez saisir une adresse e-mail valide."),
  /**
   * Provenance fonctionnelle du lead (ex. 'hero', 'pricing', 'footer'). Optionnel :
   * renseigné par le formulaire selon l'emplacement où il est monté.
   */
  source: z.string().trim().max(200).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistInputSchema>;
