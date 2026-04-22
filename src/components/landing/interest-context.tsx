"use client";

import { createContext, useContext, useState } from "react";

type InterestContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const InterestContext = createContext<InterestContextValue | null>(null);

export function InterestProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <InterestContext.Provider value={{ open, setOpen }}>
      {children}
    </InterestContext.Provider>
  );
}

export function useInterest() {
  const ctx = useContext(InterestContext);
  if (!ctx) throw new Error("useInterest deve ser usado dentro de InterestProvider");
  return ctx;
}
