"use client";

import { useState } from "react";
import { DAY_OPTIONS } from "@/lib/constants";
import { suggestAgeGroup } from "@/lib/age-group";
import { calculateAge } from "@/lib/utils";
import type { Child, AgeGroup } from "@prisma/client";

type Props = {
  child?: Child | null;
  groups: AgeGroup[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

function toDateInputValue(date: Date | undefined | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default function ChildForm({
  child,
  groups,
  action,
  submitLabel
}: Props) {
  const [hasAllergy, setHasAllergy] = useState(child?.hasAllergy ?? false);
  const [takesMedication, setTakesMedication] = useState(
    child?.takesMedication ?? false
  );
  const [hasDietRestriction, setHasDietRestriction] = useState(
    child?.hasDietRestriction ?? false
  );
  const [ageGroupId, setAgeGroupId] = useState(child?.ageGroupId ?? "");
  const [groupTouched, setGroupTouched] = useState(!!child?.ageGroupId);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const selectedDays = new Set((child?.days ?? "").split(",").filter(Boolean));

  function handleBirthDateChange(value: string) {
    if (groupTouched || !value) return;
    const birthDate = new Date(`${value}T00:00:00.000Z`);
    if (isNaN(birthDate.getTime())) return;
    const suggested = suggestAgeGroup(calculateAge(birthDate), groups);
    setAgeGroupId(suggested?.id ?? "");
  }

  async function handleAction(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      await action(formData);
    } catch (e) {
      // O redirect() do Next.js funciona lançando um erro especial que
      // precisa continuar propagando — não deve ser tratado como falha.
      const digest = (e as { digest?: string } | null)?.digest;
      if (digest?.startsWith("NEXT_REDIRECT")) {
        throw e;
      }
      setPending(false);
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    }
  }

  return (
    <form action={handleAction} className="space-y-8">
      {error && (
        <p className="rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert">
          {error}
        </p>
      )}

      {/* Dados da criança */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Dados da criança
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nome da criança" required>
            <input
              name="name"
              defaultValue={child?.name}
              required
              className="input"
            />
          </Field>
          <Field label="Data de nascimento" required>
            <input
              name="birthDate"
              type="date"
              defaultValue={toDateInputValue(child?.birthDate)}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              required
              className="input"
            />
          </Field>
          <Field
            label="Grupo (faixa etária)"
            hint="Sugerido automaticamente pela data de nascimento — troque se quiser"
          >
            <select
              name="ageGroupId"
              value={ageGroupId}
              onChange={(e) => {
                setAgeGroupId(e.target.value);
                setGroupTouched(true);
              }}
              className="input"
            >
              <option value="">Sem grupo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label ? `${g.label} · ` : ""}
                  {g.minAge}-{g.maxAge} anos
                </option>
              ))}
            </select>
            {ageGroupId && (
              <span
                className="mt-1.5 inline-block h-3 w-3 rounded-full align-middle"
                style={{
                  backgroundColor: groups.find((g) => g.id === ageGroupId)
                    ?.color
                }}
              />
            )}
          </Field>
        </div>
      </section>

      {/* Responsáveis */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Responsáveis
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nome da mãe" required>
            <input
              name="motherName"
              defaultValue={child?.motherName}
              required
              className="input"
            />
          </Field>
          <Field label="Nome do pai">
            <input
              name="fatherName"
              defaultValue={child?.fatherName ?? ""}
              className="input"
            />
          </Field>
          <Field
            label="Telefones para contato"
            required
            hint="Separe por vírgula, se houver mais de um"
          >
            <input
              name="phones"
              defaultValue={child?.phones}
              required
              placeholder="(11) 99999-9999, (11) 98888-8888"
              className="input"
            />
          </Field>
          <Field label="Equipe que os pais estão trabalhando no encontro">
            <input
              name="team"
              defaultValue={child?.team ?? ""}
              placeholder="Ex: Cozinha, Recepção, Louvor..."
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* Saúde */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Saúde e alimentação
        </h2>
        <div className="mt-4 space-y-4">
          <CheckWithDetail
            label="A criança possui alguma alergia?"
            name="hasAllergy"
            checked={hasAllergy}
            onChange={setHasAllergy}
            detailName="allergyDesc"
            detailLabel="Qual alergia?"
            detailDefault={child?.allergyDesc ?? ""}
          />
          <CheckWithDetail
            label="A criança toma algum medicamento?"
            name="takesMedication"
            checked={takesMedication}
            onChange={setTakesMedication}
            detailName="medicationDesc"
            detailLabel="Qual medicamento?"
            detailDefault={child?.medicationDesc ?? ""}
          />
          <CheckWithDetail
            label="A criança possui alguma restrição alimentar?"
            name="hasDietRestriction"
            checked={hasDietRestriction}
            onChange={setHasDietRestriction}
            detailName="dietRestrictionDesc"
            detailLabel="Qual restrição?"
            detailDefault={child?.dietRestrictionDesc ?? ""}
          />

          <label className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-3">
            <input
              type="checkbox"
              name="willEat"
              defaultChecked={child?.willEat ?? true}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-foreground">
              A criança fará as alimentações no encontro?
            </span>
          </label>
        </div>
      </section>

      {/* Permanência */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Permanência no encontro
        </h2>
        <div className="mt-4">
          <span className="mb-2 block text-sm font-medium text-foreground">
            A criança ficará quais dias do encontro?
          </span>
          <div className="flex flex-wrap gap-3">
            {DAY_OPTIONS.map((day) => (
              <label
                key={day}
                className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  name="days"
                  value={day}
                  defaultChecked={selectedDays.has(day)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Field label="Observações relevantes">
            <textarea
              name="notes"
              defaultValue={child?.notes ?? ""}
              rows={3}
              className="input resize-none"
              placeholder="Qualquer informação adicional importante..."
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2.5 font-medium text-surface transition hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-alert"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function CheckWithDetail({
  label,
  name,
  checked,
  onChange,
  detailName,
  detailLabel,
  detailDefault
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  detailName: string;
  detailLabel: string;
  detailDefault: string;
}) {
  return (
    <div className="rounded-lg border border-border px-3.5 py-3">
      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <span className="text-sm text-foreground">{label}</span>
      </label>
      {checked && (
        <div className="mt-2.5 pl-6">
          <input
            name={detailName}
            defaultValue={detailDefault}
            placeholder={detailLabel}
            className="input"
          />
        </div>
      )}
    </div>
  );
}
