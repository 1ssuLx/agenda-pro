import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const APP_URL = "https://fixouja.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "FixouJá — Agendamento com confirmação automática pelo WhatsApp",
  description:
    "Reduza faltas e confirme presença dos seus clientes automaticamente pelo WhatsApp. Simples, rápido e sem complicação.",
  openGraph: {
    title: "FixouJá — Agendamento com confirmação automática pelo WhatsApp",
    description:
      "Reduza faltas e confirme presença dos seus clientes automaticamente pelo WhatsApp. Simples, rápido e sem complicação.",
    url: APP_URL,
    siteName: "FixouJá",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FixouJá — Agendamento com confirmação automática pelo WhatsApp",
    description:
      "Reduza faltas e confirme presença dos seus clientes automaticamente pelo WhatsApp.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="pt-BR"
        className={cn(
          "h-full",
          "antialiased",
          geistSans.variable,
          geistMono.variable,
          figtree.variable,
          instrumentSerif.variable,
          "font-sans"
        )}
      >
        <body className="min-h-full flex flex-col bg-[#050505] text-[#fafafa]">
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-right" theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}
