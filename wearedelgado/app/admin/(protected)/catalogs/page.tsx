import Link from "next/link";
import { getAllCatalogsAdmin, type Catalog } from "@/lib/data/catalogs";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  deleteCatalogAction,
  reorderCatalogAction,
  toggleCatalogPublishedAction,
} from "./actions";

export default async function AdminCatalogsPage() {
  const catalogs = await getAllCatalogsAdmin();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl">Catálogos</h1>
        <Link
          href="/admin/catalogs/new"
          className="min-h-11 inline-flex cursor-pointer items-center rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Nuevo catálogo
        </Link>
      </div>

      {catalogs.length === 0 ? (
        <EmptyState
          title="No hay catálogos todavía."
          action={
            <Link
              href="/admin/catalogs/new"
              className="cursor-pointer text-sm font-medium text-accent-ink underline underline-offset-4"
            >
              Subir el primero
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
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Descargas</th>
                  <th className="px-5 py-3 font-medium">Orden</th>
                  <th className="px-5 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {catalogs.map((catalog, index) => (
                  <tr key={catalog.id} className="border-b border-border last:border-0 hover:bg-background-alt">
                    <td className="px-5 py-4 font-medium">{catalog.name}</td>
                    <td className="px-5 py-4">
                      <PublishToggle catalog={catalog} />
                    </td>
                    <td className="px-5 py-4 text-muted">{catalog.download_count}</td>
                    <td className="px-5 py-4">
                      <ReorderButtons catalog={catalog} index={index} total={catalogs.length} />
                    </td>
                    <td className="px-5 py-4">
                      <CatalogRowActions catalog={catalog} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden">
            {catalogs.map((catalog, index) => (
              <li key={catalog.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="font-medium">{catalog.name}</p>
                  <PublishToggle catalog={catalog} />
                </div>
                <p className="text-sm text-muted">{catalog.download_count} descargas</p>
                <div className="mt-3 flex items-center justify-between">
                  <ReorderButtons catalog={catalog} index={index} total={catalogs.length} />
                  <CatalogRowActions catalog={catalog} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function PublishToggle({ catalog }: { catalog: Catalog }) {
  return (
    <form action={toggleCatalogPublishedAction}>
      <input type="hidden" name="id" value={catalog.id} />
      <input
        type="hidden"
        name="next_published"
        value={(!catalog.is_published).toString()}
      />
      <button
        type="submit"
        className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium ${
          catalog.is_published
            ? "bg-emerald-100 text-emerald-800"
            : "bg-background-alt text-muted"
        }`}
      >
        {catalog.is_published ? "Publicado" : "Oculto"}
      </button>
    </form>
  );
}

function ReorderButtons({
  catalog,
  index,
  total,
}: {
  catalog: Catalog;
  index: number;
  total: number;
}) {
  return (
    <div className="flex gap-1">
      <form action={reorderCatalogAction}>
        <input type="hidden" name="id" value={catalog.id} />
        <input type="hidden" name="direction" value="up" />
        <button
          type="submit"
          disabled={index === 0}
          aria-label="Subir"
          className="min-h-11 min-w-11 cursor-pointer rounded p-1 text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          ↑
        </button>
      </form>
      <form action={reorderCatalogAction}>
        <input type="hidden" name="id" value={catalog.id} />
        <input type="hidden" name="direction" value="down" />
        <button
          type="submit"
          disabled={index === total - 1}
          aria-label="Bajar"
          className="min-h-11 min-w-11 cursor-pointer rounded p-1 text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          ↓
        </button>
      </form>
    </div>
  );
}

function CatalogRowActions({ catalog }: { catalog: Catalog }) {
  return (
    <div className="flex items-center gap-4">
      <a
        href={catalog.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer text-muted underline underline-offset-4 hover:text-foreground"
      >
        Ver PDF
      </a>
      <Link
        href={`/admin/catalogs/${catalog.id}/edit`}
        className="cursor-pointer text-accent-ink underline underline-offset-4"
      >
        Editar
      </Link>
      <form action={deleteCatalogAction}>
        <input type="hidden" name="id" value={catalog.id} />
        <input type="hidden" name="file_path" value={catalog.file_path} />
        <input type="hidden" name="cover_path" value={catalog.cover_image_path ?? ""} />
        <ConfirmSubmitButton
          confirmMessage={`¿Eliminar "${catalog.name}"? Esta acción no se puede deshacer.`}
          className="cursor-pointer text-red-700 underline underline-offset-4"
        >
          Eliminar
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
