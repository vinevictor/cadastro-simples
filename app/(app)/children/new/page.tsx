import Link from "next/link";
import ChildForm from "../ChildForm";
import { createChild } from "../actions";

export default function NewChildPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted hover:text-primary">
          &larr; Voltar para a lista
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">
          Nova criança
        </h1>
      </div>

      <ChildForm action={createChild} submitLabel="Cadastrar criança" />
    </div>
  );
}
