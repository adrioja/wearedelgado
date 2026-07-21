"use client";

import { useActionState } from "react";
import { saveClientAction, type ClientFormState } from "./actions";
import type { Client } from "@/lib/data/clients";

const initialState: ClientFormState = { status: "idle" };

const inputClass =
  "rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink";

export function ClientForm({ client }: { client?: Client }) {
  const [state, formAction, isPending] = useActionState(
    saveClientAction,
    initialState
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      {client && <input type="hidden" name="id" value={client.id} />}

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm text-muted">
          Nombre / razón social
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={client?.name}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="contact_person" className="text-sm text-muted">
            Persona de contacto (opcional)
          </label>
          <input
            id="contact_person"
            name="contact_person"
            type="text"
            defaultValue={client?.contact_person ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="tax_id" className="text-sm text-muted">
            NIF / CIF (opcional)
          </label>
          <input
            id="tax_id"
            name="tax_id"
            type="text"
            defaultValue={client?.tax_id ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm text-muted">
            Email (opcional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm text-muted">
            Teléfono (opcional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={client?.phone ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="address" className="text-sm text-muted">
          Dirección (opcional)
        </label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={client?.address ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="text-sm text-muted">
          Notas internas (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={client?.notes ?? ""}
          className={`resize-none ${inputClass}`}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={client?.is_active ?? true}
          className="h-4 w-4 rounded border-border"
        />
        Cliente activo
      </label>

      <div aria-live="polite" className="min-h-6 text-sm">
        {state.status === "error" && (
          <p className="text-red-700">{state.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 w-fit cursor-pointer rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Guardar cliente"}
      </button>
    </form>
  );
}
