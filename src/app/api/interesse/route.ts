import { NextRequest, NextResponse } from "next/server";

const DESTINO = "5531998325517";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { erro: "Não conseguimos ler os dados enviados. Tente novamente." },
      { status: 400 }
    );
  }

  const { nome, whatsapp } = body as { nome?: string; whatsapp?: string };

  const nomeLimpo = typeof nome === "string" ? nome.trim() : "";
  const whatsappLimpo = typeof whatsapp === "string" ? whatsapp.replace(/\D/g, "") : "";

  if (!nomeLimpo) {
    return NextResponse.json(
      { erro: "Por favor, informe o seu nome completo." },
      { status: 400 }
    );
  }

  if (!whatsappLimpo || whatsappLimpo.length < 10) {
    return NextResponse.json(
      { erro: "Informe um WhatsApp válido com DDD." },
      { status: 400 }
    );
  }

  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
  const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    return NextResponse.json(
      { erro: "Não foi possível processar seu cadastro agora. Tente novamente em instantes." },
      { status: 500 }
    );
  }

  const mensagem =
    `🎉 Novo interessado no FixouJá!\n\n` +
    `👤 Nome: ${nomeLimpo}\n` +
    `📱 WhatsApp: ${whatsappLimpo}\n\n` +
    `Responda para adicionar na whitelist e enviar o link de cadastro.`;

  try {
    const resp = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: DESTINO,
          textMessage: { text: mensagem },
        }),
      }
    );

    if (!resp.ok) {
      const detalhe = await resp.text().catch(() => "");
      console.error("[/api/interesse] Evolution respondeu com erro:", resp.status, detalhe);
      return NextResponse.json(
        { erro: "Não conseguimos enviar sua solicitação agora. Tente novamente em instantes." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[/api/interesse] Falha ao contatar Evolution:", err);
    return NextResponse.json(
      { erro: "Não conseguimos enviar sua solicitação agora. Verifique sua conexão e tente de novo." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
