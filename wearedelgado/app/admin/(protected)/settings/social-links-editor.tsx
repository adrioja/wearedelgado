import { SOCIAL_ICON_KEYS, type SocialLink } from "@/lib/data/social-links";
import {
  createSocialLinkAction,
  deleteSocialLinkAction,
  reorderSocialLinkAction,
  updateSocialLinkAction,
} from "./actions";

const inputClass =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent-ink";

export function SocialLinksEditor({ links }: { links: SocialLink[] }) {
  return (
    <div className="flex flex-col gap-4">
      {links.length === 0 && (
        <p className="text-sm text-muted">No hay redes sociales todavía.</p>
      )}

      {links.map((link, index) => (
        <form
          key={link.id}
          action={updateSocialLinkAction}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4"
        >
          <input type="hidden" name="id" value={link.id} />

          <select
            name="icon_key"
            defaultValue={link.icon_key}
            className={`${inputClass} w-36`}
          >
            {SOCIAL_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>

          <input
            name="label"
            type="text"
            defaultValue={link.label}
            placeholder="Etiqueta"
            className={`${inputClass} w-32 flex-1`}
          />

          <input
            name="url"
            type="url"
            defaultValue={link.url}
            placeholder="https://…"
            className={`${inputClass} min-w-48 flex-[2]`}
          />

          <button
            type="submit"
            className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-accent-ink"
          >
            Guardar
          </button>

          <div className="flex gap-1">
            <button
              type="submit"
              formAction={reorderSocialLinkAction.bind(null, link.id, "up")}
              disabled={index === 0}
              aria-label="Subir"
              className="cursor-pointer rounded p-1 text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="submit"
              formAction={reorderSocialLinkAction.bind(null, link.id, "down")}
              disabled={index === links.length - 1}
              aria-label="Bajar"
              className="cursor-pointer rounded p-1 text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↓
            </button>
          </div>

          <button
            type="submit"
            formAction={deleteSocialLinkAction}
            className="cursor-pointer text-sm text-red-700 underline underline-offset-4"
          >
            Eliminar
          </button>
        </form>
      ))}

      <form
        action={createSocialLinkAction}
        className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border p-4"
      >
        <select name="icon_key" defaultValue="instagram" className={`${inputClass} w-36`}>
          {SOCIAL_ICON_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <input
          name="label"
          type="text"
          required
          placeholder="Etiqueta (ej. Instagram)"
          className={`${inputClass} w-32 flex-1`}
        />
        <input
          name="url"
          type="url"
          required
          placeholder="https://…"
          className={`${inputClass} min-w-48 flex-[2]`}
        />
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Añadir red
        </button>
      </form>
    </div>
  );
}
