import Link from "next/link";

const secondaryNav = [
  { href: "#estudio", label: "Estudio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#contacto", label: "Contacto" },
];

const social = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <path
        d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm6.25-.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
      />
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <path
        d="M6.5 9v9M6.5 6.01V6M11 18v-5.5c0-1.5 1-3 3-3s3 1.5 3 3V18M11 9v9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    ),
  },
  {
    label: "Behance",
    href: "https://behance.net",
    icon: (
      <path
        d="M4 8h6a2.5 2.5 0 0 1 0 5H4V8Zm0 5h6.5a2.5 2.5 0 0 1 0 5H4v-5ZM15 11.5c0-1.4 1.2-2.5 3-2.5s3 1.1 3 2.5v.5h-5c0 1.2.8 2 2 2 .8 0 1.4-.3 1.8-.8M15.5 8h4"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    ),
  },
];

export function Footer() {
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

        <div className="flex flex-col gap-4">
          <span className="text-sm text-muted">Síguenos</span>
          <div className="flex gap-4">
            {social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="cursor-pointer text-muted transition-colors hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  {item.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <p className="mx-auto mt-16 w-full max-w-7xl px-6 text-xs text-muted sm:px-10">
        © {new Date().getFullYear()} We Are Delgado. Todos los derechos
        reservados.
      </p>
    </footer>
  );
}
