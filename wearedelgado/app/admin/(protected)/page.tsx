import Link from "next/link";
import { getAllProjectsAdmin } from "@/lib/data/projects";
import { getLeadsForAdmin } from "@/lib/data/leads";
import { getAllClientsAdmin } from "@/lib/data/clients";

function StatTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="cursor-pointer rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent-ink sm:p-6"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-3 font-serif text-3xl">{value}</p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const [projects, leads, clients] = await Promise.all([
    getAllProjectsAdmin(),
    getLeadsForAdmin(),
    getAllClientsAdmin(),
  ]);

  const publishedCount = projects.filter((p) => p.is_published).length;
  const newLeadsCount = leads.filter((l) => l.status === "nuevo").length;
  const activeClientsCount = clients.filter((c) => c.is_active).length;

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <StatTile label="Proyectos" value={projects.length} href="/admin/projects" />
        <StatTile label="Publicados" value={publishedCount} href="/admin/projects" />
        <StatTile label="Clientes activos" value={activeClientsCount} href="/admin/clients" />
        <StatTile label="Mensajes nuevos" value={newLeadsCount} href="/admin/messages?status=nuevo" />
        <StatTile label="Mensajes totales" value={leads.length} href="/admin/messages" />
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/admin/projects/new"
          className="min-h-11 cursor-pointer items-center rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 inline-flex"
        >
          Nuevo proyecto
        </Link>
        <Link
          href="/admin/clients/new"
          className="min-h-11 cursor-pointer items-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent-ink inline-flex"
        >
          Nuevo cliente
        </Link>
        <Link
          href="/admin/settings"
          className="min-h-11 cursor-pointer items-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent-ink inline-flex"
        >
          Editar ajustes
        </Link>
      </div>
    </div>
  );
}
