import { NextRequest, NextResponse } from "next/server";
import { getTenant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function authError(err: unknown) {
  const status = (err as { status?: number }).status ?? 401;
  const message = err instanceof Error ? err.message : "Não autenticado";
  return NextResponse.json({ erro: message }, { status });
}

export async function GET() {
  try {
    const { tenant } = await getTenant();
    const profissionais = await prisma.profissional.findMany({
      where: { tenantId: tenant.id },
      select: { id: true, nome: true, email: true, telefone: true },
    });
    return NextResponse.json(profissionais);
  } catch (err) {
    return authError(err);
  }
}

export async function POST(request: NextRequest) {
  let tenantId: string;
  try {
    const { tenant } = await getTenant();
    tenantId = tenant.id;
  } catch (err) {
    return authError(err);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido" }, { status: 400 });
  }

  const { nome, telefone } = body as { nome?: string; telefone?: string | null };

  if (!nome || typeof nome !== "string" || nome.trim() === "") {
    return NextResponse.json({ erro: "O campo 'nome' é obrigatório" }, { status: 400 });
  }

  const profissional = await prisma.profissional.create({
    data: {
      tenantId,
      nome: nome.trim(),
      email: `pendente-${Date.now()}@placeholder.local`,
      telefone: telefone?.trim() || null,
    },
  });

  return NextResponse.json(profissional, { status: 201 });
}
