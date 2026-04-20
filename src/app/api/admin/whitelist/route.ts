import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAdminSecret(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.headers.get("x-admin-secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const emails = await prisma.whitelistEmail.findMany({
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(emails);
}

export async function POST(request: NextRequest) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido" }, { status: 400 });
  }

  const { email } = body as { email?: string };

  if (!email || typeof email !== "string" || email.trim() === "") {
    return NextResponse.json({ erro: "O campo 'email' é obrigatório" }, { status: 400 });
  }

  const normalizado = email.trim().toLowerCase();

  const registro = await prisma.whitelistEmail.upsert({
    where: { email: normalizado },
    update: {},
    create: { email: normalizado },
  });

  return NextResponse.json(registro, { status: 201 });
}
