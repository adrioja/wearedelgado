export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "en_proceso"
  | "cerrado"
  | "descartado";

export const LEAD_STATUSES: LeadStatus[] = [
  "nuevo",
  "contactado",
  "en_proceso",
  "cerrado",
  "descartado",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_proceso: "En proceso",
  cerrado: "Cerrado",
  descartado: "Descartado",
};
