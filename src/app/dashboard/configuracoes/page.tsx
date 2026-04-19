"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  }, []);

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
    setSalvando(true);
    const res = await fetch("/api/tenant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim(), telefone: telefone.trim(), servicos, mensagemLembrete }),
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
            placeholder="31999999999"
            className={inputClass}
          />
        </Field>
      </Section>

      {/* Seção 2 — Serviços */}
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

        <div className="mt-4 rounded-xl border border-dashed border-neutral-200 p-4">
          <p className="mb-3 text-sm font-medium text-neutral-700">Adicionar serviço</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={novoServicoNome}
              onChange={(e) => setNovoServicoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarServico()}
              placeholder="Nome do serviço"
              className={cn(inputClass, "flex-1 min-w-0")}
            />
            <input
              type="number"
              value={novoServicoDuracao}
              onChange={(e) => setNovoServicoDuracao(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarServico()}
              placeholder="Min"
              min={1}
              className={cn(inputClass, "w-20 shrink-0")}
            />
            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={adicionarServico}>
              Adicionar
            </Button>
          </div>
        </div>
      </Section>

      {/* Seção 3 — Mensagem do lembrete */}
      <Section titulo="Mensagem do lembrete">
        <p className="text-xs text-neutral-400">
          Variáveis disponíveis:{" "}
          {["{nome}", "{servico}", "{data}", "{link}"].map((v) => (
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
