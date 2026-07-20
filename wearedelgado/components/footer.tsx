import Link from "next/link";
import { SocialIcon } from "./social-icon";
import type { SocialLink } from "@/lib/data/social-links";

const secondaryNav = [
  { href: "/#estudio", label: "Estudio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#proyectos", label: "Proyectos" },
  { href: "/#contacto", label: "Contacto" },
];

export function Footer({ socialLinks = [] }: { socialLinks?: SocialLink[] }) {
  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 sm:px-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-serif text-xl tracking-[0.1em]">WE ARE DELGADO</p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Estudio de branding, diseño web y dirección de arte.
          </p>
        </div>

        <nav
          aria-label="Navegación secundaria del pie de página"
          className="flex flex-col gap-3 text-sm"
        >
          {secondaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {socialLinks.length > 0 && (
          <div className="flex flex-col gap-4">
            <span className="text-sm text-muted">Síguenos</span>
            <div className="flex gap-4">
              {socialLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="cursor-pointer text-muted transition-colors hover:text-foreground"
                >
                  <SocialIcon iconKey={item.icon_key} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mx-auto mt-16 w-full max-w-7xl px-6 text-xs text-muted sm:px-10">
        © {new Date().getFullYear()} We Are Delgado. Todos los derechos
        reservados.
      </p>
    </footer>
  );
}
