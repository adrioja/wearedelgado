"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useState } from "react";

const navLinks = [
  { href: "/#estudio", label: "Estudio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#proyectos", label: "Proyectos" },
  { href: "/#catalogos", label: "Catálogos" },
  { href: "/#contacto", label: "Contacto" },
];

export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 64);
  });

  const background = useTransform(
    scrollY,
    [0, 96],
    ["rgba(250, 247, 242, 0)", "rgba(250, 247, 242, 1)"]
  );
  const borderColor = useTransform(
    scrollY,
    [0, 96],
    ["rgba(228, 221, 211, 0)", "rgba(228, 221, 211, 1)"]
  );

  return (
    <motion.header
      style={{
        backgroundColor: background,
        borderColor,
        viewTransitionName: "site-header",
      }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "text-foreground" : "text-white"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 transition-colors duration-300 sm:px-10">
        <nav className="hidden gap-8 text-sm tracking-wide sm:flex" aria-label="Navegación secundaria">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer transition-opacity hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/#top"
          className="cursor-pointer font-serif text-lg tracking-[0.15em] sm:absolute sm:left-1/2 sm:-translate-x-1/2"
        >
          WE ARE DELGADO
        </Link>

        <nav className="hidden gap-8 text-sm tracking-wide sm:flex" aria-label="Navegación principal">
          {navLinks.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer transition-opacity hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <MobileMenu scrolled={scrolled} />
      </div>
    </motion.header>
  );
}

function MobileMenu({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className={`absolute inset-x-0 top-20 flex flex-col gap-1 border-b px-6 py-6 text-base ${
            scrolled ? "bg-background text-foreground" : "bg-foreground text-background"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="cursor-pointer py-2"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
