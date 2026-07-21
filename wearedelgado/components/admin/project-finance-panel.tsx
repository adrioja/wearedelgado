"use client";

import { useActionState } from "react";
import {
  saveProjectFinanceAction,
  type FinanceFormState,
} from "@/app/admin/(protected)/projects/finance-actions";
import {
  computePaymentStatus,
  PAYMENT_STATUS_LABELS,
  type PaymentStatus,
  type ProjectFinance,
} from "@/lib/finance";
import { StatusBadge, type BadgeTone } from "@/components/admin/status-badge";

const STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  sin_presupuesto: "neutral",
  pendiente: "danger",
  parcial: "warning",
  pagado: "success",
};

const inputClass =
  "rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink";

const initialState: FinanceFormState = { status: "idle" };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

export function ProjectFinancePanel({
  projectId,
  finance,
}: {
  projectId: string;
  finance: ProjectFinance | null;
}) {
  const [state, formAction, isPending] = useActionState(
    saveProjectFinanceAction,
    initialState
  );

  const budget = finance?.budget_amount ?? null;
  const paid = finance?.paid_amount ?? 0;
  const status = computePaymentStatus(budget, paid);
  const progressPct = budget && budget > 0 ? Math.min(100, (paid / budget) * 100) : 0;

  return (
    <div className="mt-10 max-w-xl border-t border-border pt-8">
      <div className="mb-4 flex items-center gap-2">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-muted">
          <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <h2 className="font-serif text-lg">Presupuesto y pagos</h2>
      </div>
      <p className="mb-4 text-xs text-muted">
        Visible solo en el backoffice. Nunca se muestra en la web pública.
      </p>

      <div className="mb-6 flex flex-col gap-2">
        <StatusBadge label={PAYMENT_STATUS_LABELS[status]} tone={STATUS_TONE[status]} />
        {budget !== null && budget > 0 && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-background-alt">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
        <p className="text-xs text-muted">
          {formatCurrency(paid)}
          {budget !== null ? ` de ${formatCurrency(budget)}` : ""}
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="project_id" value={projectId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="budget_amount" className="text-sm text-muted">
              Presupuesto (€)
            </label>
            <input
              id="budget_amount"
              name="budget_amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={budget ?? ""}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="paid_amount" className="text-sm text-muted">
              Pagado (€)
            </label>
            <input
              id="paid_amount"
              name="paid_amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={paid}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="finance_notes" className="text-sm text-muted">
            Notas internas (opcional)
          </label>
          <textarea
            id="finance_notes"
            name="notes"
            rows={2}
            defaultValue={finance?.notes ?? ""}
            className={`resize-none ${inputClass}`}
          />
        </div>

        <div aria-live="polite" className="min-h-6 text-sm">
          {state.status === "error" && <p className="text-red-700">{state.message}</p>}
          {state.status === "success" && <p className="text-emerald-700">{state.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-fit cursor-pointer rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Guardar presupuesto"}
        </button>
      </form>
    </div>
  );
}
