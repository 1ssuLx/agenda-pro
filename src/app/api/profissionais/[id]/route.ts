import { NextRequest, NextResponse } from "next/server";
import { getTenant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let tenantId: string;
  try {
    const { tenant } = await getTenant();
    tenantId = tenant.id;
  } catch (err) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : "Não autenticado";
    return NextResponse.json({ erro: message }, { status });
  }

  const { id } = await params;

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

  const profissional = await prisma.profissional.findFirst({
    where: { id, tenantId },
  });

  if (!profissional) {
    return NextResponse.json({ erro: "Profissional não encontrado" }, { status: 404 });
  }

  const data: { nome: string; telefone?: string | null } = { nome: nome.trim() };
  if (telefone !== undefined) data.telefone = telefone ? telefone.trim() : null;

  const updated = await prisma.profissional.update({ where: { id }, data });

  return NextResponse.json(updated);
}
