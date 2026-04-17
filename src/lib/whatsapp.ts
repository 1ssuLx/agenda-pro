const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!;

export async function sendWhatsApp(telefone: string, mensagem: string) {
  const numeroFormatado = telefone.replace(/\D/g, "").replace(/^0/, "55");

  const response = await fetch(
    `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: numeroFormatado,
        textMessage: { text: mensagem},
      }),
    }
  );

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao enviar WhatsApp: ${erro}`);
  }

  return response.json();
}

export function buildLembreteMsg(
  nome: string,
  servico: string,
  dataHora: Date,
  token: string
): string {
  const data = dataHora.toLocaleDateString("pt-BR");
  const hora = dataHora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `Olá, ${nome}! 👋

Lembrando do seu agendamento:
📋 Serviço: ${servico}
📅 Data: ${data}
⏰ Hora: ${hora}

Confirme sua presença:
✅ ${process.env.NEXT_PUBLIC_APP_URL}/confirmar/${token}

Até lá!`;
}