import { notFound } from "next/navigation";
import { getCatalogById } from "@/lib/data/catalogs";
import { CatalogForm } from "../../catalog-form";

export default async function EditCatalogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catalog = await getCatalogById(id);

  if (!catalog) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl">Editar catálogo</h1>
      <CatalogForm catalog={catalog} />
    </div>
  );
}
