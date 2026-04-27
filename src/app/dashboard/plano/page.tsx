import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { differenceInDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import SubscribeButton from "./SubscribeButton";

async function getTenantPlano() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) redirect("/sign-in");

  const profissional = await prisma.profissional.findFirst({
    where: { email },
    include: { tenant: { select: { plano: true, trialTerminaEm: true, nome: true } } },
  });

  if (!profissional) redirect("/sign-in");
  return profissional.tenant;
}

function StatusBadge({ plano, trialTerminaEm }: { plano: string; trialTerminaEm: Date | null }) {
  if (plano === "pago") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Plano ativo
      </span>
    );
  }

  if (plano === "trial" && trialTerminaEm) {
    const diasRestantes = differenceInDays(trialTerminaEm, new Date());
    const ativo = diasRestantes >= 0;
    if (ativo) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Trial — {diasRestantes} dia{diasRestantes !== 1 ? "s" : ""} restante{diasRestantes !== 1 ? "s" : ""}
        </span>
      );
    }
  }

  if (plano === "cancelado") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-600">
        <span className="h-2 w-2 rounded-full bg-neutral-400" />
        Plano cancelado
      </span>
    );
  }

  if (plano === "inadimplente") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Pagamento falhou
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      Trial expirado
    </span>
  );
}

export default async function PlanoPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const tenant = await getTenantPlano();
  const params = await searchParams;
  const recemAssinou = params.plano === "ativo";

  const planoAtivo =
    tenant.plano === "pago" ||
    (tenant.plano === "trial" &&
      !!tenant.trialTerminaEm &&
      tenant.trialTerminaEm > new Date());

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-neutral-900">Meu plano</h1>

      {recemAssinou && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Assinatura ativada com sucesso! Bem-vindo ao FixouJá Pro.
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-500">Status atual</p>
          <StatusBadge plano={tenant.plano} trialTerminaEm={tenant.trialTerminaEm} />
        </div>

        <div className="mt-6 border-t border-neutral-100 pt-6">
          <p className="text-sm font-semibold text-neutral-700">FixouJá Pro</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-neutral-900">R$ 99,90</span>
            <span className="text-sm text-neutral-400">/mês</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Agendamentos ilimitados
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Lembretes automáticos via WhatsApp
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Múltiplos profissionais
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Suporte prioritário
            </li>
          </ul>
        </div>

        {!planoAtivo || tenant.plano !== "pago" ? (
          <div className="mt-6">
            <SubscribeButton />
          </div>
        ) : null}
      </div>
    </div>
  );
}
