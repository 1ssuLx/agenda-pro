import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";

export const lembreteTrial7 = task({
  id: "lembrete-trial-dia-7",
  run: async (payload: { tenantId: string }) => {
    const tenant = await prisma.tenant.findUnique({
      where: { id: payload.tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${payload.tenantId} não encontrado`);
    }

    if (!tenant.telefone) {
      return { skipped: true, reason: "tenant sem telefone" };
    }

    if (tenant.plano === "pago") {
      return { skipped: true, reason: "tenant já assinou" };
    }

    const mensagem =
      `Oi ${tenant.nome}! 👋 Tô passando pra saber como tá sendo a experiência com o FixouJá essa primeira semana. Teve alguma dúvida? Algo que poderia ser melhor?`;

    await sendWhatsApp(tenant.telefone, mensagem);

    return { sent: true, tenantId: tenant.id };
  },
});

export const lembreteTrial23 = task({
  id: "lembrete-trial-dia-23",
  run: async (payload: { tenantId: string }) => {
    const tenant = await prisma.tenant.findUnique({
      where: { id: payload.tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${payload.tenantId} não encontrado`);
    }

    if (!tenant.telefone) {
      return { skipped: true, reason: "tenant sem telefone" };
    }

    if (tenant.plano === "pago") {
      return { skipped: true, reason: "tenant já assinou" };
    }

    const mensagem =
      `Oi ${tenant.nome}! 😊 Faltam 7 dias do seu período gratuito no FixouJá.\n` +
      `Que tal garantir o acesso antes que acabe? É só R$99,90/mês e você cancela quando quiser 👉 fixouja.vercel.app/dashboard/plano`;

    await sendWhatsApp(tenant.telefone, mensagem);

    return { sent: true, tenantId: tenant.id };
  },
});

export const lembreteTrial29 = task({
  id: "lembrete-trial-dia-29",
  run: async (payload: { tenantId: string }) => {
    const tenant = await prisma.tenant.findUnique({
      where: { id: payload.tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${payload.tenantId} não encontrado`);
    }

    if (!tenant.telefone) {
      return { skipped: true, reason: "tenant sem telefone" };
    }

    if (tenant.plano === "pago") {
      return { skipped: true, reason: "tenant já assinou" };
    }

    const mensagem =
      `Oi ${tenant.nome}! ⚠️ Seu acesso gratuito ao FixouJá expira amanhã.\n` +
      `Para continuar sem interrupção, assine agora:\n` +
      `fixouja.vercel.app/dashboard/plano\n` +
      `Qualquer dúvida é só responder aqui 😊`;

    await sendWhatsApp(tenant.telefone, mensagem);

    return { sent: true, tenantId: tenant.id };
  },
});
