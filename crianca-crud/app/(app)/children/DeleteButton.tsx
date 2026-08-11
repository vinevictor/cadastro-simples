"use client";

import { useTransition } from "react";
import { deleteChild } from "./actions";

export default function DeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Remover o cadastro de "${name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    startTransition(() => {
      deleteChild(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition hover:border-alert hover:text-alert disabled:opacity-60"
    >
      {pending ? "Removendo..." : "Excluir"}
    </button>
  );
}
