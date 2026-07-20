import Link from "next/link";
import { getAllProjectsAdmin } from "@/lib/data/projects";
import { getLeadsForAdmin } from "@/lib/data/leads";

function StatTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="cursor-pointer rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent-ink"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-3 font-serif text-3xl">{value}</p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const [projects, leads] = await Promise.all([
    getAllProjectsAdmin(),
    getLeadsForAdmin(),
  ]);

  const publishedCount = projects.filter((p) => p.is_published).length;

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Proyectos" value={projects.length} href="/admin/projects" />
        <StatTile label="Publicados" value={publishedCount} href="/admin/projects" />
        <StatTile label="Mensajes" value={leads.length} href="/admin/messages" />
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/admin/projects/new"
          className="cursor-pointer rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Nuevo proyecto
        </Link>
        <Link
          href="/admin/settings"
          className="cursor-pointer rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent-ink"
        >
          Editar ajustes
        </Link>
      </div>
    </div>
  );
}
