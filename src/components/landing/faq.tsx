"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const QA = [
  {
    q: "Preciso de cartão de crédito pra testar?",
    a: "Não. Os 30 dias grátis são de verdade. Cadastra, usa, e só paga depois se quiser continuar. Se não gostar, a gente fica amigo do mesmo jeito.",
  },
  {
    q: "Funciona em qual WhatsApp?",
    a: "Qualquer número de WhatsApp Business. A gente conecta uma vez e pronto — os lembretes saem automaticamente do seu próprio número, com seu nome.",
  },
  {
    q: "E se o cliente não tiver WhatsApp?",
    a: "Hoje no Brasil, 99% dos adultos têm WhatsApp. Pra quem não tem, você pode confirmar na unha como sempre fez — o FixouJá cuida dos outros 99.",
  },
  {
    q: "Posso personalizar a mensagem?",
    a: "Sim. Você edita o texto do lembrete com variáveis como {nome}, {servico}, {data}, {profissional}. Dá pra deixar com a cara da sua marca.",
  },
  {
    q: "Funciona com quantos profissionais?",
    a: "Quantos você quiser. Salão com 1 cabeleireiro ou clínica com 15 — a agenda de todo mundo num lugar só, sem custo extra por pessoa.",
  },
  {
    q: "Como é o cancelamento?",
    a: "Um clique nas configurações. Sem ligação, sem email, sem burocracia. A gente acredita que cliente bom é cliente que fica porque quer.",
  },
];

function Item({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="font-serif text-xl text-white sm:text-2xl">{q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#22c55e]"
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-12 text-[15px] leading-relaxed text-[#a3a3a3]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center font-serif text-5xl leading-[1.05] text-white sm:text-6xl"
        >
          Perguntas.{" "}
          <em className="italic text-[#22c55e]">Respostas.</em>
        </motion.h2>

        <div className="mt-16">
          {QA.map((item, i) => (
            <Item
              key={item.q}
              q={item.q}
              a={item.a}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
