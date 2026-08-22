"use client";

import { useState, useTransition } from "react";
import { deleteChild } from "./actions";

export default function DeleteButton({
  id,
  name
}: {
  id: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (
      !confirm(
        `Remover o cadastro de "${name}"? Essa ação não pode ser desfeita.`
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await deleteChild(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao excluir.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition hover:border-alert hover:text-alert disabled:opacity-60"
      >
        {pending ? "Removendo..." : "Excluir"}
      </button>
      {error && <p className="text-xs text-alert">{error}</p>}
    </div>
  );
}
