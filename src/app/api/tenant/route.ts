import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ erro: message }, { status });
}

async function resolveTenantId() {
  try {
    return { tenantId: await getTenantId(), error: null };
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : "Não autenticado";
    return { tenantId: null, error: errorResponse(message, status) };
  }
}

export async function GET() {
  const { tenantId, error } = await resolveTenantId();
  if (error) return error;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId! } });
  if (!tenant) return errorResponse("Tenant não encontrado", 404);

  return NextResponse.json({
    ...tenant,
    servicos: tenant.servicos ? JSON.parse(tenant.servicos) : [],
  });
}

export async function PATCH(request: NextRequest) {
  const { tenantId, error } = await resolveTenantId();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Corpo da requisição inválido", 400);
  }

  const { nome, telefone, servicos, mensagemLembrete } = body as {
    nome?: string;
    telefone?: string;
    servicos?: unknown;
    mensagemLembrete?: string;
  };

  if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
    return errorResponse("O campo 'nome' não pode ser vazio", 400);
  }
  if (telefone !== undefined && (typeof telefone !== "string" || telefone.trim() === "")) {
    return errorResponse("O campo 'telefone' não pode ser vazio", 400);
  }
  if (servicos !== undefined && !Array.isArray(servicos)) {
    return errorResponse("O campo 'servicos' deve ser um array", 400);
  }
  if (mensagemLembrete !== undefined && typeof mensagemLembrete !== "string") {
    return errorResponse("O campo 'mensagemLembrete' deve ser uma string", 400);
  }

  const data: Record<string, string> = {};
  if (nome !== undefined)             data.nome = nome.trim();
  if (telefone !== undefined)         data.telefone = telefone.trim();
  if (servicos !== undefined)         data.servicos = JSON.stringify(servicos);
  if (mensagemLembrete !== undefined) data.mensagemLembrete = mensagemLembrete;

  if (Object.keys(data).length === 0) {
    return errorResponse("Nenhum campo para atualizar", 400);
  }

  const tenant = await prisma.tenant.update({ where: { id: tenantId! }, data });

  return NextResponse.json({
    ...tenant,
    servicos: tenant.servicos ? JSON.parse(tenant.servicos) : [],
  });
}
