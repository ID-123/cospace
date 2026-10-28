import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/session";
import { PrivateNavbar } from "@/features/dashboard/components/PrivateNavbar";
import { Footer } from "@/components/shared/Footer";
import { SkipLink } from "@/components/shared/SkipLink";

type PrivateLayoutProps = {
  children: ReactNode;
};

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <Suspense
      fallback={<main className="private-layout__loading">Cargando...</main>}
    >
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </Suspense>
  );
}

async function PrivateLayoutContent({ children }: PrivateLayoutProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="public-layout">
      <SkipLink />
      <PrivateNavbar user={session} />
      <main id="main-content" className="public-layout__content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
