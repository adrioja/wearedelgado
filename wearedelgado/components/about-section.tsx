import { ParallaxImage } from "./parallax-image";
import { Reveal } from "./reveal";

export function AboutSection() {
  return (
    <section
      id="estudio"
      className="flex min-h-screen items-center bg-background py-32"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-6 sm:px-10 md:grid-cols-2 md:items-center md:gap-24">
        <Reveal>
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-muted">
            Estudio
          </p>
          <h2 className="text-balance font-serif text-3xl leading-snug sm:text-4xl md:text-5xl">
            Un estudio pequeño, con procesos de agencia grande.
          </h2>
          <p className="mt-8 max-w-md text-pretty text-base leading-relaxed text-muted sm:text-lg">
            We Are Delgado nace de la convicción de que el buen diseño no
            grita: acompaña. Trabajamos codo a codo con cada cliente para
            construir identidades y experiencias digitales que envejecen bien,
            desde la primera línea de código hasta el último milímetro de un
            logotipo.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ParallaxImage
            label="Estudio — Barcelona"
            className="aspect-[4/5] w-full rounded-sm"
          />
        </Reveal>
      </div>
    </section>
  );
}
