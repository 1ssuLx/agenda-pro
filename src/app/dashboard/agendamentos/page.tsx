import Link from "next/link";
import { redirect } from "next/navigation";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from "date-fns";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import FilterBar from "@/components/dashboard/FilterBar";
import AgendamentoActionsMenu from "@/components/dashboard/AgendamentoActionsMenu";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/date";

const TZ = "America/Sao_Paulo";
const PAGE_SIZE = 20;

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  agendado:       { label: "Agendado",       className: "bg-neutral-100 text-neutral-600" },
  confirmado:     { label: "Confirmado",     className: "bg-green-100 text-green-700" },
  cancelado:      { label: "Cancelado",      className: "bg-red-100 text-red-700" },
  concluido:      { label: "Concluído",      className: "bg-blue-100 text-blue-700" },
  nao_compareceu: { label: "Não compareceu", className: "bg-orange-100 text-orange-700" },
};

function calcIntervalo(periodo: string) {
  const agora = toZonedTime(new Date(), TZ);
  switch (periodo) {
    case "amanha": {
      const amanha = addDays(agora, 1);
      return { inicio: fromZonedTime(startOfDay(amanha), TZ), fim: fromZonedTime(endOfDay(amanha), TZ) };
    }
    case "semana":
      return {
        inicio: fromZonedTime(startOfWeek(agora, { weekStartsOn: 1 }), TZ),
        fim: fromZonedTime(endOfWeek(agora, { weekStartsOn: 1 }), TZ),
      };
    default: {
      if (/^\d{4}-\d{2}-\d{2}$/.test(periodo)) {
        return {
          inicio: fromZonedTime(`${periodo}T00:00:00`, TZ),
          fim: fromZonedTime(`${periodo}T23:59:59.999`, TZ),
        };
      }
      return { inicio: fromZonedTime(startOfDay(agora), TZ), fim: fromZonedTime(endOfDay(agora), TZ) };
    }
  }
}

interface Props {
  searchParams: Promise<{ periodo?: string; status?: string; busca?: string; page?: string }>;
}

export default async function AgendamentosPage({ searchParams }: Props) {
  const params = await searchParams;
  const periodo = params.periodo ?? "hoje";
  const statusFiltro = params.status ?? "todos";
  const busca = params.busca ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) redirect("/sign-in");

  const profissional = await prisma.profissional.findFirst({
    where: { email },
    select: { tenantId: true },
  });
  if (!profissional) redirect("/sign-in");

  const { tenantId } = profissional;
  const { inicio, fim } = calcIntervalo(periodo);

  const where = {
    tenantId,
    dataHora: { gte: inicio, lte: fim },
    ...(statusFiltro !== "todos" ? { status: statusFiltro } : {}),
    ...(busca.trim()
      ? { cliente: { nome: { contains: busca.trim(), mode: "insensitive" as const } } }
      : {}),
  };

  const [agendamentos, total] = await Promise.all([
    prisma.agendamento.findMany({
      where,
      include: { cliente: { select: { nome: true } } },
      orderBy: { dataHora: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.agendamento.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildPageUrl(p: number) {
    const sp = new URLSearchParams();
    if (periodo !== "hoje") sp.set("periodo", periodo);
    if (statusFiltro !== "todos") sp.set("status", statusFiltro);
    if (busca) sp.set("busca", busca);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/dashboard/agendamentos${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Agendamentos</h1>
        <Button asChild size="sm">
          <Link href="/dashboard/agendamentos/novo">+ Novo agendamento</Link>
        </Button>
      </div>

      {/* Filters */}
      <FilterBar periodo={periodo} status={statusFiltro} busca={busca} />

      {/* List */}
      {agendamentos.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
          <p className="text-4xl">📭</p>
          <div>
            <p className="font-medium text-neutral-700">Nenhum agendamento encontrado</p>
            <p className="mt-1 text-sm text-neutral-400">
              Tente ajustar os filtros ou crie um novo agendamento.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/agendamentos/novo">Criar agendamento</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {agendamentos.map((ag) => {
            const badge = STATUS_BADGE[ag.status] ?? {
              label: ag.status,
              className: "bg-neutral-100 text-neutral-600",
            };
            return (
              <div
                key={ag.id}
                className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3"
              >
                <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-neutral-500">
                  {formatTime(ag.dataHora)}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {ag.cliente.nome}
                  </p>
                  <p className="truncate text-xs text-neutral-400">{ag.servico}</p>
                </div>

                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>

                <AgendamentoActionsMenu agendamentoId={ag.id} />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-neutral-400">
            {total} resultado{total !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <Button
              asChild={page > 1}
              variant="outline"
              size="sm"
              disabled={page <= 1}
            >
              {page > 1 ? (
                <Link href={buildPageUrl(page - 1)}>← Anterior</Link>
              ) : (
                <span>← Anterior</span>
              )}
            </Button>
            <span className="flex items-center px-2 text-sm text-neutral-500">
              {page} / {totalPages}
            </span>
            <Button
              asChild={page < totalPages}
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
            >
              {page < totalPages ? (
                <Link href={buildPageUrl(page + 1)}>Próximo →</Link>
              ) : (
                <span>Próximo →</span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
