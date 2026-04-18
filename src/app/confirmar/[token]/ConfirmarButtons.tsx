"use client";

import { useState } from "react";
import { confirmarAgendamento, cancelarAgendamento } from "./actions";

type Estado =
  | "idle"
  | "loading-confirmar"
  | "loading-cancelar"
  | "erro";

interface Props {
  agendamentoId: string;
  token: string;
}

export default function ConfirmarButtons({ agendamentoId, token }: Props) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensagemErro, setMensagemErro] = useState("");

  async function handleConfirmar() {
    setEstado("loading-confirmar");
    const result = await confirmarAgendamento(agendamentoId, token);
    if (result.success) {
      window.location.reload();
    } else {
      setMensagemErro(result.error ?? "Erro ao confirmar.");
      setEstado("erro");
    }
  }

  async function handleCancelar() {
    const ok = window.confirm(
      "Tem certeza que deseja cancelar este agendamento?"
    );
    if (!ok) return;

    setEstado("loading-cancelar");
    const result = await cancelarAgendamento(agendamentoId, token);
    if (result.success) {
      window.location.reload();
    } else {
      setMensagemErro(result.error ?? "Erro ao cancelar.");
      setEstado("erro");
    }
  }

  const isLoading =
    estado === "loading-confirmar" || estado === "loading-cancelar";

  return (
    <div className="flex flex-col gap-3">
      {estado === "erro" && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {mensagemErro}
        </div>
      )}

      <button
        onClick={handleConfirmar}
        disabled={isLoading}
        className="w-full rounded-2xl bg-green-600 py-4 text-base font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {estado === "loading-confirmar"
          ? "Confirmando..."
          : "✅ Confirmar presença"}
      </button>

      <button
        onClick={handleCancelar}
        disabled={isLoading}
        className="w-full rounded-2xl border border-red-300 bg-white py-4 text-base font-semibold text-red-600 transition-colors hover:bg-red-50 active:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {estado === "loading-cancelar" ? "Cancelando..." : "Preciso cancelar"}
      </button>
    </div>
  );
}
