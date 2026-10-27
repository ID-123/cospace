import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/auth/session';
import { PrivateNavbar } from '@/components/shared/PrivateNavbar';
import { Footer } from '@/components/shared/Footer';

type PrivateLayoutProps = {
  children: ReactNode;
};

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <Suspense fallback={<main className="private-layout__loading">Cargando...</main>}>
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </Suspense>
  );
}

async function PrivateLayoutContent({ children }: PrivateLayoutProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="public-layout">
      <PrivateNavbar user={session} />
      <div className="public-layout__content">{children}</div>
      <Footer />
    </div>
  );
}
