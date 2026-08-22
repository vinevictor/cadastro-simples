import type { AgeGroup } from "@prisma/client";

/**
 * Retorna o primeiro grupo cuja faixa (minAge–maxAge) contém a idade dada.
 * Os grupos devem estar ordenados por minAge para um resultado previsível
 * quando as faixas se sobrepõem.
 */
export function suggestAgeGroup(
  age: number,
  groups: Pick<AgeGroup, "id" | "minAge" | "maxAge">[]
) {
  return groups.find((g) => age >= g.minAge && age <= g.maxAge) ?? null;
}
