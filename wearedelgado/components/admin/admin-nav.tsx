"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Proyectos" },
  { href: "/admin/settings", label: "Ajustes" },
  { href: "/admin/messages", label: "Mensajes" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-6" aria-label="Navegación del backoffice">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`cursor-pointer rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              isActive
                ? "border-accent bg-background-alt font-medium text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
