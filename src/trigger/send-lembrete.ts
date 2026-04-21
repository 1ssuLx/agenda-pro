import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { formatDate, formatTime } from "@/lib/date";

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

    const data = formatDate(agendamento.dataHora);
    const hora = formatTime(agendamento.dataHora);
    const mensagem = `Olá, ${agendamento.cliente.nome}! 👋\nLembrando do seu agendamento:\n📋 Serviço: ${agendamento.servico}\n👤 Profissional: ${agendamento.profissional.nome}\n📅 Data: ${data}\n⏰ Hora: ${hora}\n✅ Confirme presença: ${process.env.NEXT_PUBLIC_APP_URL}/confirmar/${agendamento.tokenConfirm}`;

    await sendWhatsApp(agendamento.cliente.telefone, mensagem);

    await prisma.agendamento.update({
      where: { id: payload.agendamentoId },
      data: { lembreteEnviadoEm: new Date() },
    });

    return { sent: true };
  },
});
