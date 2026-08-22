"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAgeGroups() {
  return prisma.ageGroup.findMany({ orderBy: { minAge: "asc" } });
}

function parseGroupForm(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim() || null;
  const minAge = Number(formData.get("minAge"));
  const maxAge = Number(formData.get("maxAge"));
  const color = String(formData.get("color") ?? "#8B5CF6").trim();

  if (Number.isNaN(minAge) || Number.isNaN(maxAge)) {
    throw new Error("Informe a faixa etária (idade mínima e máxima).");
  }
  if (minAge > maxAge) {
    throw new Error("A idade mínima não pode ser maior que a máxima.");
  }

  return { label, minAge, maxAge, color };
}

export async function createAgeGroup(formData: FormData) {
  await requireAdmin();
  const data = parseGroupForm(formData);
  await prisma.ageGroup.create({ data });
  revalidatePath("/groups");
  revalidatePath("/");
}

export async function updateAgeGroup(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseGroupForm(formData);
  await prisma.ageGroup.update({ where: { id }, data });
  revalidatePath("/groups");
  revalidatePath("/");
}

export async function deleteAgeGroup(id: string) {
  await requireAdmin();
  await prisma.ageGroup.delete({ where: { id } });
  revalidatePath("/groups");
  revalidatePath("/");
}
