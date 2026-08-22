import Link from "next/link";
import { getAgeGroups } from "./actions";
import GroupRow from "./GroupRow";
import NewGroupForm from "./NewGroupForm";

export default async function GroupsPage() {
  const groups = await getAgeGroups();

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted hover:text-primary">
          &larr; Voltar para a lista
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">
          Grupos por faixa etária
        </h1>
        <p className="text-sm text-muted">
          Defina as faixas de idade e cores. As crianças são encaixadas
          automaticamente, mas você pode trocar o grupo de cada uma no
          cadastro.
        </p>
      </div>

      <div className="space-y-3">
        {groups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
            Nenhum grupo criado ainda.
          </p>
        ) : (
          groups.map((group) => <GroupRow key={group.id} group={group} />)
        )}

        <NewGroupForm />
      </div>
    </div>
  );
}
