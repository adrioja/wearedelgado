import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data/clients";
import { getProjectsByClientId } from "@/lib/data/projects";
import { ClientForm } from "../../client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, projects] = await Promise.all([
    getClientById(id),
    getProjectsByClientId(id),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl">Editar cliente</h1>
      <ClientForm client={client} />

      <div className="mt-10 max-w-xl border-t border-border pt-8">
        <h2 className="font-serif text-lg">Proyectos de este cliente</h2>
        {projects.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Todavía no tiene proyectos asociados.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="cursor-pointer text-sm text-accent-ink underline underline-offset-4"
                >
                  {project.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
