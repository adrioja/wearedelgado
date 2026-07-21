import Link from "next/link";
import { getLeadsForAdmin, LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/data/leads";
import { EmptyState } from "@/components/admin/empty-state";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { StatusBadge, type BadgeTone } from "@/components/admin/status-badge";

const STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  nuevo: "info",
  contactado: "neutral",
  en_proceso: "warning",
  cerrado: "success",
  descartado: "danger",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = LEAD_STATUSES.includes(status as LeadStatus)
    ? (status as LeadStatus)
    : null;

  const allLeads = await getLeadsForAdmin();
  const leads = activeStatus
    ? allLeads.filter((lead) => lead.status === activeStatus)
    : allLeads;

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl">Mensajes</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip href="/admin/messages" active={!activeStatus}>
          Todos ({allLeads.length})
        </FilterChip>
        {LEAD_STATUSES.map((s) => (
          <FilterChip key={s} href={`/admin/messages?status=${s}`} active={activeStatus === s}>
            {LEAD_STATUS_LABELS[s]} ({allLeads.filter((l) => l.status === s).length})
          </FilterChip>
        ))}
      </div>

      {leads.length === 0 ? (
        <EmptyState title="No hay mensajes con este filtro." />
      ) : (
        <div className="flex flex-col gap-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-xs text-muted">{formatDate(lead.created_at)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge label={LEAD_STATUS_LABELS[lead.status]} tone={STATUS_TONE[lead.status]} />
                  <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <a href={`mailto:${lead.email}`} className="cursor-pointer text-accent-ink underline underline-offset-4">
                  {lead.email}
                </a>
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="cursor-pointer text-accent-ink underline underline-offset-4">
                    {lead.phone}
                  </a>
                )}
              </div>
              <p className="whitespace-pre-line text-sm text-muted">{lead.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`min-h-11 cursor-pointer items-center rounded-full border px-4 py-2 text-sm transition-colors inline-flex ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-surface text-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
