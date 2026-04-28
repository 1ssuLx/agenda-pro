"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Servico {
  nome: string;
  duracao: number;
}

interface TenantData {
  nome: string;
  telefone: string;
  servicos: Servico[];
  mensagemLembrete: string;
}

interface Profissional {
  id: string;
  nome: string;
  telefone: string | null;
}

const MENSAGEM_PADRAO =
  "Olá, {nome}! Lembrando do seu agendamento de {servico} em {data}. Confirme: {link}";

const PREVIEW_VARS: Record<string, string> = {
  nome: "Maria Silva",
  servico: "Corte de cabelo",
  data: "20/04/2025 às 14:00",
  link: "https://exemplo.com/confirmar/abc123",
};

function buildPreview(mensagem: string) {
  return mensagem.replace(/\{(\w+)\}/g, (_, key) => PREVIEW_VARS[key] ?? `{${key}}`);
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [mensagemLembrete, setMensagemLembrete] = useState(MENSAGEM_PADRAO);

  const [novoServicoNome, setNovoServicoNome] = useState("");
  const [novoServicoDuracao, setNovoServicoDuracao] = useState("");

  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [editandoProfId, setEditandoProfId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [salvandoProf, setSalvandoProf] = useState(false);

  const [adicionandoProf, setAdicionandoProf] = useState(false);
  const [novoNomeProf, setNovoNomeProf] = useState("");
  const [novoTelefoneProf, setNovoTelefoneProf] = useState("");
  const [salvandoNovoProf, setSalvandoNovoProf] = useState(false);

  const nomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/tenant")
      .then((r) => r.json())
      .then((data) => {
        setNome(data.nome ?? "");
        setTelefone(data.telefone ?? "");
        setServicos(Array.isArray(data.servicos) ? data.servicos : []);
        setMensagemLembrete(data.mensagemLembrete || MENSAGEM_PADRAO);
      })
      .finally(() => setLoading(false));

    fetch("/api/profissionais")
      .then((r) => r.json())
      .then((list) => Array.isArray(list) && setProfissionais(list));
  }, []);

  function iniciarEdicaoProf(prof: Profissional) {
    setEditandoProfId(prof.id);
    setEditNome(prof.nome);
    setEditTelefone(prof.telefone ?? "");
  }

  function cancelarEdicaoProf() {
    setEditandoProfId(null);
    setEditNome("");
    setEditTelefone("");
  }

  async function salvarProfissional(id: string) {
    if (!editNome.trim()) { toast.error("O nome do profissional não pode ser vazio"); return; }
    setSalvandoProf(true);
    const res = await fetch(`/api/profissionais/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: editNome.trim(), telefone: editTelefone.trim() || null }),
    });
    setSalvandoProf(false);
    if (res.ok) {
      const updated = await res.json();
      setProfissionais((prev) => prev.map((p) => p.id === id ? { ...p, nome: updated.nome, telefone: updated.telefone } : p));
      cancelarEdicaoProf();
      toast.success("Profissional atualizado!");
    } else {
      const err = await res.json();
      toast.error(err.erro ?? "Erro ao salvar profissional");
    }
  }

  async function criarProfissional() {
    if (!novoNomeProf.trim()) { toast.error("O nome do profissional é obrigatório"); return; }
    setSalvandoNovoProf(true);
    const res = await fetch("/api/profissionais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNomeProf.trim(), telefone: novoTelefoneProf.trim() || null }),
    });
    setSalvandoNovoProf(false);
    if (res.ok) {
      const criado = await res.json();
      setProfissionais((prev) => [...prev, criado]);
      setNovoNomeProf("");
      setNovoTelefoneProf("");
      setAdicionandoProf(false);
      toast.success("Profissional adicionado!");
    } else {
      const err = await res.json();
      toast.error(err.erro ?? "Erro ao adicionar profissional");
    }
  }

  function adicionarServico() {
    const nomeT = novoServicoNome.trim();
    const duracao = parseInt(novoServicoDuracao, 10);
    if (!nomeT) { toast.error("Informe o nome do serviço"); return; }
    if (!duracao || duracao <= 0) { toast.error("Informe uma duração válida em minutos"); return; }
    setServicos((prev) => [...prev, { nome: nomeT, duracao }]);
    setNovoServicoNome("");
    setNovoServicoDuracao("");
  }

  function removerServico(index: number) {
    setServicos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSalvar() {
    if (!nome.trim()) { toast.error("O nome do estabelecimento não pode ser vazio"); nomeRef.current?.focus(); return; }
    let tel = telefone.trim();
    if (tel) {
      if (!tel.startsWith("55")) tel = "55" + tel;
      if (tel.length < 12 || tel.length > 13) {
        toast.error("Telefone deve ter 12 ou 13 dígitos incluindo o código do país (55)");
        return;
      }
    }
    setSalvando(true);
    const res = await fetch("/api/tenant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim(), telefone: tel, servicos, mensagemLembrete }),
    });
    setSalvando(false);
    if (res.ok) {
      toast.success("Configurações salvas com sucesso!");
    } else {
      const err = await res.json();
      toast.error(err.erro ?? "Erro ao salvar configurações");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-neutral-400">
        Carregando…
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Configurações</h1>
        <Button onClick={handleSalvar} disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>

      {/* Seção 1 — Dados do estabelecimento */}
      <Section titulo="Dados do estabelecimento">
        <Field label="Nome do estabelecimento">
          <input
            ref={nomeRef}
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Salão da Ana"
            className={inputClass}
          />
        </Field>
        <Field label="Telefone">
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ""))}
            placeholder="5531999999999"
            className={inputClass}
          />
          <p className="text-xs text-neutral-400">
            Inclua o código do país (55) seguido do DDD e número
          </p>
        </Field>
      </Section>

      {/* Seção 2 — Profissionais */}
      <Section titulo="Profissionais">
        {profissionais.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhum profissional encontrado.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {profissionais.map((prof) =>
              editandoProfId === prof.id ? (
                <li key={prof.id} className="flex flex-col gap-3 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3">
                  <Field label="Nome">
                    <input
                      type="text"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className={inputClass}
                      autoFocus
                    />
                  </Field>
                  <Field label="Telefone">
                    <input
                      type="tel"
                      value={editTelefone}
                      onChange={(e) => setEditTelefone(e.target.value.replace(/\D/g, ""))}
                      placeholder="5531999999999"
                      className={inputClass}
                    />
                  </Field>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => salvarProfissional(prof.id)} disabled={salvandoProf}>
                      {salvandoProf ? "Salvando…" : "Salvar"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelarEdicaoProf} disabled={salvandoProf}>
                      Cancelar
                    </Button>
                  </div>
                </li>
              ) : (
                <li key={prof.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{prof.nome}</p>
                    <p className="text-xs text-neutral-400">{prof.telefone ?? "Sem telefone"}</p>
                  </div>
                  <button
                    onClick={() => iniciarEdicaoProf(prof)}
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Editar
                  </button>
                </li>
              )
            )}
          </ul>
        )}

        {adicionandoProf ? (
          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-neutral-200 p-4">
            <p className="text-sm font-medium text-neutral-700">Novo profissional</p>
            <Field label="Nome">
              <input
                type="text"
                value={novoNomeProf}
                onChange={(e) => setNovoNomeProf(e.target.value)}
                placeholder="Ex: Carlos Souza"
                className={inputClass}
                autoFocus
              />
            </Field>
            <Field label="Telefone (opcional)">
              <input
                type="tel"
                value={novoTelefoneProf}
                onChange={(e) => setNovoTelefoneProf(e.target.value.replace(/\D/g, ""))}
                placeholder="5531999999999"
                className={inputClass}
              />
            </Field>
            <div className="flex gap-2">
              <Button size="sm" onClick={criarProfissional} disabled={salvandoNovoProf}>
                {salvandoNovoProf ? "Salvando…" : "Salvar"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setAdicionandoProf(false); setNovoNomeProf(""); setNovoTelefoneProf(""); }} disabled={salvandoNovoProf}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdicionandoProf(true)}
            className="mt-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            + Adicionar profissional
          </button>
        )}
      </Section>

      {/* Seção 3 — Serviços */}
      <Section titulo="Serviços">
        {servicos.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {servicos.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">{s.nome}</p>
                  <p className="text-xs text-neutral-400">{s.duracao} min</p>
                </div>
                <button
                  onClick={() => removerServico(i)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">Nenhum serviço cadastrado ainda.</p>
        )}

        <TooltipProvider>
          <div className="mt-4 rounded-xl border border-dashed border-neutral-200 p-4">
            <p className="mb-3 text-sm font-medium text-neutral-700">Adicionar serviço</p>
            <div className="grid grid-cols-[1fr_5rem] gap-2 mb-1">
              <label className="text-xs font-medium text-neutral-500">Nome do serviço</label>
              <div className="flex items-center gap-1">
                <label className="text-xs font-medium text-neutral-500">Duração (min)</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default text-neutral-400">
                      <HugeiconsIcon icon={InformationCircleIcon} size={14} color="currentColor" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Coloque o tempo médio que você leva para realizar este serviço.
                    Ex: Corte simples = 30 min, Coloração = 120 min
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={novoServicoNome}
                onChange={(e) => setNovoServicoNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && adicionarServico()}
                placeholder="Ex: Corte simples"
                className={cn(inputClass, "flex-1 min-w-0")}
              />
              <input
                type="number"
                value={novoServicoDuracao}
                onChange={(e) => setNovoServicoDuracao(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && adicionarServico()}
                placeholder="30"
                min={1}
                className={cn(inputClass, "w-20 shrink-0")}
              />
              <Button
                type="button"
                size="sm"
                className="shrink-0 bg-neutral-900 text-white hover:bg-neutral-700"
                onClick={adicionarServico}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </Section>

      {/* Seção 4 — Mensagem do lembrete */}
      <Section titulo="Mensagem do lembrete">
        <p className="text-xs text-neutral-400">
          Variáveis disponíveis:{" "}
          {["{nome}", "{servico}", "{profissional}", "{data}", "{link}"].map((v) => (
            <code
              key={v}
              className="mx-0.5 rounded bg-neutral-100 px-1 py-0.5 font-mono text-neutral-600"
            >
              {v}
            </code>
          ))}
        </p>
        <Field label="Mensagem">
          <textarea
            value={mensagemLembrete}
            onChange={(e) => setMensagemLembrete(e.target.value)}
            rows={4}
            className={cn(inputClass, "resize-none")}
          />
        </Field>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-neutral-400">
            Preview
          </p>
          <p className="whitespace-pre-wrap text-sm text-neutral-700">
            {buildPreview(mensagemLembrete)}
          </p>
        </div>
      </Section>

      <div className="flex justify-end pb-6">
        <Button onClick={handleSalvar} disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-base font-semibold text-neutral-900">{titulo}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition";
