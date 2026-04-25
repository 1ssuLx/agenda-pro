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
import { cn } from "@/lib/utils";

// ─── Constantes ───────────────────────────────────────────────────────────────
const TZ = "America/Sao_Paulo";
const SLOT_HEIGHT = 64;   // px por slot de 30 minutos
const START_HOUR  = 7;
const END_HOUR    = 22;
const START_MINUTES = START_HOUR * 60;
const TIME_COL_W  = 52;   // px largura da coluna de horários

// ─── Slots de 07:00 a 22:00 em intervalos de 30 min ──────────────────────────
type Slot = { hour: number; minute: number; label: string };

const SLOTS: Slot[] = (() => {
  const r: Slot[] = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === END_HOUR && m > 0) break;
      r.push({ hour: h, minute: m, label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` });
    }
  }
  return r;
})();

const TOTAL_HEIGHT = SLOTS.length * SLOT_HEIGHT;

const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toLocalISODate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatHeaderDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long" }).format(date);
  const dayMonth = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "numeric", month: "long" }).format(date);
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayMonth}`;
}

function formatMonthYear(date: Date): string {
  const s = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getLocalHourMinute(iso: string): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date(iso));
  return {
    hour:   parseInt(parts.find((p) => p.type === "hour")?.value   ?? "0", 10),
    minute: parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10),
  };
}

