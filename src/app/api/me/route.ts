import { NextResponse } from "next/server";
import { getTenant } from "@/lib/auth";

export async function GET() {
  try {
    const { profissional } = await getTenant();
    return NextResponse.json({
      id: profissional.id,
      nome: profissional.nome,
      tenantId: profissional.tenantId,
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : "Não autenticado";
    return NextResponse.json({ erro: message }, { status });
  }
}
