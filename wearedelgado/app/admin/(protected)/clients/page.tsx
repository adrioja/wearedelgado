import Link from "next/link";
import { getAllClientsAdmin } from "@/lib/data/clients";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { deleteClientAction, toggleClientActiveAction } from "./actions";

export default async function AdminClientsPage() {
  const clients = await getAllClientsAdmin();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl">Clientes</h1>
        <Link
          href="/admin/clients/new"
          className="min-h-11 cursor-pointer items-center rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 inline-flex"
        >
          Nuevo cliente
        </Link>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="No hay clientes todavía."
          action={
            <Link
              href="/admin/clients/new"
              className="cursor-pointer text-sm font-medium text-accent-ink underline underline-offset-4"
            >
              Crear el primero
            </Link>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Contacto</th>
                  <th className="px-5 py-3 font-medium">Email / Teléfono</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-border last:border-0 hover:bg-background-alt">
                    <td className="px-5 py-4 font-medium">{client.name}</td>
                    <td className="px-5 py-4 text-muted">{client.contact_person || "—"}</td>
                    <td className="px-5 py-4 text-muted">
                      <div className="flex flex-col">
                        <span>{client.email || "—"}</span>
                        <span>{client.phone || ""}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ClientActiveToggle id={client.id} isActive={client.is_active} />
                    </td>
                    <td className="px-5 py-4">
                      <ClientRowActions id={client.id} name={client.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden">
            {clients.map((client) => (
              <li key={client.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="font-medium">{client.name}</p>
                  <ClientActiveToggle id={client.id} isActive={client.is_active} />
                </div>
                {client.contact_person && (
                  <p className="text-sm text-muted">{client.contact_person}</p>
                )}
                <p className="text-sm text-muted">{client.email || "—"}</p>
                {client.phone && <p className="text-sm text-muted">{client.phone}</p>}
                <div className="mt-3">
                  <ClientRowActions id={client.id} name={client.name} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ClientActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <form action={toggleClientActiveAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="next_active" value={(!isActive).toString()} />
      <button type="submit" className="cursor-pointer">
        <StatusBadge label={isActive ? "Activo" : "Inactivo"} tone={isActive ? "success" : "neutral"} />
      </button>
    </form>
  );
}

function ClientRowActions({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex items-center gap-4">
      <Link
        href={`/admin/clients/${id}/edit`}
        className="cursor-pointer text-accent-ink underline underline-offset-4"
      >
        Editar
      </Link>
      <form action={deleteClientAction}>
        <input type="hidden" name="id" value={id} />
        <ConfirmSubmitButton
          confirmMessage={`¿Eliminar "${name}"? Los proyectos asociados no se borrarán, solo se desvincularán de este cliente.`}
          className="cursor-pointer text-red-700 underline underline-offset-4"
        >
          Eliminar
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
