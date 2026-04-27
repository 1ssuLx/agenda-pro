"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TZ = "America/Sao_Paulo";

type TenantData = {
  plano: string;
  trialTerminaEm: string | null;
};

export default function TrialBanner() {
  const [tenant, setTenant] = useState<TenantData | null>(null);

  useEffect(() => {
    fetch("/api/tenant")
      .then((r) => r.json())
      .then((data) => setTenant({ plano: data.plano, trialTerminaEm: data.trialTerminaEm }))
      .catch(() => {});
  }, []);

  if (!tenant) return null;

  const { plano, trialTerminaEm } = tenant;

  if (plano === "pago") return null;

  if (plano === "inadimplente") {
    return (
      <Banner variant="red">
        <span>Pagamento recusado. Atualize seu cartão para continuar usando o FixouJá.</span>
        <BannerLink href="/dashboard/plano">Atualizar pagamento</BannerLink>
      </Banner>
    );
  }

  if (plano === "cancelado") {
    return (
      <Banner variant="red">
        <span>Sua assinatura foi cancelada. Assine novamente para recuperar o acesso.</span>
        <BannerLink href="/dashboard/plano">Assinar agora</BannerLink>
      </Banner>
    );
  }

  if (plano === "trial" && trialTerminaEm) {
    const termina = toZonedTime(parseISO(trialTerminaEm), TZ);
    const hoje = toZonedTime(new Date(), TZ);
    const dias = differenceInDays(termina, hoje);

    if (dias < 0) {
      return (
        <Banner variant="red">
          <span>Seu trial expirou. Assine para continuar usando o FixouJá.</span>
          <BannerLink href="/dashboard/plano">Assinar agora</BannerLink>
        </Banner>
      );
    }

    return (
      <Banner variant="amber">
        <span>
          Seu período gratuito termina em{" "}
          <strong>{dias} dia{dias !== 1 ? "s" : ""}</strong>. Assine agora para não perder o acesso.
        </span>
        <BannerLink href="/dashboard/plano">Assinar — R$ 99,90/mês</BannerLink>
      </Banner>
    );
  }

  return null;
}

function Banner({
  variant,
  children,
}: {
  variant: "amber" | "red";
  children: React.ReactNode;
}) {
  const cls =
    variant === "amber"
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : "bg-red-50 border-red-200 text-red-800";

  return (
    <div className={`border-b px-4 py-2.5 text-sm ${cls}`}>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        {children}
      </div>
    </div>
  );
}

function BannerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-md bg-current/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-current/20"
    >
      {children}
    </Link>
  );
}
