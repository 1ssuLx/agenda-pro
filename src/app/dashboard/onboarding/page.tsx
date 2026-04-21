"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Servico = { nome: string; duracao: number };

const STEPS = ["Estabelecimento", "Serviços", "WhatsApp"];

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Etapa 1
  const [nome, setNome] = useState("");

  // Etapa 2
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoNome, setServicoNome] = useState("");
  const [servicoDuracao, setServiceDuracao] = useState("");
  const [erroServico, setErroServico] = useState("");

  useEffect(() => {
    fetch("/api/tenant")
      .then((r) => r.json())
      .then((d) => {
        setNome(d.nome ?? "");
        if (Array.isArray(d.servicos) && d.servicos.length > 0) {
          setServicos(d.servicos);
        }
      });
  }, []);

  function adicionarServico() {
    const nomeT = servicoNome.trim();
    const duracao = parseInt(servicoDuracao, 10);
    if (!nomeT) { setErroServico("Informe o nome do serviço"); return; }
    if (!duracao || duracao <= 0) { setErroServico("Informe uma duração válida em minutos"); return; }
    if (servicos.some((s) => s.nome.toLowerCase() === nomeT.toLowerCase())) {
      setErroServico("Já existe um serviço com esse nome"); return;
    }
    setServicos((prev) => [...prev, { nome: nomeT, duracao }]);
    setServicoNome("");
    setServiceDuracao("");
    setErroServico("");
  }

  function removerServico(index: number) {
    setServicos((prev) => prev.filter((_, i) => i !== index));
  }

  function podeProsseguir() {
    if (step === 0) return nome.trim().length > 0;
    if (step === 1) return servicos.length > 0;
    return true;
  }

  async function finalizar() {
    setSalvando(true);
    setErro("");
    const res = await fetch("/api/tenant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim(), servicos, onboardingCompleted: true }),
    });
    setSalvando(false);
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setErro(data.erro ?? "Erro ao salvar. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg flex flex-col gap-8">

        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Configuração inicial</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Vamos configurar sua conta em {STEPS.length} passos rápidos.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    i < step
                      ? "bg-neutral-900 text-white"
                      : i === step
                      ? "bg-neutral-900 text-white ring-4 ring-neutral-200"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="text-xs text-neutral-500 hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-16 mx-1 transition-colors ${i < step ? "bg-neutral-900" : "bg-neutral-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Conteúdo da etapa */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 flex flex-col gap-5">
          {step === 0 && (
            <>
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Nome do estabelecimento</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Como seus clientes vão te identificar nas mensagens.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Salão da Ana"
                  className={inputClass}
                  autoFocus
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Seus serviços</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Adicione pelo menos um serviço que você oferece.
                </p>
              </div>

              {servicos.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {servicos.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{s.nome}</p>
                        <p className="text-xs text-neutral-400">{s.duracao} min</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerServico(i)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-neutral-200 p-4">
                <p className="text-sm font-medium text-neutral-700">Adicionar serviço</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={servicoNome}
                    onChange={(e) => { setServicoNome(e.target.value); setErroServico(""); }}
                    onKeyDown={(e) => e.key === "Enter" && adicionarServico()}
                    placeholder="Nome do serviço"
                    className={`${inputClass} flex-1 min-w-0`}
                  />
                  <input
                    type="number"
                    value={servicoDuracao}
                    onChange={(e) => { setServiceDuracao(e.target.value); setErroServico(""); }}
                    onKeyDown={(e) => e.key === "Enter" && adicionarServico()}
                    placeholder="Min"
                    min={1}
                    className={`${inputClass} w-20 shrink-0`}
                  />
                  <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={adicionarServico}>
                    Adicionar
                  </Button>
                </div>
                {erroServico && <p className="text-xs text-red-600">{erroServico}</p>}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Conectar WhatsApp</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  O AgendaPro envia lembretes e notificações pelo WhatsApp via Evolution API.
                </p>
              </div>

              <ol className="flex flex-col gap-3 text-sm text-neutral-700">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">1</span>
                  <span>Acesse o painel da Evolution API e faça login.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">2</span>
                  <span>Crie ou selecione a instância configurada para este sistema.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">3</span>
                  <span>Escaneie o QR Code com o WhatsApp do estabelecimento.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">4</span>
                  <span>Aguarde a conexão ser confirmada (status <strong>open</strong>).</span>
                </li>
              </ol>

              <a
                href={process.env.NEXT_PUBLIC_EVOLUTION_API_URL ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                Abrir painel da Evolution API →
              </a>

              <p className="text-xs text-neutral-400">
                Você pode pular esta etapa e conectar o WhatsApp depois em Configurações.
              </p>
            </>
          )}
        </div>

        {/* Erro de envio */}
        {erro && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>
        )}

        {/* Navegação */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            ← Anterior
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!podeProsseguir()}
            >
              Próximo →
            </Button>
          ) : (
            <Button onClick={finalizar} disabled={salvando}>
              {salvando ? "Salvando…" : "Concluir configuração"}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition";
