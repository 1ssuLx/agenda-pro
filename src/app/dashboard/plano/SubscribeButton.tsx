"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full sm:w-auto"
    >
      {loading ? "Redirecionando…" : "Assinar agora — R$ 99,90/mês"}
    </Button>
  );
}
