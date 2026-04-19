"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Calendar01Icon,
  UserGroup02Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Início", icon: Home01Icon },
  { href: "/dashboard/agendamentos", label: "Agendamentos", icon: Calendar01Icon },
  { href: "/dashboard/clientes", label: "Clientes", icon: UserGroup02Icon },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings01Icon },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar — desktop */}
      <nav className="hidden md:flex flex-col gap-1 p-3">
        {links.map(({ href, label, icon }) => {
          const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
              )}
            >
              <HugeiconsIcon icon={icon} size={18} color="currentColor" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom bar — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-neutral-200 bg-white">
        {links.map(({ href, label, icon }) => {
          const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors",
                active ? "text-neutral-900" : "text-neutral-400"
              )}
            >
              <HugeiconsIcon icon={icon} size={22} color="currentColor" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
