import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ erro: message }, { status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let tenantId: string;
  try {
    tenantId = await getTenantId();
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : "Não autenticado";
    return errorResponse(message, status);
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Corpo da requisição inválido", 400);
  }

  const { nome, telefone, servicoPadrao } = body as {
    nome?: string;
    telefone?: string;
    servicoPadrao?: string | null;
  };

  const existente = await prisma.cliente.findFirst({
    where: { id, tenantId },
  });

  if (!existente) {
    return errorResponse("Cliente não encontrado", 404);
  }

  if (telefone && telefone.trim() !== existente.telefone) {
    const conflito = await prisma.cliente.findFirst({
      where: { tenantId, telefone: telefone.trim(), NOT: { id } },
    });
    if (conflito) {
      return errorResponse(
        "Já existe um cliente com esse telefone neste estabelecimento",
        409
      );
    }
  }

  const data: Record<string, string | null> = {};
  if (nome !== undefined) data.nome = nome.trim();
  if (telefone !== undefined) data.telefone = telefone.trim();
  if (servicoPadrao !== undefined)
    data.servicoPadrao = servicoPadrao ? servicoPadrao.trim() : null;

  if (Object.keys(data).length === 0) {
    return errorResponse("Nenhum campo para atualizar", 400);
  }

  const cliente = await prisma.cliente.update({
    where: { id },
    data,
  });

  return NextResponse.json(cliente);
}
