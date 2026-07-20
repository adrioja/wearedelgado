import { ArrowLink } from "./arrow-link";
import { Reveal } from "./reveal";

const services = [
  {
    number: "01",
    title: "Branding",
    description:
      "Estrategia de marca, naming, identidad visual y sistemas de diseño coherentes en cada punto de contacto.",
  },
  {
    number: "02",
    title: "Diseño web",
    description:
      "Webs y productos digitales rápidos, accesibles y construidos para durar más de una temporada.",
  },
  {
    number: "03",
    title: "Dirección de arte",
    description:
      "Fotografía, vídeo y contenido con un criterio visual claro para campañas y redes.",
  },
  {
    number: "04",
    title: "Estrategia",
    description:
      "Posicionamiento, arquitectura de marca y acompañamiento a largo plazo.",
  },
];

export function ServicesSection() {
  return (
    <section
      id="servicios"
      className="flex min-h-screen items-center bg-background-alt py-32"
    >
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-10">
        <Reveal>
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-muted">
            Servicios
          </p>
          <h2 className="mb-16 text-balance font-serif text-3xl leading-snug sm:text-4xl md:text-5xl">
            Qué hacemos
          </h2>
        </Reveal>

        <ul className="divide-y divide-border border-t border-border">
          {services.map((service, index) => (
            <Reveal key={service.number} delay={index * 0.05}>
              <li className="flex flex-col gap-4 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
                <div className="flex items-baseline gap-6 sm:w-1/2">
                  <span className="font-serif text-lg text-muted">
                    {service.number}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl">
                    {service.title}
                  </h3>
                </div>
                <p className="max-w-md text-pretty text-muted sm:w-1/2">
                  {service.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.2} className="mt-16">
          <ArrowLink href="#contacto">Cuéntanos tu proyecto</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
