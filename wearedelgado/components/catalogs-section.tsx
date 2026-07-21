import { CatalogCard } from "./catalog-card";
import { Reveal } from "./reveal";
import { getPublishedCatalogs } from "@/lib/data/catalogs";

export async function CatalogsSection() {
  const catalogs = await getPublishedCatalogs();

  if (catalogs.length === 0) {
    return null;
  }

  return (
    <section id="catalogos" className="bg-background-alt py-32">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        <Reveal className="mb-16 max-w-2xl">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-muted">
            Catálogos
          </p>
          <h2 className="text-balance font-serif text-3xl leading-snug sm:text-4xl md:text-5xl">
            Descarga aquí nuestros catálogos y descubre más sobre nuestro
            producto y nuestra visión de marca.
          </h2>
        </Reveal>

        <div className="grid gap-16 md:grid-cols-3">
          {catalogs.map((catalog, index) => (
            <Reveal key={catalog.id} delay={index * 0.08}>
              <CatalogCard catalog={catalog} index={index} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
