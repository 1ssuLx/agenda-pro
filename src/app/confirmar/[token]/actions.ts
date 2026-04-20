"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function getAgendamentoByToken(token: string) {
  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { tokenConfirm: token },
      include: {
        cliente: { select: { nome: true, telefone: true } },
        profissional: { select: { nome: true, telefone: true } },
        tenant: { select: { nome: true } },
      },
    });

    if (!agendamento) {
      return { data: null, error: "Agendamento não encontrado." };
    }

    return { data: agendamento, error: null };
  } catch {
    return { data: null, error: "Erro ao buscar agendamento." };
  }
}

export async function confirmarAgendamento(id: string, token: string) {
  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: {
        cliente: { select: { nome: true } },
        profissional: { select: { nome: true } },
        tenant: { select: { nome: true, telefone: true } },
      },
    });

    if (!agendamento || agendamento.tokenConfirm !== token) {
      return { success: false, error: "Agendamento não encontrado." };
    }

    if (agendamento.status !== "agendado") {
      return { success: false, error: "Este agendamento não pode ser confirmado." };
    }

    await prisma.agendamento.update({
      where: { id },
      data: { status: "confirmado" },
    });

    const data = agendamento.dataHora.toLocaleDateString("pt-BR");
    const hora = agendamento.dataHora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (agendamento.tenant.telefone) {
      await sendWhatsApp(
        agendamento.tenant.telefone,
        `✅ Confirmação de agendamento\n\nO cliente ${agendamento.cliente.nome} confirmou o agendamento de ${agendamento.servico} para ${data} às ${hora}.`
      );
    } else {
      console.warn(`Estabelecimento ${agendamento.tenant.nome} sem telefone cadastrado — WhatsApp não enviado.`);
    }

    revalidatePath(`/confirmar/${token}`);
    return { success: true, error: null };
  } catch (error) {
    console.error("ERRO confirmarAgendamento:", error);
    return { success: false, error: "Erro ao confirmar agendamento." };
  }
}

export async function cancelarAgendamento(id: string, token: string) {
  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: {
        cliente: { select: { nome: true } },
        profissional: { select: { nome: true } },
        tenant: { select: { nome: true, telefone: true } },
      },
    });

    if (!agendamento || agendamento.tokenConfirm !== token) {
      return { success: false, error: "Agendamento não encontrado." };
    }

    if (agendamento.status !== "agendado") {
      return { success: false, error: "Este agendamento não pode ser cancelado." };
    }

    await prisma.agendamento.update({
      where: { id },
      data: { status: "cancelado" },
    });

    const data = agendamento.dataHora.toLocaleDateString("pt-BR");
    const hora = agendamento.dataHora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (agendamento.tenant.telefone) {
      await sendWhatsApp(
        agendamento.tenant.telefone,
        `❌ Cancelamento de agendamento\n\nO cliente ${agendamento.cliente.nome} cancelou o agendamento de ${agendamento.servico} para ${data} às ${hora}.`
      );
    } else {
      console.warn(`Estabelecimento ${agendamento.tenant.nome} sem telefone cadastrado — WhatsApp não enviado.`);
    }

    revalidatePath(`/confirmar/${token}`);
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erro ao cancelar agendamento." };
  }
}
