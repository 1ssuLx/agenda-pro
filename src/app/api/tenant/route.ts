import { NextRequest, NextResponse } from "next/server";
import { getTenant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ erro: message }, { status });
}

function handleAuthError(err: unknown) {
  const status = (err as { status?: number }).status ?? 401;
  const message = err instanceof Error ? err.message : "Não autenticado";
  return errorResponse(message, status);
}

export async function GET() {
  try {
    const { tenant } = await getTenant();
    return NextResponse.json({
      ...tenant,
      servicos: tenant.servicos ? JSON.parse(tenant.servicos) : [],
    });
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function PATCH(request: NextRequest) {
  let tenantId: string;
  try {
    const { tenant } = await getTenant();
    tenantId = tenant.id;
  } catch (err) {
    return handleAuthError(err);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Corpo da requisição inválido", 400);
  }

  const { nome, telefone, servicos, mensagemLembrete, onboardingCompleted } = body as {
    nome?: string;
    telefone?: string;
    servicos?: unknown;
    mensagemLembrete?: string;
    onboardingCompleted?: boolean;
  };

  if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
    return errorResponse("O campo 'nome' não pode ser vazio", 400);
  }
  if (telefone !== undefined && typeof telefone !== "string") {
    return errorResponse("O campo 'telefone' deve ser uma string", 400);
  }
  if (servicos !== undefined && !Array.isArray(servicos)) {
    return errorResponse("O campo 'servicos' deve ser um array", 400);
  }
  if (mensagemLembrete !== undefined && typeof mensagemLembrete !== "string") {
    return errorResponse("O campo 'mensagemLembrete' deve ser uma string", 400);
  }
  if (onboardingCompleted !== undefined && typeof onboardingCompleted !== "boolean") {
    return errorResponse("O campo 'onboardingCompleted' deve ser boolean", 400);
  }

  const data: Record<string, string | boolean> = {};
  if (nome !== undefined)                data.nome = nome.trim();
  if (telefone !== undefined)            data.telefone = telefone.trim();
  if (servicos !== undefined)            data.servicos = JSON.stringify(servicos);
  if (mensagemLembrete !== undefined)    data.mensagemLembrete = mensagemLembrete;
  if (onboardingCompleted !== undefined) data.onboardingCompleted = onboardingCompleted;

  if (Object.keys(data).length === 0) {
    return errorResponse("Nenhum campo para atualizar", 400);
  }

  const tenant = await prisma.tenant.update({ where: { id: tenantId }, data });

  return NextResponse.json({
    ...tenant,
    servicos: tenant.servicos ? JSON.parse(tenant.servicos) : [],
  });
}
