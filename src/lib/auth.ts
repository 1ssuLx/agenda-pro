import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getTenant() {
  const user = await currentUser();

  if (!user) {
    throw Object.assign(new Error("Não autenticado"), { status: 401 });
  }

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    throw Object.assign(new Error("Usuário sem e-mail primário"), { status: 401 });
  }

  const profissional = await prisma.profissional.findFirst({
    where: { email },
    include: { tenant: true },
  });

  if (!profissional) {
    throw Object.assign(new Error("Profissional não encontrado"), { status: 401 });
  }

  return { profissional, tenant: profissional.tenant };
}
