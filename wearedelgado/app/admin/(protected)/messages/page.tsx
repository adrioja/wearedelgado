import { getLeadsForAdmin } from "@/lib/data/leads";
import { EmptyState } from "@/components/admin/empty-state";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminMessagesPage() {
  const leads = await getLeadsForAdmin();

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl">Mensajes</h1>

      {leads.length === 0 ? (
        <EmptyState title="No hay mensajes todavía." />
      ) : (
        <div className="flex flex-col gap-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{lead.name}</p>
                <p className="text-xs text-muted">{formatDate(lead.created_at)}</p>
              </div>
              <p className="mb-3 text-sm text-accent-ink">{lead.email}</p>
              <p className="whitespace-pre-line text-sm text-muted">{lead.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
