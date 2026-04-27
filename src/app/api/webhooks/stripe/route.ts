import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ erro: "Assinatura ausente" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ erro: "Configuração incompleta" }, { status: 500 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ erro: "Assinatura inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        await atualizarPlano(customerId, { plano: "pago", stripeSubscriptionId: subscriptionId });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        await atualizarPlano(customerId, { plano: "cancelado" });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        await atualizarPlano(customerId, { plano: "inadimplente" });
        break;
      }
    }
  } catch (err) {
    console.error("[webhook/stripe] Erro ao processar evento:", event.type, err);
    return NextResponse.json({ erro: "Erro ao processar evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function atualizarPlano(
  stripeCustomerId: string,
  dados: { plano: string; stripeSubscriptionId?: string }
) {
  const tenant = await prisma.tenant.findFirst({
    where: { stripeCustomerId },
    include: { profissionais: { where: { role: "dono" }, select: { email: true } } },
  });

  if (!tenant) {
    console.warn(`[webhook/stripe] Tenant não encontrado para customerId: ${stripeCustomerId}`);
    return;
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: dados,
  });

  const donoemail = tenant.profissionais[0]?.email;
  if (donoemail) {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({ emailAddress: [donoemail] });
    if (users[0]) {
      await client.users.updateUserMetadata(users[0].id, {
        publicMetadata: { plano: dados.plano },
      });
    }
  }
}
