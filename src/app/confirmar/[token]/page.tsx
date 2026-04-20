import { headers } from "next/headers";
import { getAgendamentoByToken } from "./actions";
import ConfirmarButtons from "./ConfirmarButtons";
import { checkRateLimit } from "@/lib/rate-limit";

interface Props {
  params: Promise<{ token: string }>;
}

const STATUS_LABELS: Record<string, { titulo: string; descricao: string; cor: string; icone: string }> = {
  confirmado: {
    titulo: "Presença já confirmada",
    descricao: "Você já confirmou presença neste agendamento. Te esperamos!",
    cor: "bg-green-50 border-green-200 text-green-800",
    icone: "✅",
  },
  cancelado: {
    titulo: "Agendamento cancelado",
    descricao: "Este agendamento já foi cancelado.",
    cor: "bg-red-50 border-red-200 text-red-800",
    icone: "❌",
  },
  concluido: {
    titulo: "Atendimento concluído",
    descricao: "Este agendamento já foi realizado.",
    cor: "bg-zinc-50 border-zinc-200 text-zinc-700",
    icone: "🏁",
  },
};

function PaginaErro({ titulo, mensagem }: { titulo: string; mensagem: string }) {
  return (
    <Layout>
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-lg font-semibold text-yellow-800">{titulo}</p>
        <p className="mt-2 text-sm text-yellow-700">{mensagem}</p>
      </div>
    </Layout>
  );
}

export default async function ConfirmarPage({ params }: Props) {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return (
      <PaginaErro
        titulo="Muitas tentativas"
        mensagem="Aguarde um momento antes de tentar novamente."
      />
    );
  }

  const { token } = await params;
  const { data: agendamento } = await getAgendamentoByToken(token);

  if (!agendamento) {
    return (
      <PaginaErro
        titulo="Link não encontrado"
        mensagem="Não encontramos nenhum agendamento para este link. Verifique se o link está correto ou entre em contato com o estabelecimento."
      />
    );
  }

  const statusInfo = STATUS_LABELS[agendamento.status];
  if (statusInfo) {
    return (
      <Layout>
        <div className={`rounded-2xl border p-6 text-center ${statusInfo.cor}`}>
          <p className="text-4xl mb-3">{statusInfo.icone}</p>
          <p className="text-lg font-semibold">{statusInfo.titulo}</p>
          <p className="mt-2 text-sm">{statusInfo.descricao}</p>
        </div>
      </Layout>
    );
  }

  const primeiroNome = agendamento.cliente.nome.split(" ")[0];

  const dataHora = new Date(agendamento.dataHora);
  const dataFormatada = dataHora.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const horaFormatada = dataHora.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Layout>
      <div className="mb-2 text-center">
        <p className="text-sm font-medium text-zinc-500">
          {agendamento.tenant.nome}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900">
          Confirme seu agendamento
        </h1>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 divide-y divide-zinc-200">
        <Row label="Cliente" value={primeiroNome} />
        <Row label="Serviço" value={agendamento.servico} />
        <Row
          label="Data"
          value={<span className="capitalize">{dataFormatada}</span>}
        />
        <Row label="Horário" value={horaFormatada} />
      </div>

      <ConfirmarButtons agendamentoId={agendamento.id} token={token} />
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-100 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-sm text-zinc-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-zinc-900 text-right">{value}</span>
    </div>
  );
}
