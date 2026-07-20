import type { ReactNode } from "react";
import { signOutAction } from "@/app/admin/actions";
import { AdminNav } from "./admin-nav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background-alt">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-6 py-6">
          <p className="font-serif text-base tracking-[0.1em]">
            WE ARE DELGADO
          </p>
          <p className="text-xs text-muted">Admin</p>
        </div>

        <AdminNav />

        <div className="border-t border-border px-3 py-4">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-muted transition-colors hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 px-8 py-10 sm:px-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
