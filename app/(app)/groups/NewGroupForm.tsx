"use client";

import { useState, useRef } from "react";
import { createAgeGroup } from "./actions";

export default function NewGroupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      await createAgeGroup(formData);
      formRef.current?.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar grupo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={handleAction}
      className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-border bg-background p-3"
    >
      <label className="block">
        <span className="mb-1 block text-xs text-muted">Cor</span>
        <input
          type="color"
          name="color"
          defaultValue="#8B5CF6"
          className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent"
        />
      </label>
      <label className="block flex-1 min-w-[9rem]">
        <span className="mb-1 block text-xs text-muted">Nome (opcional)</span>
        <input name="label" placeholder="Ex: Roxo" className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-muted">De</span>
        <input
          type="number"
          name="minAge"
          min={0}
          required
          className="input w-20"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-muted">Até</span>
        <input
          type="number"
          name="maxAge"
          min={0}
          required
          className="input w-20"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-surface hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Criando..." : "+ Adicionar grupo"}
      </button>
      {error && <p className="w-full text-sm text-alert">{error}</p>}
    </form>
  );
}
