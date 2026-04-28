"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useInterest } from "./interest-context";

const LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#preco", label: "Preço" },
];

export function Navbar() {
  const { setOpen } = useInterest();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-1/2 top-4 z-50 w-[calc(100%-24px)] max-w-5xl -translate-x-1/2"
      >
        <div className="flex items-center justify-between gap-4 rounded-full border border-white/[0.08] bg-[rgba(10,10,10,0.6)] px-4 py-2 backdrop-blur-2xl sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="FixouJá — início">
            <span className="font-serif text-[22px] leading-none text-white">FixouJá</span>
            <span className="pulse-dot relative inline-block h-2 w-2 rounded-full bg-[#22c55e]" />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm text-[#a3a3a3] transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm text-[#a3a3a3] transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-shine rounded-full px-4 py-2 text-sm font-medium text-white"
            >
              Testar grátis
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/5 md:hidden"
          >
            <div className="relative h-3.5 w-5">
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute left-0 top-0 block h-[1.5px] w-5 bg-current"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-[6px] block h-[1.5px] w-5 bg-current"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute left-0 top-[12px] block h-[1.5px] w-5 bg-current"
              />
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#050505]/95 backdrop-blur-xl md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full flex-col items-center justify-center gap-8 px-6"
            >
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-serif text-3xl text-white"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-6 flex flex-col items-center gap-3">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm text-white"
                >
                  Entrar
                </Link>
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); setOpen(true); }}
                  className="btn-shine rounded-full px-6 py-3 text-sm font-medium text-white"
                >
                  Testar grátis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
