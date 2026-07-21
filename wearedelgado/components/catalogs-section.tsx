import Image from "next/image";
import { DownloadLink } from "./download-link";
import { ParallaxImage } from "./parallax-image";
import { Reveal } from "./reveal";
import { getPublishedCatalogs } from "@/lib/data/catalogs";

function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function CatalogsSection() {
  const catalogs = await getPublishedCatalogs();

  if (catalogs.length === 0) {
    return null;
  }

  return (
    <section
      id="catalogos"
      className="bg-background-alt py-32"
    >
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-10">
        <Reveal className="mb-16 max-w-2xl">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-muted">
            Catálogos
          </p>
          <h2 className="text-balance font-serif text-3xl leading-snug sm:text-4xl md:text-5xl">
            Descarga aquí nuestros catálogos y descubre más sobre nuestro
            producto y nuestra visión de marca.
          </h2>
        </Reveal>

        <ul className="divide-y divide-border border-t border-border">
          {catalogs.map((catalog, index) => {
            const fileSize = formatFileSize(catalog.file_size_bytes);

            return (
              <Reveal key={catalog.id} delay={index * 0.06}>
                <li className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:gap-10">
                  <div className="relative aspect-[3/4] w-32 shrink-0 overflow-hidden rounded-sm bg-surface shadow-sm sm:w-40">
                    {catalog.cover_image_url ? (
                      <Image
                        src={catalog.cover_image_url}
                        alt={catalog.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    ) : (
                      <ParallaxImage label="PDF" className="h-full w-full" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-serif text-2xl sm:text-3xl">
                      {catalog.name}
                    </h3>
                    {catalog.description && (
                      <p className="mt-3 max-w-md text-pretty text-muted">
                        {catalog.description}
                      </p>
                    )}
                    <div className="mt-6">
                      <DownloadLink href={catalog.file_url}>
                        Descargar PDF{fileSize ? ` · ${fileSize}` : ""}
                      </DownloadLink>
                    </div>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
