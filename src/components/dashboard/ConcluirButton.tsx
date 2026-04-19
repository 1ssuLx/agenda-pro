"use client";

import { useState } from "react";

export default function ConcluirButton({ agendamentoId }: { agendamentoId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleConcluir() {
    setLoading(true);
    await fetch(`/api/agendamentos/${agendamentoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "concluido" }),
    });
    window.location.reload();
  }

  return (
    <button
      onClick={handleConcluir}
      disabled={loading}
      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Salvando…" : "Concluído"}
    </button>
  );
}
