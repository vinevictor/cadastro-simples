"use client";

import { useState, useTransition } from "react";
import type { AgeGroup } from "@prisma/client";
import { updateAgeGroup, deleteAgeGroup } from "./actions";

export default function GroupRow({ group }: { group: AgeGroup }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSave(formData: FormData) {
    setError(null);
    try {
      await updateAgeGroup(group.id, formData);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    }
  }

  function handleDelete() {
    if (
      !confirm(
        `Excluir o grupo "${group.label || `${group.minAge}-${group.maxAge} anos`}"? As crianças desse grupo ficarão sem grupo.`
      )
    ) {
      return;
    }
    startTransition(() => {
      deleteAgeGroup(group.id);
    });
  }

  if (editing) {
    return (
      <form
        action={handleSave}
        className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-background p-3"
      >
        <input
          type="color"
          name="color"
          defaultValue={group.color}
          className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent"
        />
        <input
          name="label"
          defaultValue={group.label ?? ""}
          placeholder="Nome (opcional)"
          className="input min-w-[9rem] flex-1"
        />
        <input
          type="number"
          name="minAge"
          defaultValue={group.minAge}
          min={0}
          required
          className="input w-20"
        />
        <span className="text-muted">a</span>
        <input
          type="number"
          name="maxAge"
          defaultValue={group.maxAge}
          min={0}
          required
          className="input w-20"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-surface hover:bg-primary-dark"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
        >
          Cancelar
        </button>
        {error && <p className="w-full text-sm text-alert">{error}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        <span
          className="h-6 w-6 shrink-0 rounded-full border border-black/10"
          style={{ backgroundColor: group.color }}
        />
        <div>
          <p className="text-sm font-medium text-foreground">
            {group.label || "Sem nome"}
          </p>
          <p className="text-xs text-muted">
            {group.minAge} a {group.maxAge} anos
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted hover:border-alert hover:text-alert disabled:opacity-60"
        >
          {pending ? "Removendo..." : "Excluir"}
        </button>
      </div>
    </div>
  );
}
