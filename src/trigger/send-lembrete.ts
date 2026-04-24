import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { formatDate, formatDateTime, formatTime } from "@/lib/date";

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

    if (agendamento.dataHora <= new Date()) {
      return { skipped: true, reason: "horário já passou" };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: agendamento.profissional.tenantId },
    });

    const link = `${process.env.NEXT_PUBLIC_APP_URL}/confirmar/${agendamento.tokenConfirm}`;
    let mensagem: string;

    if (tenant?.mensagemLembrete) {
      mensagem = tenant.mensagemLembrete
        .replace(/\{nome\}/g, agendamento.cliente.nome)
        .replace(/\{servico\}/g, agendamento.servico)
        .replace(/\{profissional\}/g, agendamento.profissional.nome)
        .replace(/\{data\}/g, formatDateTime(agendamento.dataHora))
        .replace(/\{link\}/g, link);
    } else {
      const data = formatDate(agendamento.dataHora);
      const hora = formatTime(agendamento.dataHora);
      mensagem = `Olá, ${agendamento.cliente.nome}! 👋\nLembrando do seu agendamento:\n📋 Serviço: ${agendamento.servico}\n👤 Profissional: ${agendamento.profissional.nome}\n📅 Data: ${data}\n⏰ Hora: ${hora}\n✅ Confirme presença: ${link}`;
    }

    await sendWhatsApp(agendamento.cliente.telefone, mensagem);

    await prisma.agendamento.update({
      where: { id: payload.agendamentoId },
      data: { lembreteEnviadoEm: new Date() },
    });

    return { sent: true };
  },
});
