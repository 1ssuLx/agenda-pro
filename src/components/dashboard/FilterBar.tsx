"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PERIODOS = [
  { value: "hoje", label: "Hoje" },
  { value: "amanha", label: "Amanhã" },
  { value: "semana", label: "Essa semana" },
];

const STATUS_OPCOES = [
  { value: "todos", label: "Todos os status" },
  { value: "agendado", label: "Agendado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "concluido", label: "Concluído" },
  { value: "nao_compareceu", label: "Não compareceu" },
];

interface Props {
  periodo: string;
  status: string;
  busca: string;
}

export default function FilterBar({ periodo, status, busca }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [buscaLocal, setBuscaLocal] = useState(busca);

  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    router.push(`/dashboard/agendamentos?${params.toString()}`);
  }

  const isCustomDate = periodo && !PERIODOS.some((p) => p.value === periodo);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Período buttons */}
      <div className="flex gap-1">
        {PERIODOS.map((p) => (
          <button
            key={p.value}
            onClick={() => navigate({ periodo: p.value })}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              periodo === p.value
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            {p.label}
          </button>
        ))}
        <input
          type="date"
          value={isCustomDate ? periodo : ""}
          onChange={(e) => e.target.value && navigate({ periodo: e.target.value })}
          className={cn(
            "rounded-lg border px-2 py-1.5 text-sm transition-colors outline-none focus:border-neutral-400",
            isCustomDate
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-neutral-100 text-neutral-600"
          )}
        />
      </div>

      {/* Status select */}
      <Select value={status} onValueChange={(val) => navigate({ status: val })}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPCOES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Busca por nome */}
      <input
        type="text"
        value={buscaLocal}
        placeholder="Buscar por nome…"
        onChange={(e) => {
          setBuscaLocal(e.target.value);
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            navigate({ busca: e.target.value });
          }, 300);
        }}
        className="h-9 rounded-4xl border border-neutral-200 bg-neutral-100 px-3 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 transition-colors"
      />
    </div>
  );
}
