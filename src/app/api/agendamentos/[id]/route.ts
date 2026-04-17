import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ erro: message }, { status });
}

const STATUS_VALIDOS = ["agendado", "confirmado", "concluido", "cancelado"];

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  let tenantId: string;
  try {
    tenantId = await getTenantId();
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

  const { status: novoStatus } = body as { status?: string };

  if (!novoStatus || typeof novoStatus !== "string") {
    return errorResponse("O campo 'status' é obrigatório", 400);
  }
  if (!STATUS_VALIDOS.includes(novoStatus)) {
    return errorResponse(
      `Status inválido. Valores permitidos: ${STATUS_VALIDOS.join(", ")}`,
      400
    );
  }

  const agendamento = await prisma.agendamento.findFirst({
    where: { id, tenantId },
  });

  if (!agendamento) {
    return errorResponse("Agendamento não encontrado", 404);
  }

  const atualizado = await prisma.agendamento.update({
    where: { id },
    data: { status: novoStatus },
    include: {
      cliente: { select: { id: true, nome: true, telefone: true } },
      profissional: { select: { id: true, nome: true, email: true } },
    },
  });

  return NextResponse.json(atualizado);
}
