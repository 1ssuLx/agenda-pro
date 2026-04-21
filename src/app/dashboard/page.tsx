import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import ConcluirButton from "@/components/dashboard/ConcluirButton";
import { formatTime } from "@/lib/date";

const TZ = "America/Sao_Paulo";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  agendado:       { label: "Agendado",       className: "bg-neutral-100 text-neutral-600" },
  confirmado:     { label: "Confirmado",     className: "bg-green-100 text-green-700" },
  cancelado:      { label: "Cancelado",      className: "bg-red-100 text-red-700" },
  concluido:      { label: "Concluído",      className: "bg-blue-100 text-blue-700" },
  nao_compareceu: { label: "Não compareceu", className: "bg-orange-100 text-orange-700" },
};

async function getTenantIdFromUser() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) redirect("/sign-in");

  const profissional = await prisma.profissional.findFirst({
    where: { email },
    select: { tenantId: true },
  });

  if (!profissional) redirect("/sign-in");
  return profissional.tenantId;
}

export default async function DashboardPage() {
  const tenantId = await getTenantIdFromUser();

  const agora = new Date();
  const agoraBrasilia = toZonedTime(agora, TZ);

  const inicioDia  = fromZonedTime(startOfDay(agoraBrasilia), TZ);
  const fimDia     = fromZonedTime(endOfDay(agoraBrasilia), TZ);
  const inicio7dias = fromZonedTime(startOfDay(subDays(agoraBrasilia, 6)), TZ);

  const [agendamentosHoje, metricas7dias] = await Promise.all([
    prisma.agendamento.findMany({
      where: { tenantId, dataHora: { gte: inicioDia, lte: fimDia } },
      include: {
        cliente:      { select: { nome: true } },
        profissional: { select: { nome: true } },
      },
      orderBy: { dataHora: "asc" },
    }),
    prisma.agendamento.groupBy({
      by: ["status"],
      where: { tenantId, dataHora: { gte: inicio7dias, lte: fimDia } },
      _count: { _all: true },
    }),
  ]);

  const totalHoje      = agendamentosHoje.length;
  const confirmadosHoje = agendamentosHoje.filter((a) => a.status === "confirmado").length;
  const pendentesHoje  = agendamentosHoje.filter((a) => a.status === "agendado").length;

  const total7dias      = metricas7dias.reduce((acc, g) => acc + g._count._all, 0);
  const confirmados7dias = metricas7dias.find((g) => g.status === "confirmado")?._count._all ?? 0;
  const taxaConfirmacao  = total7dias === 0 ? 0 : Math.round((confirmados7dias / total7dias) * 100);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-neutral-900">Hoje</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          titulo="Agendamentos hoje"
          valor={totalHoje}
          subtexto={`${pendentesHoje} ainda pendente${pendentesHoje !== 1 ? "s" : ""}`}
        />
        <MetricCard
          titulo="Confirmados hoje"
          valor={confirmadosHoje}
          subtexto={`de ${totalHoje} agendado${totalHoje !== 1 ? "s" : ""}`}
        />
        <MetricCard
          titulo="Taxa de confirmação"
          valor={`${taxaConfirmacao}%`}
          subtexto="nos últimos 7 dias"
        />
      </div>

      {/* Agendamentos do dia */}
      {agendamentosHoje.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
          <p className="text-4xl">📅</p>
          <div>
            <p className="font-medium text-neutral-700">Nenhum agendamento para hoje</p>
            <p className="mt-1 text-sm text-neutral-400">Que tal criar um novo agendamento?</p>
          </div>
          <Link
            href="/dashboard/agendamentos/novo"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition-colors"
          >
            Criar agendamento
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {agendamentosHoje.map((agendamento) => {
            const badge = STATUS_BADGE[agendamento.status] ?? {
              label: agendamento.status,
              className: "bg-neutral-100 text-neutral-600",
            };
            const podeConclui = agendamento.status === "confirmado" || agendamento.status === "agendado";

            return (
              <div
                key={agendamento.id}
                className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3"
              >
                <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-neutral-500">
                  {formatTime(agendamento.dataHora)}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {agendamento.cliente.nome}
                  </p>
                  <p className="truncate text-xs text-neutral-400">{agendamento.servico}</p>
                </div>

                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>

                {podeConclui && <ConcluirButton agendamentoId={agendamento.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  titulo,
  valor,
  subtexto,
}: {
  titulo: string;
  valor: string | number;
  subtexto: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{titulo}</p>
      <p className="mt-2 text-3xl font-bold text-neutral-900">{valor}</p>
      <p className="mt-1 text-xs text-neutral-400">{subtexto}</p>
    </div>
  );
}
