import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ erro: "Usuário sem e-mail primário" }, { status: 401 });
  }

  const profissional = await prisma.profissional.findFirst({
    where: { email },
    select: { id: true, nome: true, tenantId: true },
  });

  if (!profissional) {
    return NextResponse.json({ erro: "Profissional não encontrado" }, { status: 404 });
  }

  return NextResponse.json(profissional);
}
