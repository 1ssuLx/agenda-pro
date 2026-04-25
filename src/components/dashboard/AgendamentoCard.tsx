"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AgendamentoActionsMenu from "./AgendamentoActionsMenu";

const TZ = "America/Sao_Paulo";

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

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  agendado:       { label: "Agendado",        className: "bg-neutral-100 text-neutral-600" },
  confirmado:     { label: "Confirmado",      className: "bg-green-100 text-green-700" },
  cancelado:      { label: "Cancelado",       className: "bg-red-100 text-red-700" },
  concluido:      { label: "Concluído",       className: "bg-blue-100 text-blue-700" },
  nao_compareceu: { label: "Não compareceu", className: "bg-orange-100 text-orange-700" },
};

export interface AgendamentoCardData {
  id: string;
  dataHoraIso: string;
  status: string;
  servico: string;
  cliente: { nome: string; telefone: string };
  profissional: { nome: string };
}

interface Props {
  ag: AgendamentoCardData;
}

export default function AgendamentoCard({ ag }: Props) {
  const [detalheAberto, setDetalheAberto] = useState(false);

  const badge = STATUS_BADGE[ag.status] ?? {
    label: ag.status,
    className: "bg-neutral-100 text-neutral-600",
  };

  return (
    <>
      <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3">
        {/* Horário */}
        <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-neutral-500">
          {fmtTime(ag.dataHoraIso)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-neutral-900">
            {ag.cliente.nome}
          </p>
          <p className="truncate text-xs text-neutral-400">{ag.servico}</p>
          <p className="truncate text-xs text-neutral-500">{ag.profissional.nome}</p>
        </div>

        {/* Badge de status */}
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>

        {/* Botão de detalhes */}
        <button
          type="button"
          onClick={() => setDetalheAberto(true)}
          aria-label="Ver detalhes"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <HugeiconsIcon icon={EyeIcon} size={16} color="currentColor" />
        </button>

        {/* Menu de ações */}
        <AgendamentoActionsMenu agendamentoId={ag.id} />
      </div>

      {/* Dialog de detalhes */}
      <Dialog open={detalheAberto} onOpenChange={setDetalheAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do agendamento</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <p className="text-xs font-medium text-neutral-500">Data</p>
              <p className="mt-0.5 text-neutral-900">{fmtDate(ag.dataHoraIso)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Dia da semana</p>
              <p className="mt-0.5 text-neutral-900">{fmtWeekday(ag.dataHoraIso)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Horário</p>
              <p className="mt-0.5 text-neutral-900">{fmtTime(ag.dataHoraIso)}</p>
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
              <p className="mt-0.5 text-neutral-900">{ag.cliente.nome}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Telefone</p>
              <p className="mt-0.5 text-neutral-900">{ag.cliente.telefone}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Serviço</p>
              <p className="mt-0.5 text-neutral-900">{ag.servico}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Profissional</p>
              <p className="mt-0.5 text-neutral-900">{ag.profissional.nome}</p>
            </div>
          </div>

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  );
}
