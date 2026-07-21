export type ProjectFinance = {
  project_id: string;
  budget_amount: number | null;
  paid_amount: number;
  currency: string;
  notes: string | null;
  updated_at: string;
};

export type PaymentStatus = "sin_presupuesto" | "pendiente" | "parcial" | "pagado";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  sin_presupuesto: "Sin presupuesto",
  pendiente: "Pendiente",
  parcial: "Pago parcial",
  pagado: "Pagado",
};

export function computePaymentStatus(
  budget: number | null,
  paid: number
): PaymentStatus {
  if (budget === null) return "sin_presupuesto";
  if (paid <= 0) return "pendiente";
  if (paid >= budget) return "pagado";
  return "parcial";
}
