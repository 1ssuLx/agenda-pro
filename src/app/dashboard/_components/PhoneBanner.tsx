"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PhoneBanner() {
  const [telefone, setTelefone] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/tenant")
      .then((r) => r.json())
      .then((d) => setTelefone(d.telefone || null))
      .catch(() => setTelefone(null));
  }, []);

  // undefined = carregando, null = sem telefone, string = tem telefone
  if (telefone === undefined || telefone) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <span>
          ⚠️ Cadastre seu telefone para receber notificações automáticas pelo WhatsApp.
        </span>
        <Link
          href="/dashboard/configuracoes"
          className="shrink-0 rounded-md bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-200"
        >
          Cadastrar agora
        </Link>
      </div>
    </div>
  );
}
