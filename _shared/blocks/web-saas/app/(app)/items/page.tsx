import { createCrud } from "@/lib/crud/factory";
import { itemInputSchema, type Item, type ItemInput } from "@/lib/schemas/item";
import { ItemForm } from "@/components/items/item-form";
import { deleteItemAction } from "@/app/(app)/items/actions";

/**
 * Page liste de l'entité `items` (bloc `crud`) — surface authentifiée `(app)`.
 *
 * Server Component : lit les items via le CRUD générique (lecture bornée par la
 * RLS, donc uniquement ceux de l'utilisateur courant), affiche le formulaire de
 * création et la liste avec suppression inline. Modèle à cloner par entité.
 */
export const dynamic = "force-dynamic";

const items = createCrud<Item, ItemInput>({
  table: "items",
  inputSchema: itemInputSchema,
});

export default async function ItemsPage() {
  const { data, error } = await items.list();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Items</h1>
        <p className="text-sm text-muted-foreground">
          Entité exemple du bloc CRUD — à cloner pour vos propres entités.
        </p>
      </header>

      <section className="rounded-lg border border-border p-6">
        <h2 className="mb-4 text-lg font-medium">Nouvel item</h2>
        <ItemForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Vos items</h2>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            Impossible de charger les items : {error}
          </p>
        ) : data && data.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {data.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{item.title}</span>
                  {item.body ? (
                    <span className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {item.body}
                    </span>
                  ) : null}
                  <time
                    dateTime={item.created_at}
                    className="text-xs text-muted-foreground"
                  >
                    {new Date(item.created_at).toLocaleString()}
                  </time>
                </div>

                <form action={deleteItemAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="text-sm text-destructive hover:underline"
                  >
                    Supprimer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun item pour l&apos;instant. Créez-en un ci-dessus.
          </p>
        )}
      </section>
    </main>
  );
}
