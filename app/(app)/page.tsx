import Link from "next/link";
import { getChildren, getDistinctTeams } from "./children/actions";
import DeleteButton from "./children/DeleteButton";
import { calculateAge, formatDate, parseList } from "@/lib/utils";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    team?: string;
    day?: string;
    health?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const team = sp.team ?? "";
  const day = sp.day ?? "";
  const onlyHealthNotes = sp.health === "1";

  const [children, teams] = await Promise.all([
    getChildren({ q, team, day, onlyHealthNotes }),
    getDistinctTeams(),
  ]);

  const hasActiveFilters = q || team || day || onlyHealthNotes;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Crianças cadastradas
          </h1>
          <p className="text-sm text-muted">
            {children.length}{" "}
            {children.length === 1 ? "criança encontrada" : "crianças encontradas"}
          </p>
        </div>
        <Link
          href="/children/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-surface transition hover:bg-primary-dark"
        >
          + Nova criança
        </Link>
      </div>

      <form
        method="get"
        className="mb-6 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-4"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome da criança ou dos pais..."
          className="input sm:col-span-2"
        />

        <select name="team" defaultValue={team} className="input">
          <option value="">Todas as equipes</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select name="day" defaultValue={day} className="input">
          <option value="">Todos os dias</option>
          <option value="Sexta-feira">Sexta-feira</option>
          <option value="Sábado">Sábado</option>
          <option value="Domingo">Domingo</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-3">
          <input
            type="checkbox"
            name="health"
            value="1"
            defaultChecked={onlyHealthNotes}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Mostrar apenas crianças com alergia, medicação ou restrição alimentar
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-surface transition hover:bg-primary-dark"
          >
            Filtrar
          </button>
          {hasActiveFilters && (
            <Link href="/" className="text-sm text-muted hover:text-primary">
              Limpar
            </Link>
          )}
        </div>

      </form>

      {children.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="font-display text-lg text-foreground">
            Nenhuma criança encontrada
          </p>
          <p className="mt-1 text-sm text-muted">
            {hasActiveFilters
              ? "Tente ajustar os filtros de busca."
              : "Cadastre a primeira criança para começar."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {children.map((child) => {
            const days = parseList(child.days);
            const phones = parseList(child.phones);
            return (
              <div
                key={child.id}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      {child.name}
                    </h2>
                    <p className="text-sm text-muted">
                      {calculateAge(child.birthDate)} anos ·{" "}
                      {formatDate(child.birthDate)}
                    </p>
                  </div>
                  {child.team && (
                    <span className="whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {child.team}
                    </span>
                  )}
                </div>

                <dl className="space-y-1.5 text-sm">
                  <Row label="Mãe" value={child.motherName} />
                  {child.fatherName && (
                    <Row label="Pai" value={child.fatherName} />
                  )}
                  <Row
                    label="Telefones"
                    value={phones.join(" · ") || "—"}
                  />
                  <Row
                    label="Dias no encontro"
                    value={days.join(", ") || "—"}
                  />
                  <Row
                    label="Alimentação"
                    value={child.willEat ? "Fará as refeições" : "Não fará as refeições"}
                  />
                </dl>

                {(child.hasAllergy ||
                  child.takesMedication ||
                  child.hasDietRestriction) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {child.hasAllergy && (
                      <Badge
                        text={`Alergia: ${child.allergyDesc || "não especificada"}`}
                      />
                    )}
                    {child.takesMedication && (
                      <Badge
                        text={`Medicação: ${child.medicationDesc || "não especificada"}`}
                      />
                    )}
                    {child.hasDietRestriction && (
                      <Badge
                        text={`Restrição alimentar: ${
                          child.dietRestrictionDesc || "não especificada"
                        }`}
                      />
                    )}
                  </div>
                )}

                {child.notes && (
                  <p className="mt-3 rounded-lg bg-background px-3 py-2 text-sm text-muted">
                    {child.notes}
                  </p>
                )}

                <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
                  <Link
                    href={`/children/${child.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                  >
                    Editar
                  </Link>
                  <DeleteButton id={child.id} name={child.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="shrink-0 font-medium text-muted">{label}:</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-alert/10 px-2.5 py-1 text-xs font-medium text-alert">
      {text}
    </span>
  );
}