function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}
function fmtWeekday(iso: string): string {
  const w = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long" }).format(new Date(iso));
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/** Retorna 42 dates (6 semanas × 7 dias) para o mini calendário do mês dado. */
function getMonthCalendarDays(monthDate: Date): Date[] {
  const year  = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay(); // 0=Dom
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(year, month, 1 - firstDow + i));
  }
  return days;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface AgendamentoAPI {
  id: string;
  dataHora: string;
  status: string;
  servico: string;
  duracaoMinutos: number;
  cliente: { nome: string; telefone: string };
  profissional: { nome: string };
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  agendado:       { label: "Agendado",        className: "bg-neutral-100 text-neutral-600" },
  confirmado:     { label: "Confirmado",      className: "bg-green-100 text-green-700" },
  cancelado:      { label: "Cancelado",       className: "bg-red-100 text-red-700" },
  concluido:      { label: "Concluído",       className: "bg-blue-100 text-blue-700" },
  nao_compareceu: { label: "Não compareceu", className: "bg-orange-100 text-orange-700" },
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CalendarioPage() {
  const [date,         setDate]         = useState<Date>(() => new Date());
  const [miniCalMonth, setMiniCalMonth] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [agendamentos,           setAgendamentos]           = useState<AgendamentoAPI[]>([]);
  const [monthAppointmentDates,  setMonthAppointmentDates]  = useState<Set<string>>(new Set());
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<AgendamentoAPI | null>(null);

  const dateStr = toLocalISODate(date);

  // ── Fetch agendamentos do dia (timeline) ─────────────────────────────────
  const fetchDay = useCallback(async () => {
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

  useEffect(() => { fetchDay(); }, [fetchDay]);

  // ── Fetch agendamentos do mês (pontos no mini calendário) ────────────────
  const fetchMonth = useCallback(async () => {
    const year  = miniCalMonth.getFullYear();
    const month = miniCalMonth.getMonth();
    const inicio = toLocalISODate(new Date(year, month, 1));
    const fim    = toLocalISODate(new Date(year, month + 1, 0));
    try {
      const res = await fetch(`/api/agendamentos?inicio=${inicio}&fim=${fim}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const dates = new Set<string>(
            (data as AgendamentoAPI[])
              .filter((ag) => ag.status !== "cancelado")
              .map((ag) => toLocalISODate(new Date(ag.dataHora)))
          );
          setMonthAppointmentDates(dates);
        }
      }
    } catch {
      // ignora falha silenciosa
    }
  }, [miniCalMonth]);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  // ── Navegação da timeline ─────────────────────────────────────────────────
  function moveTo(nd: Date) {
    setDate(nd);
    setMiniCalMonth(new Date(nd.getFullYear(), nd.getMonth(), 1));
  }
  function prevDay()  { const d = new Date(date); d.setDate(d.getDate() - 1); moveTo(d); }
  function nextDay()  { const d = new Date(date); d.setDate(d.getDate() + 1); moveTo(d); }
  function goToday()  { moveTo(new Date()); }

  // ── Navegação do mini calendário ──────────────────────────────────────────
  function prevMiniMonth() {
    setMiniCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function nextMiniMonth() {
    setMiniCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }
  function selectDay(day: Date) {
    setDate(day);
  }

  // ── Dados derivados ───────────────────────────────────────────────────────
  const agendamentosVisiveis = agendamentos.filter((ag) => ag.status !== "cancelado");
  const calendarDays         = getMonthCalendarDays(miniCalMonth);
  const today                = new Date();

  const badge = selected
    ? (STATUS_BADGE[selected.status] ?? { label: selected.status, className: "bg-neutral-100 text-neutral-600" })
    : null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={prevDay} aria-label="Dia anterior"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900">
            ←
          </button>
          <button type="button" onClick={goToday}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
            Hoje
          </button>
          <button type="button" onClick={nextDay} aria-label="Próximo dia"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900">
            →
          </button>
        </div>

        <h1 className="flex-1 text-center text-base font-semibold text-neutral-900 sm:text-lg">
          {formatHeaderDate(date)}
        </h1>

        <Button asChild size="sm">
          <Link href="/dashboard/agendamentos/novo">+ Novo agendamento</Link>
        </Button>
      </div>

      {/* ── Body: mini calendário + timeline ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">

        {/* ── Mini calendário ── */}
        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-3 lg:w-56 lg:shrink-0">
          {/* Cabeçalho do mês */}
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={prevMiniMonth} aria-label="Mês anterior"
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 text-sm">
              ←
            </button>
            <span className="text-xs font-semibold text-neutral-800">
              {formatMonthYear(miniCalMonth)}
            </span>
            <button type="button" onClick={nextMiniMonth} aria-label="Próximo mês"
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 text-sm">
              →
            </button>
          </div>

          {/* Dias da semana */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="py-0.5 text-[10px] font-medium text-neutral-400">{d}</div>
            ))}
          </div>

          {/* Grid de dias (6 semanas × 7 dias) */}
          <div className="grid grid-cols-7 gap-y-0.5 text-center">
            {calendarDays.map((day, i) => {
              const iso            = toLocalISODate(day);
              const isCurrentMonth = day.getMonth() === miniCalMonth.getMonth();
              const isSelected     = iso === dateStr;
              const isToday        = iso === toLocalISODate(today);
              const hasDot         = isCurrentMonth && monthAppointmentDates.has(iso);

              return (
                <button
                  key={i}
                  type="button"
                  disabled={!isCurrentMonth}
                  onClick={() => isCurrentMonth && selectDay(day)}
                  className={cn(
                    "relative flex h-8 flex-col items-center justify-center rounded-lg text-[12px] transition-colors",
                    !isCurrentMonth
                      ? "cursor-default text-neutral-300"
                      : isSelected
                      ? "bg-green-500 font-semibold text-white"
                      : isToday
                      ? "font-bold text-green-600 hover:bg-neutral-100"
                      : "text-neutral-700 hover:bg-neutral-100"
                  )}
                >
                  {day.getDate()}
                  {hasDot && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {loading && (
            <div className="px-4 py-3 text-sm text-neutral-400">Carregando…</div>
          )}

          {!loading && agendamentosVisiveis.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-2xl">📭</p>
              <p className="text-sm text-neutral-400">Nenhum agendamento para este dia.</p>
            </div>
          )}

          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 220px)", minHeight: "400px" }}
          >
            {/* Container com posicionamento absoluto */}
            <div className="relative select-none" style={{ height: TOTAL_HEIGHT }}>

              {/* Linhas de slot (horários + separadores) */}
              {SLOTS.map((slot, idx) => (
                <div
                  key={slot.label}
                  style={{
                    position: "absolute",
                    top:    idx * SLOT_HEIGHT,
                    left:   0,
                    right:  0,
                    height: SLOT_HEIGHT,
                    borderBottom: idx < SLOTS.length - 1 ? "1px solid #f5f5f5" : "none",
                  }}
                  className="flex items-start"
                >
                  <span
                    style={{ width: TIME_COL_W, flexShrink: 0 }}
                    className="px-3 pt-1.5 text-[11px] tabular-nums text-neutral-400"
                  >
                    {slot.label}
                  </span>
                </div>
              ))}

              {/* Cards de agendamento com altura proporcional */}
              {agendamentosVisiveis.map((ag) => {
                const { hour, minute } = getLocalHourMinute(ag.dataHora);
                const agMinutes  = hour * 60 + minute;
                const topOffset  = ((agMinutes - START_MINUTES) / 30) * SLOT_HEIGHT;
                const cardHeight = Math.max(
                  ((ag.duracaoMinutos ?? 60) / 30) * SLOT_HEIGHT,
                  28 // altura mínima para o card ser clicável
                );

                // Ignorar agendamentos fora da janela visível
                if (topOffset < 0 || topOffset >= TOTAL_HEIGHT) return null;

                return (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => setSelected(ag)}
                    style={{
                      position: "absolute",
                      top:    topOffset + 2,
                      left:   TIME_COL_W + 4,
                      right:  8,
                      height: cardHeight - 4,
                      zIndex: 10,
                    }}
                    className="flex flex-col justify-start overflow-hidden rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-left transition-colors hover:bg-green-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                  >
                    <div className="flex flex-col overflow-hidden" style={{ height: "100%" }}>
                      {cardHeight < 52 ? (
                        // Card muito pequeno: tudo numa linha, sem quebrar
                        <p className="truncate text-green-900" style={{ fontSize: 11 }}>
                          {ag.cliente.nome} · {ag.servico} · {ag.profissional.nome}
                        </p>
                      ) : (
                        <>
                          {/* Linha 1: nome do cliente */}
                          <p className="truncate font-medium text-green-900" style={{ fontSize: 12 }}>
                            {ag.cliente.nome}
                          </p>
                          {/* Linha 2: serviço · profissional */}
                          <p className="truncate text-green-700" style={{ fontSize: 11 }}>
                            {ag.servico} · {ag.profissional.nome}
                          </p>
                          {/* Linha 3: horário e duração — só se houver espaço */}
                          {cardHeight >= 76 && (
                            <p className="truncate text-green-600" style={{ fontSize: 11, opacity: 0.7 }}>
                              {fmtTime(ag.dataHora)} — {ag.duracaoMinutos ?? 60} min
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dialog de detalhes ── */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
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
                <p className="text-xs font-medium text-neutral-500">Duração</p>
                <p className="mt-0.5 text-neutral-900">{selected.duracaoMinutos ?? 60} min</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Status</p>
                <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium", badge.className)}>
                  {badge.label}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Serviço</p>
                <p className="mt-0.5 text-neutral-900">{selected.servico}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Cliente</p>
                <p className="mt-0.5 text-neutral-900">{selected.cliente.nome}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Telefone</p>
                <p className="mt-0.5 text-neutral-900">{selected.cliente.telefone}</p>
              </div>
              <div className="col-span-2">
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
