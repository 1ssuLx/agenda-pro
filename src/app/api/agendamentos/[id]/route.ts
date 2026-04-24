import { NextRequest, NextResponse } from "next/server";
import { getTenant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendLembreteTask } from "@/trigger/send-lembrete";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ erro: message }, { status });
}

const STATUS_VALIDOS = ["agendado", "confirmado", "concluido", "cancelado", "nao_compareceu"];

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  let tenantId: string;
  try {
    const { tenant } = await getTenant();
    tenantId = tenant.id;
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : "Não autenticado";
    return errorResponse(message, status);
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Corpo da requisição inválido", 400);
  }

  const { status: novoStatus, dataHora } = body as { status?: string; dataHora?: string };

  if (!novoStatus && !dataHora) {
    return errorResponse("Informe 'status' ou 'dataHora' para atualizar", 400);
  }
  if (novoStatus && !STATUS_VALIDOS.includes(novoStatus)) {
    return errorResponse(
      `Status inválido. Valores permitidos: ${STATUS_VALIDOS.join(", ")}`,
      400
    );
  }
  if (dataHora) {
    const d = new Date(dataHora);
    if (isNaN(d.getTime())) return errorResponse("'dataHora' não é uma data válida", 400);
  }

  const agendamento = await prisma.agendamento.findFirst({
    where: { id, tenantId },
  });

  if (!agendamento) {
    return errorResponse("Agendamento não encontrado", 404);
  }

  const atualizado = await prisma.agendamento.update({
    where: { id },
    data: {
      ...(novoStatus ? { status: novoStatus } : {}),
      ...(dataHora ? { dataHora: new Date(dataHora) } : {}),
    },
    include: {
      cliente: { select: { id: true, nome: true, telefone: true } },
      profissional: { select: { id: true, nome: true, email: true } },
    },
  });

  if (dataHora) {
    const novaDataHora = new Date(dataHora);
    const diffMs = novaDataHora.getTime() - Date.now();
    const umDia = 24 * 60 * 60 * 1000;

    let triggerId: string | null = null;
    if (diffMs > umDia) {
      const dataHoraLembrete = new Date(novaDataHora.getTime() - umDia);
      const handle = await sendLembreteTask.trigger(
        { agendamentoId: id },
        { delay: dataHoraLembrete }
      );
      triggerId = handle.id;
    } else if (diffMs > 0) {
      const em2min = new Date(Date.now() + 2 * 60 * 1000);
      const handle = await sendLembreteTask.trigger(
        { agendamentoId: id },
        { delay: em2min }
      );
      triggerId = handle.id;
    }

    if (triggerId) {
      await prisma.agendamento.update({
        where: { id },
        data: { triggerId },
      });
    }
  }

  return NextResponse.json(atualizado);
}
