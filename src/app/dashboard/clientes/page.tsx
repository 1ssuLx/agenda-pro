"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  servicoPadrao: string | null;
  _count: { agendamentos: number };
}

interface Servico {
  nome: string;
  duracao: number;
}

interface Editando {
  id: string;
  nome: string;
  telefone: string;
  servicoPadrao: string;
}

export default function ClientesPage() {
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Editando | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca), 300);
    return () => clearTimeout(t);
  }, [busca]);

  function fetchClientes() {
    setLoading(true);
    fetch("/api/clientes")
      .then((r) => r.json())
      .then(setClientes)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchClientes();
    fetch("/api/tenant")
      .then((r) => r.json())
      .then((d) => setServicos(Array.isArray(d.servicos) ? d.servicos : []));
  }, []);

  const clientesFiltrados = buscaDebounced.trim()
    ? clientes.filter(
        (c) =>
          c.nome.toLowerCase().includes(buscaDebounced.toLowerCase()) ||
          c.telefone.includes(buscaDebounced)
      )
    : clientes;

  function abrirEditar(c: Cliente) {
    setEditando({
      id: c.id,
      nome: c.nome,
      telefone: c.telefone,
      servicoPadrao: c.servicoPadrao ?? "",
    });
    setDialogAberto(true);
  }

  async function handleSalvar() {
    if (!editando) return;
    if (!editando.nome.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }
    if (!editando.telefone.trim()) {
      toast.error("O telefone é obrigatório");
      return;
    }
    setSalvando(true);
    const res = await fetch(`/api/clientes/${editando.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: editando.nome.trim(),
        telefone: editando.telefone.trim(),
        servicoPadrao: editando.servicoPadrao || null,
      }),
    });
    setSalvando(false);
    if (res.ok) {
      toast.success("Cliente atualizado com sucesso!");
      setDialogAberto(false);
      fetchClientes();
    } else {
      const err = await res.json();
      toast.error(err.erro ?? "Erro ao atualizar cliente");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-neutral-900">Clientes</h1>

      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou telefone…"
        className={inputClass}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-neutral-400">
          Carregando…
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
          <p className="text-4xl">👥</p>
          <p className="font-medium text-neutral-700">Nenhum cliente encontrado</p>
          {buscaDebounced && (
            <p className="text-sm text-neutral-400">Tente ajustar o termo de busca.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {clientesFiltrados.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">{c.nome}</p>
                <p className="truncate text-xs text-neutral-400">{c.telefone}</p>
                {c.servicoPadrao && (
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {c.servicoPadrao}
                  </p>
                )}
              </div>

              <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                {c._count.agendamentos}{" "}
                {c._count.agendamentos === 1 ? "agendamento" : "agendamentos"}
              </span>

              <Button variant="outline" size="sm" onClick={() => abrirEditar(c)}>
                Editar
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>

          {editando && (
            <div className="flex flex-col gap-4 py-2">
              <Field label="Nome">
                <input
                  type="text"
                  value={editando.nome}
                  onChange={(e) =>
                    setEditando({ ...editando, nome: e.target.value })
                  }
                  placeholder="Nome do cliente"
                  className={inputClass}
                />
              </Field>

              <Field label="Telefone">
                <input
                  type="tel"
                  value={editando.telefone}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      telefone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="31999999999"
                  className={inputClass}
                />
              </Field>

              <Field label="Serviço padrão">
                <select
                  value={editando.servicoPadrao}
                  onChange={(e) =>
                    setEditando({ ...editando, servicoPadrao: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Nenhum</option>
                  {servicos.map((s) => (
                    <option key={s.nome} value={s.nome}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}
