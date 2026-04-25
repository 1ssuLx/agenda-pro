import { NextRequest, NextResponse } from "next/server";
import { getTenant } from "@/lib/auth";
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
    const { tenant } = await getTenant();
    tenantId = tenant.id;
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : "Não autenticado";
    return errorResponse(message, status);
  }

  const { searchParams } = new URL(request.url);
  const data   = searchParams.get("data");
  const inicio = searchParams.get("inicio");
  const fim    = searchParams.get("fim");

  const where: Record<string, unknown> = { tenantId };

  if (data) {
    const ini = new Date(data);
    ini.setHours(0, 0, 0, 0);
    const end = new Date(data);
    end.setHours(23, 59, 59, 999);
    where.dataHora = { gte: ini, lte: end };
  } else if (inicio && fim) {
    const ini = new Date(inicio);
    ini.setHours(0, 0, 0, 0);
    const end = new Date(fim);
    end.setHours(23, 59, 59, 999);
    where.dataHora = { gte: ini, lte: end };
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
    const { tenant } = await getTenant();
    tenantId = tenant.id;
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

  const { clienteId, profissionalId, servico, dataHora, duracaoMinutos } = body as {
    clienteId?: string;
    profissionalId?: string;
    servico?: string;
    dataHora?: string;
    duracaoMinutos?: number;
  };

  const duracao =
    typeof duracaoMinutos === "number" && duracaoMinutos > 0
      ? Math.round(duracaoMinutos)
      : 60;

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
      duracaoMinutos: duracao,
    },
    include: {
      cliente: { select: { id: true, nome: true, telefone: true } },
      profissional: { select: { id: true, nome: true, email: true } },
    },
  });

  const diffMs = agendamento.dataHora.getTime() - Date.now();
  const umDia = 24 * 60 * 60 * 1000;

  let triggerId: string | null = null;
  if (diffMs > umDia) {
    const dataHoraLembrete = new Date(agendamento.dataHora.getTime() - umDia);
    const handle = await sendLembreteTask.trigger(
      { agendamentoId: agendamento.id },
      { delay: dataHoraLembrete }
    );
    triggerId = handle.id;
  } else if (diffMs > 0) {
    const em2min = new Date(Date.now() + 2 * 60 * 1000);
    const handle = await sendLembreteTask.trigger(
      { agendamentoId: agendamento.id },
      { delay: em2min }
    );
    triggerId = handle.id;
  }

  if (triggerId) {
    await prisma.agendamento.update({
      where: { id: agendamento.id },
      data: { triggerId },
    });
  }

  return NextResponse.json(agendamento, { status: 201 });
}