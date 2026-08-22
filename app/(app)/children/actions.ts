"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

export type ChildFilters = {
  q?: string;
  team?: string;
  day?: string;
  onlyHealthNotes?: boolean;
  ageGroupId?: string;
};

export async function getChildren(filters: ChildFilters) {
  const AND: Prisma.ChildWhereInput[] = [];

  if (filters.q) {
    AND.push({
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { motherName: { contains: filters.q, mode: "insensitive" } },
        { fatherName: { contains: filters.q, mode: "insensitive" } }
      ]
    });
  }

  if (filters.team) {
    AND.push({ team: { equals: filters.team, mode: "insensitive" } });
  }

  if (filters.day) {
    AND.push({ days: { contains: filters.day } });
  }

  if (filters.onlyHealthNotes) {
    AND.push({
      OR: [
        { hasAllergy: true },
        { takesMedication: true },
        { hasDietRestriction: true }
      ]
    });
  }

  if (filters.ageGroupId) {
    AND.push({ ageGroupId: filters.ageGroupId });
  }

  return prisma.child.findMany({
    where: { AND },
    include: { ageGroup: true },
    orderBy: { name: "asc" }
  });
}

export async function getDistinctTeams() {
  const rows = await prisma.child.findMany({
    where: { team: { not: null } },
    select: { team: true },
    distinct: ["team"]
  });
  return rows
    .map((r) => r.team)
    .filter((t): t is string => !!t && t.trim() !== "")
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export async function getChildById(id: string) {
  return prisma.child.findUnique({ where: { id } });
}

function buildDataFromForm(formData: FormData) {
  const days = formData.getAll("days").map(String);
  const hasAllergy = formData.get("hasAllergy") === "on";
  const takesMedication = formData.get("takesMedication") === "on";
  const hasDietRestriction = formData.get("hasDietRestriction") === "on";
  const willEat = formData.get("willEat") === "on";

  const birthDateRaw = String(formData.get("birthDate") ?? "");
  const ageGroupId = String(formData.get("ageGroupId") ?? "").trim() || null;

  return {
    name: String(formData.get("name") ?? "").trim(),
    birthDate: new Date(`${birthDateRaw}T00:00:00.000Z`),
    ageGroupId,
    motherName: String(formData.get("motherName") ?? "").trim(),
    fatherName: String(formData.get("fatherName") ?? "").trim() || null,
    phones: String(formData.get("phones") ?? "").trim(),
    team: String(formData.get("team") ?? "").trim() || null,
    hasAllergy,
    allergyDesc: hasAllergy
      ? String(formData.get("allergyDesc") ?? "").trim() || null
      : null,
    takesMedication,
    medicationDesc: takesMedication
      ? String(formData.get("medicationDesc") ?? "").trim() || null
      : null,
    hasDietRestriction,
    dietRestrictionDesc: hasDietRestriction
      ? String(formData.get("dietRestrictionDesc") ?? "").trim() || null
      : null,
    willEat,
    days: days.join(","),
    notes: String(formData.get("notes") ?? "").trim() || null
  };
}

export async function createChild(formData: FormData) {
  await requireAdmin();

  const data = buildDataFromForm(formData);

  if (
    !data.name ||
    !data.motherName ||
    !data.phones ||
    isNaN(data.birthDate.getTime())
  ) {
    throw new Error(
      "Preencha os campos obrigatórios: nome, data de nascimento, nome da mãe e telefone."
    );
  }

  await prisma.child.create({ data });
  revalidatePath("/");
  redirect("/");
}

export async function updateChild(id: string, formData: FormData) {
  await requireAdmin();

  const data = buildDataFromForm(formData);

  if (
    !data.name ||
    !data.motherName ||
    !data.phones ||
    isNaN(data.birthDate.getTime())
  ) {
    throw new Error(
      "Preencha os campos obrigatórios: nome, data de nascimento, nome da mãe e telefone."
    );
  }

  await prisma.child.update({ where: { id }, data });
  revalidatePath("/");
  redirect("/");
}

export async function deleteChild(id: string) {
  await requireAdmin();
  await prisma.child.delete({ where: { id } });
  revalidatePath("/");
}
