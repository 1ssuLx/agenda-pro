import { NextResponse } from "next/server";
import { getTenant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { tenant } = await getTenant();
    const profissionais = await prisma.profissional.findMany({
      where: { tenantId: tenant.id },
      select: { id: true, nome: true, email: true },
    });
    return NextResponse.json(profissionais);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : "Não autenticado";
    return NextResponse.json({ erro: message }, { status });
  }
}
