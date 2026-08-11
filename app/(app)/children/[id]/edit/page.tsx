import Link from "next/link";
import { notFound } from "next/navigation";
import ChildForm from "../../ChildForm";
import { getChildById, updateChild } from "../../actions";

export default async function EditChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const child = await getChildById(id);

  if (!child) notFound();

  const action = updateChild.bind(null, id);

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted hover:text-primary">
          &larr; Voltar para a lista
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">
          Editar {child.name}
        </h1>
      </div>

      <ChildForm child={child} action={action} submitLabel="Salvar alterações" />
    </div>
  );
}
