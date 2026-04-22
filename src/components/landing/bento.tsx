"use client";

import { motion } from "framer-motion";

function Card({
  className = "",
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0a] p-8 transition-all duration-300 hover:border-[rgba(34,197,94,0.3)] hover:shadow-[0_0_60px_rgba(34,197,94,0.1)] ${className}`}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-px rounded-3xl bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.12),transparent_70%)]" />
      </div>
    </motion.div>
  );
}

export function Bento() {
  return (
    <section id="beneficios" className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center font-serif text-5xl leading-[1.05] text-white sm:text-6xl"
        >
          Tudo que você precisa.{" "}
          <em className="italic text-[#22c55e]">Nada que você não.</em>
        </motion.h2>

        <div className="mt-20 grid gap-5 md:grid-cols-6 md:grid-rows-[auto_auto]">
          {/* Big WhatsApp feature */}
          <Card className="md:col-span-4">
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-widest text-[#22c55e]">
                Coração do produto
              </div>
              <h3 className="mt-3 font-serif text-3xl text-white sm:text-4xl">
                Lembrete automático no WhatsApp.
              </h3>
              <p className="mt-3 max-w-lg text-[15px] text-[#a3a3a3]">
                Mensagem personalizada com nome, serviço e horário — enviada
                sozinha 24h antes. Cliente confirma em 1 toque.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.08)] px-3 py-1.5 text-xs text-[#22c55e]">
                <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                Economia média: 12h por semana
              </div>
            </div>
          </Card>

          {/* Stats card */}
          <Card className="md:col-span-2" delay={0.1}>
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="text-xs uppercase tracking-widest text-[#737373]">
                Faltas
              </div>
              <div>
                <div className="font-serif text-6xl text-white">-70%</div>
                <p className="mt-2 text-sm text-[#a3a3a3]">
                  menos no-show desde o primeiro mês.
                </p>
              </div>
            </div>
          </Card>

          {/* 3 smaller */}
          <Card className="md:col-span-2" delay={0.15}>
            <div className="text-2xl">📅</div>
            <h3 className="mt-4 font-serif text-2xl text-white">
              Agenda em tempo real.
            </h3>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              Confirmado, vago, reagendado — tudo colorido e claro. Sem
              abrir 4 abas.
            </p>
          </Card>

          <Card className="md:col-span-2" delay={0.2}>
            <div className="text-2xl">✍️</div>
            <h3 className="mt-4 font-serif text-2xl text-white">
              Mensagem do seu jeito.
            </h3>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              Personalize o texto do lembrete com o tom da sua marca. Variáveis
              prontas: <code className="text-[#22c55e]">{"{nome}"}</code>,{" "}
              <code className="text-[#22c55e]">{"{servico}"}</code>.
            </p>
          </Card>

          <Card className="md:col-span-2" delay={0.25}>
            <div className="text-2xl">👥</div>
            <h3 className="mt-4 font-serif text-2xl text-white">
              Múltiplos profissionais.
            </h3>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              Gerencie a agenda de todo mundo da equipe num lugar só. Cada um
              com seu horário.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
