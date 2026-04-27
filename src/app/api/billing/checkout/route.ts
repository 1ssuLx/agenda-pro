import { NextResponse } from "next/server";
import { getTenant } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { tenant } = await getTenant();

    let stripeCustomerId = tenant.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: tenant.nome,
        metadata: { tenantId: tenant.id },
      });
      stripeCustomerId = customer.id;
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?plano=ativo`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plano`,
      subscription_data: {
        metadata: { tenantId: tenant.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500;
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ erro: message }, { status });
  }
}
