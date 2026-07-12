import "server-only";

import type { ZodType, ZodTypeDef } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PATRON CRUD GÉNÉRIQUE (bloc `crud`)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `createCrud` fabrique un jeu de helpers typés (list / get / create / update /
 * remove) au-dessus du client Supabase SERVEUR. Toute la sécurité d'accès repose
 * sur la RLS Postgres (policies par `owner`, cf. migration de l'entité) : ces
 * helpers ne « re-vérifient » pas les droits côté app, ils s'appuient sur la base.
 * `create` injecte automatiquement `owner = auth.uid()` (l'utilisateur courant).
 *
 * ── COMMENT CLONER POUR UNE NOUVELLE ENTITÉ ─────────────────────────────────
 *
 *  1. MIGRATION : `supabase/migrations/000X_<entité>.sql`
 *       create table public.<entité> (
 *         id uuid primary key default gen_random_uuid(),
 *         owner uuid not null references auth.users (id) on delete cascade,
 *         ...vos colonnes...,
 *         created_at timestamptz not null default now()
 *       );
 *       alter table public.<entité> enable row level security;
 *       -- + 4 policies (select/insert/update/delete) `auth.uid() = owner`.
 *     La table DOIT avoir une colonne `owner uuid` et la RLS activée.
 *
 *  2. SCHÉMA : `lib/schemas/<entité>.ts`
 *       export const <entité>InputSchema = z.object({ ... });   // payload d'écriture
 *       export type <Entité>Input = z.infer<typeof <entité>InputSchema>;
 *       export const <entité>Schema = <entité>InputSchema.extend({
 *         id: z.string().uuid(), owner: z.string().uuid(), created_at: z.string(),
 *       });
 *       export type <Entité> = z.infer<typeof <entité>Schema>;
 *
 *  3. CRUD : là où vous en avez besoin (typiquement `app/(app)/<entité>/actions.ts`)
 *       const crud = createCrud<<Entité>, <Entité>Input>({
 *         table: "<entité>",
 *         inputSchema: <entité>InputSchema,
 *       });
 *
 *  4. UI : copier `app/(app)/items/*` et `components/items/*` en remplaçant
 *     le nom de l'entité. C'est tout.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface CrudConfig<TInput> {
  /** Nom de la table Postgres. Doit exposer `owner uuid` + RLS par owner. */
  table: string;
  /**
   * Schéma zod validant le payload d'écriture (create/update). Le 3e paramètre
   * `unknown` (type d'ENTRÉE) autorise un schéma dont l'entrée diffère de la
   * sortie — typiquement un champ `.default(...)` (entrée optionnelle, sortie
   * garantie). `TInput` reste le type de SORTIE (ce que la base reçoit).
   */
  inputSchema: ZodType<TInput, ZodTypeDef, unknown>;
  /** Colonnes retournées par les lectures. Défaut : `*`. */
  columns?: string;
  /** Colonne de tri des listes. Défaut : `created_at`. */
  orderBy?: string;
}

/** Résultat uniforme : soit `data` (succès), soit `error` (message lisible). */
export type CrudResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

function ok<T>(data: T): { data: T; error: null } {
  return { data, error: null };
}

function fail(error: string): { data: null; error: string } {
  return { data: null, error };
}

/**
 * `TRow`   : la ligne complète lue en base (ex. `Item`).
 * `TInput` : le payload d'écriture validé par `inputSchema` (ex. `ItemInput`).
 */
export function createCrud<TRow, TInput extends Record<string, unknown>>(
  config: CrudConfig<TInput>,
) {
  const {
    table,
    inputSchema,
    columns = "*",
    orderBy = "created_at",
  } = config;

  return {
    /** Liste les lignes de l'utilisateur courant (bornées par la RLS). */
    async list(): Promise<CrudResult<TRow[]>> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .order(orderBy, { ascending: false });

      if (error) return fail(error.message);
      return ok((data ?? []) as TRow[]);
    },

    /** Récupère une ligne par `id` (RLS : uniquement si elle appartient au user). */
    async get(id: string): Promise<CrudResult<TRow>> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .eq("id", id)
        .maybeSingle();

      if (error) return fail(error.message);
      if (!data) return fail("Ressource introuvable.");
      return ok(data as TRow);
    },

    /** Crée une ligne pour l'utilisateur courant (`owner` injecté). */
    async create(input: TInput): Promise<CrudResult<TRow>> {
      const parsed = inputSchema.safeParse(input);
      if (!parsed.success) return fail("Données invalides.");

      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) return fail("Authentification requise.");

      const { data, error } = await supabase
        .from(table)
        .insert({ ...parsed.data, owner: user.id })
        .select(columns)
        .single();

      if (error) return fail(error.message);
      return ok(data as TRow);
    },

    /** Met à jour une ligne par `id` (RLS : seul l'owner peut modifier). */
    async update(id: string, input: TInput): Promise<CrudResult<TRow>> {
      const parsed = inputSchema.safeParse(input);
      if (!parsed.success) return fail("Données invalides.");

      const supabase = await createClient();
      const { data, error } = await supabase
        .from(table)
        // La base n'est pas typée dans le template (pas de types générés
        // Supabase) : le payload générique est cast en permissif. Un projet qui
        // exécute `supabase gen types typescript` pourra retirer ce cast.
        .update(parsed.data as never)
        .eq("id", id)
        .select(columns)
        .single();

      if (error) return fail(error.message);
      return ok(data as TRow);
    },

    /** Supprime une ligne par `id` (RLS : seul l'owner peut supprimer). */
    async remove(id: string): Promise<CrudResult<{ id: string }>> {
      const supabase = await createClient();
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) return fail(error.message);
      return ok({ id });
    },
  };
}

export type Crud<TRow, TInput extends Record<string, unknown>> = ReturnType<
  typeof createCrud<TRow, TInput>
>;
