import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import SidebarNav from "@/components/dashboard/SidebarNav";
import TrialBanner from "./_components/TrialBanner";
import PhoneBanner from "./_components/PhoneBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) redirect("/sign-in");

  const profissional = await prisma.profissional.findFirst({
    where: { email },
    include: { tenant: true },
  });

  if (!profissional) redirect("/sign-in");

  const { tenant } = profissional;

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isOnboarding = pathname.startsWith("/dashboard/onboarding");

  if (!tenant.onboardingCompleted && !isOnboarding) {
    redirect("/dashboard/onboarding");
  }

  const tenantNome = tenant.nome;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-neutral-200 bg-white px-4">
        <span className="font-semibold text-neutral-900">{tenantNome}</span>
      </header>

      <TrialBanner />
      <PhoneBanner />

      <div className="flex flex-1">
        <div className="hidden md:flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-white">
          <SidebarNav />
        </div>

        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      <div className="md:hidden">
        <SidebarNav />
      </div>
    </div>
  );
}
