"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Você cria o agendamento",
    body: "Em 10 segundos, pelo celular ou computador. Cliente, serviço, horário. Pronto.",
    mock: (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="text-xs text-[#737373]">Novo agendamento</div>
        <div className="mt-3 space-y-2">
          <div className="h-2.5 w-3/4 rounded bg-white/10" />
          <div className="h-2.5 w-1/2 rounded bg-white/10" />
          <div className="mt-3 h-9 w-full rounded-lg bg-[#22c55e]/90" />
        </div>
      </div>
    ),
  },
  {
    n: "02",
    title: "A gente envia no WhatsApp",
    body: "24h antes do horário, o cliente recebe uma mensagem no WhatsApp. Automático. Sem você mexer um dedo.",
    mock: (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-[#22c55e]" />
          <div className="flex-1 rounded-2xl rounded-tl-none bg-white/5 p-3">
            <div className="h-2 w-full rounded bg-white/10" />
            <div className="mt-2 h-2 w-2/3 rounded bg-white/10" />
          </div>
        </div>
      </div>
    ),
  },
  {
    n: "03",
    title: "Cliente confirma com 1 clique",
    body: "Ele aperta ✓ Sim, confirmo — ou pede pra reagendar. Tudo no WhatsApp. Sem baixar app, sem senha.",
    mock: (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl bg-[#22c55e] py-3 text-center text-xs font-medium text-black">
            ✓ Confirmar
          </div>
          <div className="flex-1 rounded-xl border border-white/10 py-3 text-center text-xs text-[#a3a3a3]">
            Reagendar
          </div>
        </div>
      </div>
    ),
  },
  {
    n: "04",
    title: "Sua agenda enche sozinha",
    body: "Horário confirmado aparece verde. Vago, some. Você vê tudo num painel simples — e fatura mais.",
    mock: (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className={`h-8 rounded ${
                [0, 2, 3, 5, 6].includes(i) ? "bg-[#22c55e]/80" : "bg-white/5"
              }`}
            />
          ))}
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center font-serif text-5xl leading-[1.05] text-white sm:text-6xl"
        >
          <em className="italic text-[#22c55e]">Como</em> funciona.
        </motion.h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[#a3a3a3]">
          Quatro passos. Nenhuma planilha. Zero estresse.
        </p>

        <div className="mt-24 flex flex-col gap-28">
          {STEPS.map((s, i) => {
            const reverse = i % 2 === 1;
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`grid items-center gap-10 md:grid-cols-2 md:gap-20 ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <div className="font-serif text-[120px] leading-none text-[rgba(34,197,94,0.2)] sm:text-[160px]">
                    {s.n}
                  </div>
                  <h3 className="mt-2 font-serif text-4xl text-white sm:text-5xl">
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#a3a3a3]">
                    {s.body}
                  </p>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[rgba(34,197,94,0.08)] blur-3xl" />
                  <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                    {s.mock}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
