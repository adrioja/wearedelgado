"use client";

import { updateLeadStatusAction } from "@/app/admin/(protected)/messages/actions";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from "@/lib/leads";

export function LeadStatusSelect({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  return (
    <form action={updateLeadStatusAction}>
      <input type="hidden" name="id" value={leadId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        aria-label="Estado del mensaje"
        className="min-h-11 cursor-pointer rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent-ink"
      >
        {LEAD_STATUSES.map((status) => (
          <option key={status} value={status}>
            {LEAD_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </form>
  );
}
