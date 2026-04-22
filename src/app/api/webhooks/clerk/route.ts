import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

type EmailAddress = { email_address: string; id: string };

type UserCreatedPayload = {
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: EmailAddress[];
    primary_email_address_id: string | null;
    phone_numbers: { phone_number: string }[];
  };
  type: string;
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { erro: "Configuração do servidor incompleta" },
      { status: 400 }
    );
  }

  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { erro: "Cabeçalhos da requisição ausentes" },
      { status: 400 }
    );
  }

  const body = await request.text();

  let event: UserCreatedPayload;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as UserCreatedPayload;
  } catch {
    return NextResponse.json(
      { erro: "Assinatura da requisição inválida" },
      { status: 400 }
    );
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ received: true });
  }

  try {
    const { id, first_name, last_name, email_addresses, primary_email_address_id, phone_numbers } =
      event.data;

    const fullName =
      [first_name, last_name].filter(Boolean).join(" ").trim() || "Sem nome";

    const primaryEmail = (
      email_addresses.find((e) => e.id === primary_email_address_id)
        ?.email_address ??
      email_addresses[0]?.email_address ??
      ""
    ).toLowerCase();

    const allowed = await prisma.whitelistEmail.findUnique({
      where: { email: primaryEmail },
    });

    if (!allowed) {
      console.warn(`[webhook/clerk] Email bloqueado (não está na whitelist): ${primaryEmail}`);
      return NextResponse.json({ blocked: true }, { status: 200 });
    }

    const telefone = phone_numbers?.[0]?.phone_number ?? "";

    const slugBase = toSlug(fullName);
    const slugSuffix = id.slice(-8);
    const slug = `${slugBase}-${slugSuffix}`;

    const tenant = await prisma.tenant.create({
      data: {
        nome: fullName,
        slug,
        telefone,
        mensagemLembrete:
          "Olá, {nome}! 👋\nLembrando do seu agendamento:\n🍽️ Serviço: {servico}\n👤 Profissional: {profissional}\n📅 Data: {data}\n✅ Confirme presença: {link}",
      },
    });

    await prisma.profissional.create({
      data: {
        tenantId: tenant.id,
        nome: fullName,
        email: primaryEmail,
        role: "dono",
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[webhook/clerk] Erro ao criar tenant/profissional:", err);
    return NextResponse.json(
      { erro: "Erro ao processar o evento recebido" },
      { status: 400 }
    );
  }
}
