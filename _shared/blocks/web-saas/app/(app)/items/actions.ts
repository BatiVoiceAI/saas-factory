"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCrud } from "@/lib/crud/factory";
import {
  itemInputSchema,
  type Item,
  type ItemInput,
} from "@/lib/schemas/item";

/**
 * Server Actions CRUD de l'entité `items` (bloc `crud`).
 *
 * Le CRUD lui-même est fabriqué par `createCrud` (générique, réutilisable) ;
 * ces actions ne font que : parser le `FormData`, appeler le helper, puis
 * revalider / rediriger. Pour cloner : copier ce fichier sous
 * `app/(app)/<entité>/actions.ts` et remplacer les symboles.
 */
const items = createCrud<Item, ItemInput>({
  table: "items",
  inputSchema: itemInputSchema,
});

/**
 * État renvoyé aux formulaires (compatible `useActionState`).
 * NB : un module `"use server"` ne peut exporter QUE des fonctions async — la
 * valeur initiale (`{ error: null }`) est donc définie côté client, dans le
 * composant `ItemForm`, et non ici.
 */
export type ItemFormState = {
  error: string | null;
  fieldErrors?: Partial<Record<keyof ItemInput, string[]>>;
};

function parseForm(formData: FormData) {
  return itemInputSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body") ?? "",
  });
}

export async function createItemAction(
  _prevState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      error: "Merci de corriger les champs signalés.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { error } = await items.create(parsed.data);
  if (error) return { error };

  revalidatePath("/items");
  redirect("/items");
}

export async function updateItemAction(
  id: string,
  _prevState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      error: "Merci de corriger les champs signalés.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { error } = await items.update(id, parsed.data);
  if (error) return { error };

  revalidatePath("/items");
  redirect("/items");
}

/**
 * Suppression déclenchée par un `<form action={deleteItemAction}>` avec un
 * champ caché `id`. Pas d'état de formulaire : on revalide la liste en place.
 */
export async function deleteItemAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;

  await items.remove(id);
  revalidatePath("/items");
}
