import { ProjectForm } from "../project-form";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-2 font-serif text-2xl">Nuevo proyecto</h1>
      <p className="mb-8 max-w-xl text-sm text-muted">
        Tras guardarlo podrás añadir varias fotos a la galería del proyecto.
      </p>
      <ProjectForm />
    </div>
  );
}
