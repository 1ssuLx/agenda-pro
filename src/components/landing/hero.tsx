"use client";

import { motion } from "framer-motion";
import { useInterest } from "./interest-context";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero() {
  const { setOpen } = useInterest();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-32 pb-20">
      <div className="hero-mesh pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
        {/* Left column */}
        <motion.div variants={container} initial="hidden" animate="show" className="relative z-10">
          <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#a3a3a3] backdrop-blur">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            Beta aberto · vagas limitadas
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-serif text-[56px] leading-[0.98] tracking-tight-sm text-white sm:text-[72px] md:text-[88px] lg:text-[96px]"
          >
            Seu cliente<br />
            esquece. A gente{" "}
            <span className="relative inline-block italic text-[#22c55e]">
              fixou
              <svg
                aria-hidden
                viewBox="0 0 220 14"
                className="wavy-accent absolute -bottom-2 left-0 w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 Q 30 0, 60 8 T 120 8 T 180 8 T 220 8"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .<br />
            Pelo WhatsApp.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-xl text-lg text-[#a3a3a3] sm:text-xl"
          >
            Agendamento com confirmação automática pelo WhatsApp. Reduza faltas,
            encha sua agenda e nunca mais perca cliente por esquecimento.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-shine inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-medium text-white shadow-[0_20px_60px_rgba(34,197,94,0.35)]"
            >
              Garantir minha vaga grátis →
            </button>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-7 py-4 text-sm text-white transition-colors hover:bg-white/5"
            >
              Ver como funciona
            </a>
          </motion.div>

          <motion.p variants={item} className="mt-6 text-xs text-[#525252]">
            ✦ 30 dias grátis · Sem cartão · Cancele quando quiser ✦
          </motion.p>
        </motion.div>

        {/* Right column — WhatsApp mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto w-full max-w-md"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="relative rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_80px_rgba(34,197,94,0.08)]"
          >
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e] text-base font-semibold text-black">
                F
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">FixouJá</p>
                <p className="text-[11px] text-[#737373]">agora mesmo · WhatsApp</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#22c55e" aria-hidden>
                <path d="M20.52 3.48A11.91 11.91 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.14 1.6 5.94L0 24l6.29-1.64A11.95 11.95 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.52zM12 22a9.9 9.9 0 01-5.06-1.38l-.36-.22-3.73.98 1-3.63-.24-.37A9.93 9.93 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10z" />
              </svg>
            </div>
            <div className="mt-4 space-y-3 text-sm text-[#d4d4d4]">
              <p>Oi Maria! 👋</p>
              <p>
                Passando pra confirmar seu horário amanhã às <strong className="text-white">14:30</strong> com a Carla.
              </p>
              <p className="text-[#737373]">Posso confirmar?</p>
              <div className="mt-4 flex gap-2">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: [0.98, 1.02, 0.98] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex-1 rounded-xl bg-[#22c55e] px-4 py-3 text-center text-sm font-medium text-black"
                >
                  ✓ Sim, confirmo
                </motion.div>
                <div className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-[#a3a3a3]">
                  Reagendar
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating notification bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -left-6 -top-6 hidden rounded-2xl border border-[rgba(34,197,94,0.25)] bg-[rgba(10,10,10,0.9)] px-4 py-3 shadow-xl backdrop-blur sm:block"
          >
            <p className="flex items-center gap-2 text-xs text-white">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              <span className="text-[#22c55e]">+1</span> cliente confirmou
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
