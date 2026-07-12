import { z } from "zod";

/**
 * Schémas zod de l'entité exemple `items` (bloc `crud`).
 *
 * Deux niveaux :
 * - `itemInputSchema` : le PAYLOAD d'écriture (create/update). C'est ce que
 *   l'utilisateur envoie via le formulaire — jamais `id`, `owner` ni
 *   `created_at`, qui sont posés par la base / le serveur.
 * - `itemSchema` : la LIGNE complète telle que lue en base (colonnes gérées
 *   par Postgres incluses).
 *
 * Pour cloner sur une nouvelle entité : copier ce fichier en
 * `lib/schemas/<entité>.ts`, renommer les symboles et ajuster les champs.
 */
export const itemInputSchema = z.object({
  title: z
    .string({ required_error: "Le titre est requis." })
    .trim()
    .min(1, "Le titre est requis.")
    .max(200, "Le titre ne peut pas dépasser 200 caractères."),
  body: z
    .string()
    .trim()
    .max(10_000, "Le contenu ne peut pas dépasser 10 000 caractères.")
    .default(""),
});

export type ItemInput = z.infer<typeof itemInputSchema>;

export const itemSchema = itemInputSchema.extend({
  id: z.string().uuid(),
  owner: z.string().uuid(),
  created_at: z.string(),
});

export type Item = z.infer<typeof itemSchema>;
