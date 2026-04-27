import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { differenceInDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import SubscribeButton from "./SubscribeButton";

const TZ = "America/Sao_Paulo";

async function getTenantPlano() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) redirect("/sign-in");

  const profissional = await prisma.profissional.findFirst({
    where: { email },
    include: {
      tenant: {
        select: {
          plano: true,
          trialTerminaEm: true,
          nome: true,
        },
      },
    },
  });

  if (!profissional) redirect("/sign-in");
  return profissional.tenant;
}

const FEATURES = [
  "Agendamentos ilimitados",
  "Lembretes automáticos via WhatsApp",
  "Confirmação de presença pelo WhatsApp",
  "Múltiplos profissionais",
  "Painel em tempo real",
  "Suporte prioritário",
];

export default async function PlanoPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const tenant = await getTenantPlano();
  const params = await searchParams;
  const recemAssinou = params.plano === "ativo";

  const agora = toZonedTime(new Date(), TZ);
  const terminaBrasilia = tenant.trialTerminaEm
    ? toZonedTime(tenant.trialTerminaEm, TZ)
    : null;
  const diasRestantes = terminaBrasilia ? differenceInDays(terminaBrasilia, agora) : null;

  const trialAtivo =
    tenant.plano === "trial" && diasRestantes !== null && diasRestantes >= 0;
  const trialExpirado =
    tenant.plano === "trial" && (diasRestantes === null || diasRestantes < 0);

  const mostrarBotao = tenant.plano !== "pago";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-semibold text-neutral-900">Meu plano</h1>
      <p className="mt-1 text-sm text-neutral-500">Gerencie sua assinatura do FixouJá.</p>

      {recemAssinou && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <span className="text-lg">🎉</span>
          <div>
            <p className="text-sm font-semibold text-green-800">Assinatura ativada!</p>
            <p className="text-sm text-green-700">Bem-vindo ao FixouJá Pro. Sua agenda está completa.</p>
          </div>
        </div>
      )}

      {/* Status card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">

        {/* Status header */}
        <div
          className={[
            "flex items-center justify-between px-6 py-4",
            tenant.plano === "pago"
              ? "bg-green-50"
              : trialAtivo
              ? "bg-amber-50"
              : "bg-red-50",
          ].join(" ")}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Status atual
            </p>
            {tenant.plano === "pago" && (
              <p className="mt-0.5 text-base font-semibold text-green-700">Plano ativo</p>
            )}
            {trialAtivo && (
              <p className="mt-0.5 text-base font-semibold text-amber-700">
                Trial — {diasRestantes} dia{diasRestantes !== 1 ? "s" : ""} restante{diasRestantes !== 1 ? "s" : ""}
              </p>
            )}
            {trialExpirado && (
              <p className="mt-0.5 text-base font-semibold text-red-700">Trial expirado</p>
            )}
            {tenant.plano === "cancelado" && (
              <p className="mt-0.5 text-base font-semibold text-neutral-600">Plano cancelado</p>
            )}
            {tenant.plano === "inadimplente" && (
              <p className="mt-0.5 text-base font-semibold text-red-700">Pagamento recusado</p>
            )}
          </div>

          <StatusDot plano={tenant.plano} trialAtivo={trialAtivo} />
        </div>

        {/* Plan details */}
        <div className="px-6 py-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                FixouJá Pro
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-neutral-900">R$ 99,90</span>
                <span className="text-sm text-neutral-400">/mês</span>
              </div>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-600">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[11px] text-green-600 font-bold">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>

          {mostrarBotao && (
            <div className="mt-6">
              <SubscribeButton />
            </div>
          )}

          {tenant.plano === "pago" && (
            <p className="mt-4 text-xs text-neutral-400">
              Para cancelar ou alterar o plano, entre em contato com o suporte.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusDot({
  plano,
  trialAtivo,
}: {
  plano: string;
  trialAtivo: boolean;
}) {
  if (plano === "pago") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Ativo
      </span>
    );
  }
  if (trialAtivo) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Trial
      </span>
    );
  }
  if (plano === "inadimplente") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Inadimplente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
      Inativo
    </span>
  );
}
