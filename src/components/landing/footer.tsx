import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xl text-white">FixouJá</span>
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
        </div>
        <p className="text-xs text-[#525252]">
          © 2026 FixouJá ⋅ Feito com <span className="text-[#22c55e]">♥</span> em Belo Horizonte
        </p>
        <div className="flex items-center gap-6 text-xs text-[#737373]">
          <Link href="/termos" className="transition-colors hover:text-white">
            Termos
          </Link>
          <Link href="/privacidade" className="transition-colors hover:text-white">
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
