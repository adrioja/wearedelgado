"use client";

import { useActionState } from "react";
import { updateSiteSettingsAction, type SettingsFormState } from "./actions";
import type { SiteSettings } from "@/lib/data/site-settings";

const initialState: SettingsFormState = { status: "idle" };

const inputClass =
  "rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink";

export function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(
    updateSiteSettingsAction,
    initialState
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="contact_intro" className="text-sm text-muted">
          Texto de la sección de contacto
        </label>
        <textarea
          id="contact_intro"
          name="contact_intro"
          rows={2}
          defaultValue={settings?.contact_intro ?? ""}
          className={`resize-none ${inputClass}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="contact_email" className="text-sm text-muted">
            Email de contacto
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            defaultValue={settings?.contact_email ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact_phone" className="text-sm text-muted">
            Teléfono
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            type="text"
            defaultValue={settings?.contact_phone ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="schedule_text" className="text-sm text-muted">
          Horario
        </label>
        <textarea
          id="schedule_text"
          name="schedule_text"
          rows={3}
          placeholder={"Lunes–Viernes: 9:00–18:00"}
          defaultValue={settings?.schedule_text ?? ""}
          className={`resize-none ${inputClass}`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="address_text" className="text-sm text-muted">
          Ubicación
        </label>
        <textarea
          id="address_text"
          name="address_text"
          rows={2}
          defaultValue={settings?.address_text ?? ""}
          className={`resize-none ${inputClass}`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="address_map_url" className="text-sm text-muted">
          Enlace a Google Maps (opcional)
        </label>
        <input
          id="address_map_url"
          name="address_map_url"
          type="url"
          defaultValue={settings?.address_map_url ?? ""}
          className={inputClass}
        />
      </div>

      <div aria-live="polite" className="min-h-6 text-sm">
        {state.status === "error" && (
          <p className="text-red-700">{state.message}</p>
        )}
        {state.status === "success" && (
          <p className="text-emerald-700">{state.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 w-fit cursor-pointer rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Guardar ajustes"}
      </button>
    </form>
  );
}
