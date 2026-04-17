import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Retorna o tenantId do usuário autenticado.
 * Lança erro 401 se não autenticado ou 404 se o Profissional não existir no banco.
 */
export async function getTenantId(): Promise<string> {
  const user = await currentUser();

  if (!user) {
    const err = new Error("Não autenticado");
    (err as NodeJS.ErrnoException).code = "401";
    throw Object.assign(err, { status: 401 });
  }

  const email = user.primaryEmailAddress?.emailAddress;

  if (!email) {
    const err = new Error("Usuário sem e-mail primário");
    throw Object.assign(err, { status: 401 });
  }

  const profissional = await prisma.profissional.findFirst({
    where: { email },
    select: { tenantId: true },
  });

  if (!profissional) {
    const err = new Error("Profissional não encontrado");
    throw Object.assign(err, { status: 404 });
  }

  return profissional.tenantId;
}
