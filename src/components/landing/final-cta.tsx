"use client";

import { motion } from "framer-motion";
import { useInterest } from "./interest-context";

export function FinalCTA() {
  const { setOpen } = useInterest();

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-32">
      <div className="aurora pointer-events-none absolute inset-0" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <h2 className="font-serif text-[56px] leading-[0.98] tracking-tight-sm text-white sm:text-[80px] md:text-[104px]">
          Chega de correr atrás.{" "}
          <em className="italic text-[#22c55e]">Fixou já.</em>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg text-[#a3a3a3]">
          30 dias grátis. Sem cartão. Sem pegadinha. Só agenda cheia.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-shine inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium text-white shadow-[0_20px_60px_rgba(34,197,94,0.4)]"
          >
            Garantir minha vaga grátis →
          </button>
          <a
            href="#preco"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-8 py-4 text-sm text-white transition-colors hover:bg-white/5"
          >
            Ver preço
          </a>
        </div>
      </motion.div>
    </section>
  );
}
