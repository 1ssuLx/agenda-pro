"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toUTC } from "@/lib/date";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const schema = z.object({
  clienteId: z.string().min(1, "Selecione ou cadastre um cliente"),
  profissionalId: z.string().min(1, "Selecione um profissional"),
  servico: z.string().min(1, "Informe o serviço"),
  data: z.string().min(1, "Informe a data"),
  hora: z.string().min(1, "Informe o horário"),
});

type FormValues = z.infer<typeof schema>;

type ClienteEncontrado = { id: string; nome: string; telefone: string; servicoPadrao: string | null };
type Servico = { nome: string; duracao: number };
type Profissional = { id: string; nome: string };

export default function NovoAgendamentoPage() {
  const router = useRouter();

  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [duracaoMinutos, setDuracaoMinutos] = useState(60);
  const [telefone, setTelefone] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState<ClienteEncontrado | null>(null);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [salvandoCliente, setSalvandoCliente] = useState(false);
  const [erroCadastro, setErroCadastro] = useState("");
  const [erroApi, setErroApi] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    fetch("/api/tenant")
      .then((r) => r.json())
      .then((d) => setServicos(Array.isArray(d.servicos) ? d.servicos : []));
    fetch("/api/profissionais")
      .then((r) => r.json())
      .then((list) => Array.isArray(list) && setProfissionais(list));
  }, []);

  function handleTelefoneChange(valor: string) {
    const apenasNumeros = valor.replace(/\D/g, "");
    setTelefone(apenasNumeros);
    setClienteEncontrado(null);
    setMostrarCadastro(false);
    setErroCadastro("");
    setValue("clienteId", "");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (valor.replace(/\D/g, "").length < 8) return;

    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(`/api/clientes?telefone=${encodeURIComponent(valor)}`);
        const lista: ClienteEncontrado[] = await res.json();
        if (lista.length > 0) {
          setClienteEncontrado(lista[0]);
          setValue("clienteId", lista[0].id, { shouldValidate: true });
          if (lista[0].servicoPadrao) {
            setValue("servico", lista[0].servicoPadrao, { shouldValidate: true });
          }
        }
      } finally {
        setBuscando(false);
      }
    }, 500);
  }

  async function handleCadastrarCliente() {
    if (!novoNome.trim()) {
      setErroCadastro("Informe o nome do cliente");
      return;
    }
    let tel = telefone.startsWith("55") ? telefone : "55" + telefone;
    if (tel.length < 12 || tel.length > 13) {
      setErroCadastro("Telefone deve ter 12 ou 13 dígitos incluindo o código do país (55)");
      return;
    }
    setSalvandoCliente(true);
    setErroCadastro("");
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome.trim(), telefone: tel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErroCadastro(data.erro ?? "Erro ao cadastrar cliente");
        return;
      }
      setClienteEncontrado(data);
      setValue("clienteId", data.id, { shouldValidate: true });
      setMostrarCadastro(false);
      setNovoNome("");
    } finally {
      setSalvandoCliente(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setErroApi("");

    const dataHora = toUTC(values.data, values.hora).toISOString();

    const res = await fetch("/api/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId: values.clienteId,
        profissionalId: values.profissionalId,
        servico: values.servico,
        dataHora,
        duracaoMinutos,
      }),
    });

    setIsLoading(false);
    if (res.ok) {
      toast.success("Agendamento criado com sucesso!");
      router.push("/dashboard");
    } else {
      const err = await res.json();
      setErroApi(err.erro ?? "Erro ao criar agendamento");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
      >
        ← Voltar
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo agendamento</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Telefone */}
        <Field label="Telefone do cliente" tooltip="Digite apenas números com código do país. Ex: 5531999999999">
          <input
            type="tel"
            value={telefone}
            onChange={(e) => handleTelefoneChange(e.target.value)}
            placeholder="5531999999999"
            className={inputClass}
          />
          <p className="mt-0.5 text-xs text-neutral-400">
            Inclua o código do país (55) seguido do DDD e número
          </p>
          {buscando && <p className="mt-1 text-xs text-neutral-400">Buscando…</p>}
          {clienteEncontrado && (
            <p className="mt-1 text-xs font-medium text-green-700">
              ✓ {clienteEncontrado.nome}
            </p>
          )}
          {!buscando && !clienteEncontrado && telefone.replace(/\D/g, "").length >= 8 && (
            mostrarCadastro ? (
              <div className="mt-3 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-medium text-neutral-700">Cadastrar cliente</p>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Nome completo"
                  className={inputClass}
                />
                <input
                  type="tel"
                  value={telefone}
                  readOnly
                  className={`${inputClass} bg-neutral-100 text-neutral-400`}
                />
                {erroCadastro && (
                  <p className="text-xs text-red-600">{erroCadastro}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleCadastrarCliente}
                    disabled={salvandoCliente}
                    size="sm"
                  >
                    {salvandoCliente ? "Salvando…" : "Salvar cliente"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setMostrarCadastro(false); setNovoNome(""); setErroCadastro(""); }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMostrarCadastro(true)}
                className="mt-1 text-xs font-medium text-blue-600 hover:underline"
              >
                + Cadastrar cliente
              </button>
            )
          )}
          {errors.clienteId && (
            <p className="mt-1 text-xs text-red-600">{errors.clienteId.message}</p>
          )}
          <input type="hidden" {...register("clienteId")} />
        </Field>

        {/* Profissional */}
        <Field label="Profissional" error={errors.profissionalId?.message} tooltip="Gerencie as opções em Configurações">
          <Controller
            control={control}
            name="profissionalId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full rounded-lg border-neutral-200 bg-white py-2.5 text-sm text-neutral-900 focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-100">
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      Nenhum profissional cadastrado — configure em Configurações
                    </SelectItem>
                  ) : (
                    profissionais.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {/* Serviço */}
        <Field label="Serviço" error={errors.servico?.message} tooltip="Gerencie as opções em Configurações">
          <Controller
            control={control}
            name="servico"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  const found = servicos.find((s) => s.nome === value);
                  setDuracaoMinutos(found?.duracao ?? 60);
                }}
              >
                <SelectTrigger className="w-full rounded-lg border-neutral-200 bg-white py-2.5 text-sm text-neutral-900 focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-100">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      Nenhum serviço cadastrado — configure em Configurações
                    </SelectItem>
                  ) : (
                    servicos.map((s) => (
                      <SelectItem key={s.nome} value={s.nome}>
                        {s.nome} ({s.duracao} min)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {/* Data + Hora */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data" error={errors.data?.message}>
            <input type="date" className={inputClass} {...register("data")} />
          </Field>
          <Field label="Horário" error={errors.hora?.message}>
            <input type="time" className={inputClass} {...register("hora")} />
          </Field>
        </div>

        {erroApi && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erroApi}</p>
        )}

        <Button type="submit" disabled={isLoading || isSubmitting}>
          {isLoading || isSubmitting ? "Salvando…" : "Criar agendamento"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  tooltip,
  children,
}: {
  label: string;
  error?: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-neutral-700">{label}</label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-500 hover:bg-neutral-300 hover:text-neutral-700 transition-colors"
                aria-label={`Ajuda: ${label}`}
              >
                ?
              </button>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition";
