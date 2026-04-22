"use client";

import { motion } from "framer-motion";

const CARDS = [
  {
    icon: "⏰",
    title: "Cliente esquece.",
    body: "Sem lembrete, 30% das pessoas simplesmente não aparecem. Cada falta é faturamento evaporando.",
  },
  {
    icon: "👻",
    title: "Ninguém confirma.",
    body: "Você manda mensagem, pergunta, espera resposta. Perde tempo correndo atrás de gente ocupada.",
  },
  {
    icon: "💸",
    title: "Você perde grana.",
    body: "Horário vago é dinheiro jogado fora. E o pior: outro cliente ficou sem atender no lugar.",
  },
];

export function Problems() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center font-serif text-5xl leading-[1.05] text-white sm:text-6xl"
        >
          Reconhece{" "}
          <em className="italic text-[#22c55e]">esses problemas</em>?
        </motion.h2>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0a] p-8 transition-colors hover:border-[rgba(34,197,94,0.25)]"
            >
              <div className="mb-6 text-5xl">{c.icon}</div>
              <h3 className="font-serif text-3xl text-white">{c.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[#a3a3a3]">{c.body}</p>
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[rgba(34,197,94,0.08)] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 text-center font-serif text-4xl italic text-white sm:text-5xl"
        >
          Acabou.
        </motion.p>
      </div>
    </section>
  );
}
