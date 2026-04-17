import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createId } from "@paralleldrive/cuid2";
import { sendLembreteTask } from "@/trigger/send-lembrete";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ erro: message }, { status });
}

const INTERVALO_MINUTOS = 30;

export async function GET(request: NextRequest) {
  let tenantId: string;
  try {
    tenantId = await getTenantId();
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : "Não autenticado";
    return errorResponse(message, status);
  }

  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  const where: Record<string, unknown> = { tenantId };

  if (data) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(data);
    fim.setHours(23, 59, 59, 999);
    where.dataHora = { gte: inicio, lte: fim };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where,
    orderBy: { dataHora: "asc" },
    include: {
      cliente: { select: { id: true, nome: true, telefone: true } },
      profissional: { select: { id: true, nome: true, email: true } },
    },
  });

  return NextResponse.json(agendamentos);
}

export async function POST(request: NextRequest) {
  let tenantId: string;
  try {
    tenantId = await getTenantId();
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : "Não autenticado";
    return errorResponse(message, status);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Corpo da requisição inválido", 400);
  }

  const { clienteId, profissionalId, servico, dataHora } = body as {
    clienteId?: string;
    profissionalId?: string;
    servico?: string;
    dataHora?: string;
  };

  if (!clienteId || typeof clienteId !== "string") {
    return errorResponse("O campo 'clienteId' é obrigatório", 400);
  }
  if (!profissionalId || typeof profissionalId !== "string") {
    return errorResponse("O campo 'profissionalId' é obrigatório", 400);
  }
  if (!servico || typeof servico !== "string" || servico.trim() === "") {
    return errorResponse("O campo 'servico' é obrigatório", 400);
  }
  if (!dataHora) {
    return errorResponse("O campo 'dataHora' é obrigatório", 400);
  }

  const dataHoraDate = new Date(dataHora);
  if (isNaN(dataHoraDate.getTime())) {
    return errorResponse("O campo 'dataHora' não é uma data válida", 400);
  }
  if (dataHoraDate <= new Date()) {
    return errorResponse("O agendamento deve ser em uma data futura", 400);
  }

  const [cliente, profissional] = await Promise.all([
    prisma.cliente.findFirst({ where: { id: clienteId, tenantId } }),
    prisma.profissional.findFirst({ where: { id: profissionalId, tenantId } }),
  ]);

  if (!cliente) return errorResponse("Cliente não encontrado neste estabelecimento", 404);
  if (!profissional) return errorResponse("Profissional não encontrado neste estabelecimento", 404);

  const janela = INTERVALO_MINUTOS * 60 * 1000;
  const inicio = new Date(dataHoraDate.getTime() - janela);
  const fim = new Date(dataHoraDate.getTime() + janela);

  const conflito = await prisma.agendamento.findFirst({
    where: {
      tenantId,
      profissionalId,
      status: { notIn: ["cancelado"] },
      dataHora: { gte: inicio, lte: fim },
    },
  });

  if (conflito) {
    return errorResponse("Já existe um agendamento neste horário para este profissional", 409);
  }

  const agendamento = await prisma.agendamento.create({
    data: {
      tenantId,
      clienteId,
      profissionalId,
      servico: servico.trim(),
      dataHora: dataHoraDate,
      status: "agendado",
      tokenConfirm: createId(),
    },
    include: {
      cliente: { select: { id: true, nome: true, telefone: true } },
      profissional: { select: { id: true, nome: true, email: true } },
    },
  });

  const dataHoraLembrete = new Date(agendamento.dataHora.getTime() - 24 * 60 * 60 * 1000);

  if (dataHoraLembrete > new Date()) {
    await sendLembreteTask.trigger(
      { agendamentoId: agendamento.id },
      { delay: dataHoraLembrete }
    );
  }

  return NextResponse.json(agendamento, { status: 201 });
}