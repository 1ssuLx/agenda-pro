import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/confirmar(.*)",
  "/api/webhooks(.*)",
  "/api/interesse",
]);

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPlanPage = createRouteMatcher(["/dashboard/plano"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);

  // Verifica plano para rotas do dashboard (exceto a própria página do plano)
  if (isDashboardRoute(request) && !isPlanPage(request)) {
    const { userId, sessionClaims } = await auth();

    if (userId) {
      const meta = sessionClaims?.publicMetadata as
        | { plano?: string; trialTerminaEm?: string }
        | undefined;

      if (meta?.plano !== undefined) {
        const planoAtivo =
          meta.plano === "pago" ||
          (meta.plano === "trial" &&
            !!meta.trialTerminaEm &&
            new Date(meta.trialTerminaEm) > new Date());

        if (!planoAtivo) {
          return NextResponse.redirect(new URL("/dashboard/plano", request.url));
        }
      }
      // Se meta.plano === undefined, o webhook ainda não processou — deixa passar
    }
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
