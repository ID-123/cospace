import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/auth/session';
import { PrivateNavbar } from '@/components/shared/PrivateNavbar';
import { Footer } from '@/components/shared/Footer';

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense fallback={<main className="private-layout__loading">Cargando...</main>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

async function AdminLayoutContent({ children }: AdminLayoutProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="public-layout">
      <PrivateNavbar user={session} admin />
      <div className="public-layout__content">{children}</div>
      <Footer />
    </div>
  );
}
