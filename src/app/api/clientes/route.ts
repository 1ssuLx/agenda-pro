import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ erro: message }, { status });
}

export async function GET(request: NextRequest) {
  let tenantId: string;
  try {
    tenantId = await getTenantId();
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : "Não autenticado";
    return errorResponse(message, status);
  }

  const { searchParams } = request.nextUrl;
  const telefone = searchParams.get("telefone");

  const clientes = await prisma.cliente.findMany({
    where: {
      tenantId,
      ...(telefone ? { telefone: { contains: telefone } } : {}),
    },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      telefone: true,
      servicoPadrao: true,
      tenantId: true,
      _count: { select: { agendamentos: true } },
    },
  });

  return NextResponse.json(clientes);
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

  const { nome, telefone, servicoPadrao } = body as {
    nome?: string;
    telefone?: string;
    servicoPadrao?: string;
  };

  if (!nome || typeof nome !== "string" || nome.trim() === "") {
    return errorResponse("O campo 'nome' é obrigatório", 400);
  }
  if (!telefone || typeof telefone !== "string" || telefone.trim() === "") {
    return errorResponse("O campo 'telefone' é obrigatório", 400);
  }

  const existente = await prisma.cliente.findFirst({
    where: { tenantId, telefone: telefone.trim() },
  });

  if (existente) {
    return errorResponse(
      "Já existe um cliente com esse telefone neste estabelecimento",
      409
    );
  }

  const cliente = await prisma.cliente.create({
    data: {
      tenantId,
      nome: nome.trim(),
      telefone: telefone.trim(),
      ...(servicoPadrao ? { servicoPadrao: servicoPadrao.trim() } : {}),
    },
  });

  return NextResponse.json(cliente, { status: 201 });
}
