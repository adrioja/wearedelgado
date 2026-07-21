import { ProjectForm } from "../project-form";
import { getClientsForSelect } from "@/lib/data/clients";

export default async function NewProjectPage() {
  const clients = await getClientsForSelect();

  return (
    <div>
      <h1 className="mb-2 font-serif text-2xl">Nuevo proyecto</h1>
      <p className="mb-8 max-w-xl text-sm text-muted">
        Tras guardarlo podrás añadir varias fotos a la galería, presupuesto y archivos internos del proyecto.
      </p>
      <ProjectForm clients={clients} />
    </div>
  );
}
