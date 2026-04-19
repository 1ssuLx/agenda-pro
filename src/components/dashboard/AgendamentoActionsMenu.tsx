"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  agendamentoId: string;
}

const ACOES = [
  { label: "Marcar como concluído",    status: "concluido",      variant: "default"     as const },
  { label: "Marcar como não compareceu", status: "nao_compareceu", variant: "default"   as const },
  { label: "Cancelar",                 status: "cancelado",      variant: "destructive" as const },
];

export default function AgendamentoActionsMenu({ agendamentoId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novaData, setNovaData] = useState("");
  const [novaHora, setNovaHora] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleAcao(status: string) {
    setLoading(true);
    await fetch(`/api/agendamentos/${agendamentoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleReagendar() {
    if (!novaData || !novaHora) return;
    setSalvando(true);
    const dataHora = new Date(`${novaData}T${novaHora}`).toISOString();
    const res = await fetch(`/api/agendamentos/${agendamentoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataHora }),
    });
    setSalvando(false);
    if (res.ok) {
      setDialogAberto(false);
      toast.success("Agendamento reagendado com sucesso!");
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.erro ?? "Erro ao reagendar agendamento");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50"
            aria-label="Ações"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} size={16} color="currentColor" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setNovaData("");
              setNovaHora("");
              setDialogAberto(true);
            }}
          >
            Reagendar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {ACOES.map(({ label, status, variant }, i) => (
            <React.Fragment key={status}>
              {i === ACOES.length - 1 && <DropdownMenuSeparator />}
              <DropdownMenuItem variant={variant} onSelect={() => handleAcao(status)}>
                {label}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar agendamento</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Data</label>
              <input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Horário</label>
              <input
                type="time"
                value={novaHora}
                onChange={(e) => setNovaHora(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReagendar}
              disabled={salvando || !novaData || !novaHora}
            >
              {salvando ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
