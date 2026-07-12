"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { createItemAction, type ItemFormState } from "@/app/(app)/items/actions";
import type { ItemInput } from "@/lib/schemas/item";

/** État initial du formulaire (défini côté client : cf. note dans actions.ts). */
const INITIAL_STATE: ItemFormState = { error: null };

/**
 * Formulaire de création/édition d'un `item` (bloc `crud`).
 *
 * Client Component : pilote l'état via `useActionState` (React 19) et l'état
 * « en cours » via `useFormStatus`. Par défaut il crée un item ; passer une
 * `action` liée (ex. `updateItemAction.bind(null, id)`) + des `defaultValues`
 * le transforme en formulaire d'édition.
 *
 * Volontairement sans dépendance à `components/ui/*` (bloc `ui-shell`) pour
 * rester auto-contenu : primitives HTML + Tailwind. Remplaçable par
 * `<Input/>` / `<Button/>` de shadcn une fois `ui-shell` câblé.
 */
type ItemFormAction = (
  state: ItemFormState,
  formData: FormData,
) => Promise<ItemFormState>;

export function ItemForm({
  action = createItemAction,
  defaultValues,
  submitLabel = "Créer",
}: {
  action?: ItemFormAction;
  defaultValues?: Partial<ItemInput>;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Titre
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={defaultValues?.title ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.title)}
          className={cn(
            "rounded-md border border-input bg-background px-3 py-2 text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            state.fieldErrors?.title && "border-destructive",
          )}
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className="text-sm font-medium">
          Contenu
        </label>
        <textarea
          id="body"
          name="body"
          rows={4}
          maxLength={10_000}
          defaultValue={defaultValues?.body ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.body)}
          className={cn(
            "rounded-md border border-input bg-background px-3 py-2 text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            state.fieldErrors?.body && "border-destructive",
          )}
        />
        <FieldError messages={state.fieldErrors?.body} />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label={submitLabel} />
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {messages[0]}
    </p>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4",
        "text-sm font-medium text-primary-foreground",
        "hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      {pending ? "Enregistrement…" : label}
    </button>
  );
}
