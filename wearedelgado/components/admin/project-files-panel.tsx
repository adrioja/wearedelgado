"use client";

import { useActionState } from "react";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  deleteProjectFileAction,
  downloadProjectFileAction,
  uploadProjectFileAction,
  type FilesFormState,
} from "@/app/admin/(protected)/projects/files-actions";
import type { ProjectFile } from "@/lib/data/project-files";

const initialState: FilesFormState = { status: "idle" };

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { dateStyle: "medium" });
}

export function ProjectFilesPanel({
  projectId,
  files,
}: {
  projectId: string;
  files: ProjectFile[];
}) {
  const [state, formAction, isPending] = useActionState(
    uploadProjectFileAction,
    initialState
  );

  return (
    <div className="mt-10 max-w-xl border-t border-border pt-8">
      <div className="mb-1 flex items-center gap-2">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-muted">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <h2 className="font-serif text-lg">Archivos internos</h2>
      </div>
      <p className="mb-4 text-xs text-muted">
        Facturas, contratos, etc. Nunca accesibles desde la web pública; la descarga usa un enlace firmado de 60 segundos.
      </p>

      {files.length > 0 && (
        <ul className="mb-6 flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted">
                  {formatSize(file.size_bytes)} · {formatDate(file.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <form action={downloadProjectFileAction}>
                  <input type="hidden" name="path" value={file.path} />
                  <button
                    type="submit"
                    className="min-h-11 cursor-pointer text-sm text-accent-ink underline underline-offset-4"
                  >
                    Descargar
                  </button>
                </form>
                <form action={deleteProjectFileAction}>
                  <input type="hidden" name="id" value={file.id} />
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="path" value={file.path} />
                  <ConfirmSubmitButton
                    confirmMessage={`¿Eliminar "${file.name}"? Esta acción no se puede deshacer.`}
                    className="min-h-11 cursor-pointer text-sm text-red-700 underline underline-offset-4"
                  >
                    Eliminar
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="project_id" value={projectId} />
        <input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
          className="cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:text-foreground"
        />
        <p className="text-xs text-muted">PDF, imagen, Word o Excel. Máximo 15 MB.</p>

        <div aria-live="polite" className="min-h-6 text-sm">
          {state.status === "error" && <p className="text-red-700">{state.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-fit cursor-pointer rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Subiendo…" : "Subir archivo"}
        </button>
      </form>
    </div>
  );
}
