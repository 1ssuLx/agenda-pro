"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "5min", label: "pra configurar tudo" },
  { value: "24h", label: "antes, cliente é lembrado" },
  { value: "1 clique", label: "pro cliente confirmar" },
];

export function Stats() {
  return (
    <section className="relative border-y border-white/[0.06] bg-[#0a0a0a] px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-10 text-center md:grid-cols-3">
        {STATS.map((s, i) => (
          <motion.div
            key={s.value}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="font-serif text-7xl text-white sm:text-8xl">
              <em className="italic text-[#22c55e]">{s.value}</em>
            </div>
            <p className="mt-4 text-sm text-[#a3a3a3]">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
