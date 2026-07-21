"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/dal";

export type FinanceFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function saveProjectFinanceAction(
  _prevState: FinanceFormState,
  formData: FormData
): Promise<FinanceFormState> {
  const { supabase } = await requireAdminSession();

  const projectId = String(formData.get("project_id") ?? "").trim();
  const budgetRaw = String(formData.get("budget_amount") ?? "").trim();
  const paidRaw = String(formData.get("paid_amount") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!projectId) {
    return { status: "error", message: "Proyecto no válido." };
  }

  const budgetAmount = budgetRaw === "" ? null : Number(budgetRaw);
  const paidAmount = paidRaw === "" ? 0 : Number(paidRaw);

  if (budgetAmount !== null && (!Number.isFinite(budgetAmount) || budgetAmount < 0)) {
    return { status: "error", message: "El presupuesto debe ser un número positivo." };
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    return { status: "error", message: "El importe pagado debe ser un número positivo." };
  }

  const { error } = await supabase.from("project_finance").upsert(
    {
      project_id: projectId,
      budget_amount: budgetAmount,
      paid_amount: paidAmount,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "project_id" }
  );

  if (error) {
    console.error("saveProjectFinanceAction error", error);
    return { status: "error", message: "No se pudo guardar el presupuesto." };
  }

  revalidatePath(`/admin/projects/${projectId}/edit`);
  return { status: "success", message: "Presupuesto actualizado." };
}
