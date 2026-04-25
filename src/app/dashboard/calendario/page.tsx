"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── Fuso horário ────────────────────────────────────────────────────────────
const TZ = "America/Sao_Paulo";

// ─── Slots de 07:00 a 22:00 em intervalos de 30 min ─────────────────────────
type Slot = { hour: number; minute: number; label: string };

const SLOTS: Slot[] = (() => {
  const result: Slot[] = [];
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 22 && m > 0) break;
      result.push({
        hour: h,
        minute: m,
        label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      });
    }
  }
  return result;
})();

// ─── Helpers de formatação ───────────────────────────────────────────────────
function toLocalISODate(date: Date): string {
  // Retorna YYYY-MM-DD no fuso de SP
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatHeaderDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    weekday: "long",
  }).format(date);
  const dayMonth = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
  }).format(date);
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayMonth}`;
}

function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function fmtWeekday(iso: string): string {
  const wd = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    weekday: "long",
  }).format(new Date(iso));
  return wd.charAt(0).toUpperCase() + wd.slice(1);
}

function getLocalHourMinute(iso: string): { hour: number; minute: number } {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(d);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return { hour, minute };
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  agendado:       { label: "Agendado",        className: "bg-neutral-100 text-neutral-600" },
  confirmado:     { label: "Confirmado",      className: "bg-green-100 text-green-700" },
  cancelado:      { label: "Cancelado",       className: "bg-red-100 text-red-700" },
  concluido:      { label: "Concluído",       className: "bg-blue-100 text-blue-700" },
  nao_compareceu: { label: "Não compareceu", className: "bg-orange-100 text-orange-700" },
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface AgendamentoAPI {
  id: string;
  dataHora: string;
  status: string;
  servico: string;
  cliente: { nome: string; telefone: string };
  profissional: { nome: string };
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CalendarioPage() {
  const [date, setDate] = useState<Date>(() => new Date());
  const [agendamentos, setAgendamentos] = useState<AgendamentoAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AgendamentoAPI | null>(null);

  const dateStr = toLocalISODate(date);

  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agendamentos?data=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setAgendamentos(Array.isArray(data) ? data : []);
      } else {
        setAgendamentos([]);
      }
    } catch {
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  function prevDay() {
    setDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() - 1);
      return nd;
    });
  }

  function nextDay() {
    setDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 1);
      return nd;
    });
  }

  function goToday() {
    setDate(new Date());
  }

  function getAgendamentosForSlot(slot: Slot): AgendamentoAPI[] {
    const slotMinutes = slot.hour * 60 + slot.minute;
    return agendamentos.filter((ag) => {
      const { hour, minute } = getLocalHourMinute(ag.dataHora);
      const agMinutes = hour * 60 + minute;
      return Math.abs(agMinutes - slotMinutes) <= 15;
    });
  }

  const badge = selected
    ? (STATUS_BADGE[selected.status] ?? {
        label: selected.status,
        className: "bg-neutral-100 text-neutral-600",
      })
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Navegação de dias */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevDay}
            aria-label="Dia anterior"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
          >
            ←
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={nextDay}
            aria-label="Próximo dia"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
          >
            →
          </button>
        </div>

        {/* Título do dia */}
        <h1 className="flex-1 text-center text-base font-semibold text-neutral-900 sm:text-lg">
          {formatHeaderDate(date)}
        </h1>

        {/* Botão novo agendamento */}
        <Button asChild size="sm">
          <Link href="/dashboard/agendamentos/novo">+ Novo agendamento</Link>
        </Button>
      </div>

      {/* ── Timeline ── */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        {loading && (
          <div className="px-4 py-3 text-sm text-neutral-400">Carregando…</div>
        )}

        {SLOTS.map((slot, idx) => {
          const ags = getAgendamentosForSlot(slot);
          const isLast = idx === SLOTS.length - 1;

          return (
            <div
              key={slot.label}
              className={`flex min-h-[48px] gap-3 px-4 py-2 ${
                !isLast ? "border-b border-neutral-100" : ""
              } ${ags.length === 0 ? "" : "bg-neutral-50/50"}`}
            >
              {/* Horário */}
              <span className="w-12 shrink-0 pt-0.5 text-xs tabular-nums text-neutral-400">
                {slot.label}
              </span>

              {/* Cards de agendamento */}
              <div className="flex flex-1 flex-col gap-1.5">
                {ags.map((ag) => (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => setSelected(ag)}
                    className="w-full rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-left transition-colors hover:bg-green-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                  >
                    <p className="text-sm font-medium text-green-900">
                      {ag.cliente.nome}
                    </p>
                    <p className="text-xs text-green-700">
                      {ag.servico} · {ag.profissional.nome}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dialog de detalhes ── */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        {selected && badge && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do agendamento</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-xs font-medium text-neutral-500">Data</p>
                <p className="mt-0.5 text-neutral-900">{fmtDate(selected.dataHora)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Dia da semana</p>
                <p className="mt-0.5 text-neutral-900">{fmtWeekday(selected.dataHora)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Horário</p>
                <p className="mt-0.5 text-neutral-900">{fmtTime(selected.dataHora)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Status</p>
                <span
                  className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Cliente</p>
                <p className="mt-0.5 text-neutral-900">{selected.cliente.nome}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Telefone</p>
                <p className="mt-0.5 text-neutral-900">{selected.cliente.telefone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Serviço</p>
                <p className="mt-0.5 text-neutral-900">{selected.servico}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Profissional</p>
                <p className="mt-0.5 text-neutral-900">{selected.profissional.nome}</p>
              </div>
            </div>

            <DialogFooter showCloseButton />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
