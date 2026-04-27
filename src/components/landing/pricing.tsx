"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const FEATURES = [
  "Agendamentos ilimitados",
  "Confirmação automática pelo WhatsApp",
  "Múltiplos profissionais",
  "Mensagem personalizada com sua marca",
  "Painel em tempo real",
  "Suporte humano pelo WhatsApp",
  "30 dias grátis · cancele quando quiser",
];

export function Pricing() {

  return (
    <section id="preco" className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center font-serif text-5xl leading-[1.05] text-white sm:text-6xl"
        >
          Um preço.{" "}
          <em className="italic text-[#22c55e]">Sem pegadinha.</em>
        </motion.h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[#a3a3a3]">
          Menos que o custo de uma falta por mês. E você economiza várias.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mt-16 w-full max-w-[480px]"
        >
          <div className="relative overflow-hidden rounded-3xl border border-[rgba(34,197,94,0.25)] bg-gradient-to-b from-[#0a0a0a] to-[#050505] p-10 shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_100px_rgba(34,197,94,0.1)]">
            <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[rgba(34,197,94,0.15)] blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] px-3 py-1 text-[11px] uppercase tracking-widest text-[#22c55e]">
                Plano único
              </div>
              <h3 className="mt-6 font-serif text-3xl text-white">Profissional</h3>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-serif text-2xl text-[#a3a3a3]">R$</span>
                <span className="font-serif text-7xl text-white">99</span>
                <span className="font-serif text-3xl text-[#a3a3a3]">,90</span>
                <span className="ml-2 text-sm text-[#737373]">/ mês</span>
              </div>

              <ul className="mt-8 space-y-3">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#d4d4d4]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mt-0.5 shrink-0"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="12" fill="rgba(34,197,94,0.15)" />
                      <path
                        d="M7 12L10.5 15.5L17 9"
                        stroke="#22c55e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="btn-shine mt-10 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-medium text-white shadow-[0_20px_60px_rgba(34,197,94,0.3)]"
              >
                Começar 30 dias grátis →
              </Link>

              <p className="mt-4 text-center text-[11px] text-[#525252]">
                Sem cartão · cancele quando quiser
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
