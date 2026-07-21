"use client";

import { useActionState } from "react";
import { submitContactAction, type ContactFormState } from "@/app/actions";
import { Reveal } from "./reveal";
import type { SiteSettings } from "@/lib/data/site-settings";

const initialState: ContactFormState = { status: "idle" };

const DEFAULT_INTRO =
  "Cuéntanos qué necesitas y te responderemos en menos de 48 horas.";

export function ContactSection({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(
    submitContactAction,
    initialState
  );

  const hasDetails =
    settings?.contact_email ||
    settings?.contact_phone ||
    settings?.schedule_text ||
    settings?.address_text;

  return (
    <section
      id="contacto"
      className="flex min-h-screen items-center bg-foreground py-32 text-white"
    >
      <div className="mx-auto grid w-full max-w-5xl gap-16 px-6 sm:px-10 md:grid-cols-2 md:gap-24">
        <Reveal>
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/60">
            Contacto
          </p>
          <h2 className="text-balance font-serif text-3xl leading-snug sm:text-4xl md:text-5xl">
            Hablemos de tu próximo proyecto
          </h2>
          <p className="mt-6 max-w-sm text-pretty text-white/70">
            {settings?.contact_intro || DEFAULT_INTRO}
          </p>

          {hasDetails && (
            <dl className="mt-10 flex flex-col gap-5 text-sm text-white/70">
              {settings?.contact_email && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/40">
                    Email
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="cursor-pointer hover:text-white"
                    >
                      {settings.contact_email}
                    </a>
                  </dd>
                </div>
              )}
              {settings?.contact_phone && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/40">
                    Teléfono
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${settings.contact_phone}`}
                      className="cursor-pointer hover:text-white"
                    >
                      {settings.contact_phone}
                    </a>
                  </dd>
                </div>
              )}
              {settings?.schedule_text && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/40">
                    Horario
                  </dt>
                  <dd className="mt-1 whitespace-pre-line">
                    {settings.schedule_text}
                  </dd>
                </div>
              )}
              {settings?.address_text && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/40">
                    Dónde estamos
                  </dt>
                  <dd className="mt-1 whitespace-pre-line">
                    {settings.address_map_url ? (
                      <a
                        href={settings.address_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer hover:text-white"
                      >
                        {settings.address_text}
                      </a>
                    ) : (
                      settings.address_text
                    )}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <form action={formAction} className="flex flex-col gap-6" noValidate>
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <Field label="Nombre" name="name" autoComplete="name" />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
            />
            <Field
              label="Teléfono móvil"
              name="phone"
              type="tel"
              autoComplete="tel"
            />
            <FieldTextarea label="Mensaje" name="message" />

            <div aria-live="polite" className="min-h-6 text-sm">
              {state.status === "error" && (
                <p className="text-red-300">{state.message}</p>
              )}
              {state.status === "success" && (
                <p className="text-emerald-300">{state.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="group inline-flex w-fit cursor-pointer items-center gap-2 border-b border-white/40 pb-1 text-left text-base transition-colors duration-300 hover:border-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
            >
              {isPending ? "Enviando…" : "Enviar mensaje"}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
              >
                <path
                  d="M4 12h16m0 0-6-6m6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-white/70">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="border-b border-white/30 bg-transparent py-2 text-base text-white outline-none transition-colors focus:border-white"
      />
    </div>
  );
}

function FieldTextarea({ label, name }: { label: string; name: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-white/70">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        required
        rows={4}
        className="resize-none border-b border-white/30 bg-transparent py-2 text-base text-white outline-none transition-colors focus:border-white"
      />
    </div>
  );
}
