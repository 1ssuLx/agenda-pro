"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useInterest } from "./interest-context";

function maskWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function InterestModal() {
  const { open, setOpen } = useInterest();
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setNome("");
        setWhatsapp("");
        setErro("");
        setSucesso(false);
        setLoading(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC + body lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, setOpen]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErro("");

    if (!nome.trim()) {
      setErro("Por favor, informe o seu nome completo.");
      return;
    }
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10) {
      setErro("Informe um WhatsApp válido com DDD.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/interesse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), whatsapp: digits }),
      });
      if (res.ok) {
        setSucesso(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErro(data?.erro ?? "Ocorreu um erro. Tente novamente.");
      }
    } catch {
      setErro("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="interesse-title"
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] rounded-3xl border border-[rgba(34,197,94,0.2)] bg-[#0a0a0a] p-8 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.6),0_0_80px_rgba(34,197,94,0.08)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#737373] hover:bg-white/5 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            <AnimatePresence mode="wait">
              {!sucesso ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2
                    id="interesse-title"
                    className="font-serif text-[32px] leading-[1.05] text-white"
                  >
                    Garanta sua <em className="italic text-[#22c55e]">vaga grátis</em>.
                  </h2>
                  <p className="mt-2 text-sm text-[#737373]">
                    Restam poucas vagas para o programa de teste de 30 dias.
                  </p>

                  <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="int-nome" className="text-xs font-medium text-[#a3a3a3]">
                        Nome completo
                      </label>
                      <input
                        id="int-nome"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome"
                        autoComplete="name"
                        className="rounded-xl border border-white/[0.08] bg-[#111] px-4 py-3.5 text-sm text-white outline-none placeholder:text-[#525252] focus:border-[#22c55e] focus:ring-2 focus:ring-[rgba(34,197,94,0.15)] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="int-zap" className="text-xs font-medium text-[#a3a3a3]">
                        WhatsApp
                      </label>
                      <input
                        id="int-zap"
                        type="tel"
                        inputMode="numeric"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(maskWhatsapp(e.target.value))}
                        placeholder="(31) 99999-9999"
                        autoComplete="tel"
                        className="rounded-xl border border-white/[0.08] bg-[#111] px-4 py-3.5 text-sm text-white outline-none placeholder:text-[#525252] focus:border-[#22c55e] focus:ring-2 focus:ring-[rgba(34,197,94,0.15)] transition-colors"
                      />
                    </div>

                    {erro && (
                      <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
                        {erro}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-shine mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-medium text-black shadow-[0_10px_30px_rgba(34,197,94,0.25)] transition-opacity disabled:opacity-70"
                    >
                      {loading ? "Salvando…" : "Quero minha vaga →"}
                    </button>

                    <p className="mt-1 text-center text-[11px] text-[#525252]">
                      ✦ 30 dias grátis ✦ Sem cartão ✦ Cancele quando quiser ✦
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="flex flex-col items-center py-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
                    className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(34,197,94,0.12)] ring-1 ring-[rgba(34,197,94,0.35)]"
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <motion.path
                        d="M5 12.5L10 17.5L19 7.5"
                        stroke="#22c55e"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.55, delay: 0.25, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>
                  <h3 className="font-serif text-3xl text-white">Recebido! ✓</h3>
                  <p className="mt-3 max-w-sm text-sm text-[#a3a3a3]">
                    Entraremos em contato pelo WhatsApp em até 24h. Fique de olho!
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-7 rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    Fechar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
