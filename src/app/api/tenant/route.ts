import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
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
  // --- DEBUG ---
  const clerkUser = await currentUser();
  console.log("[PATCH /api/tenant] clerkUser.id:", clerkUser?.id ?? "null");
  console.log("[PATCH /api/tenant] clerkUser.email:", clerkUser?.primaryEmailAddress?.emailAddress ?? "null");

  if (clerkUser) {
    const profissional = await prisma.profissional.findFirst({
      where: { email: clerkUser.primaryEmailAddress?.emailAddress ?? "" },
      select: { id: true, tenantId: true, email: true },
    });
    console.log("[PATCH /api/tenant] profissional encontrado:", profissional);
  }
  // --- FIM DEBUG ---

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

  let tenant;
  try {
    tenant = await prisma.tenant.update({ where: { id: tenantId! }, data });
  } catch (err) {
    console.error("[PATCH /api/tenant] Erro no prisma.update:", err);
    return errorResponse("Erro ao atualizar as configurações", 500);
  }

  return NextResponse.json({
    ...tenant,
    servicos: tenant.servicos ? JSON.parse(tenant.servicos) : [],
  });
}
