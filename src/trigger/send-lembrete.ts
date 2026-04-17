import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { buildLembreteMsg, sendWhatsApp } from "@/lib/whatsapp";

export const sendLembreteTask = task({
  id: "send-lembrete",
  run: async (payload: { agendamentoId: string }) => {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: payload.agendamentoId },
      include: { cliente: true, profissional: true },
    });

    if (!agendamento) {
      throw new Error(`Agendamento ${payload.agendamentoId} não encontrado`);
    }

    if (agendamento.status === "cancelado") {
      return { skipped: true, reason: "agendamento cancelado" };
    }

    const mensagem = buildLembreteMsg(
      agendamento.cliente.nome,
      agendamento.servico,
      agendamento.dataHora,
      agendamento.tokenConfirm
);

    await sendWhatsApp(agendamento.cliente.telefone, mensagem);

    await prisma.agendamento.update({
      where: { id: payload.agendamentoId },
      data: { lembreteEnviadoEm: new Date() },
    });

    return { sent: true };
  },
});
