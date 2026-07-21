"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "./admin-nav";
import { signOutAction } from "@/app/admin/actions";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
      <p className="font-serif text-sm tracking-[0.1em]">WE ARE DELGADO</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-foreground"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-pointer bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-6">
              <div>
                <p className="font-serif text-base tracking-[0.1em]">WE ARE DELGADO</p>
                <p className="text-xs text-muted">Admin</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-muted hover:text-foreground"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div onClick={() => setOpen(false)} className="flex flex-1 flex-col">
              <AdminNav />
            </div>
            <div className="border-t border-border px-3 py-4">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="min-h-11 w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-muted transition-colors hover:text-foreground"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
