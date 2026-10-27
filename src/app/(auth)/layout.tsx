import type { ReactNode } from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/auth/session';

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Suspense fallback={<main className="auth-layout" />}>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </Suspense>
  );
}

async function AuthLayoutContent({ children }: AuthLayoutProps) {
  const session = await getCurrentSession();

  if (session) {
    redirect(session.role === 'admin' ? '/admin' : '/dashboard');
  }

  return (
    <main className="auth-layout">
      <Link href="/" className="auth-layout__brand">
        CoSpace
      </Link>
      {children}
    </main>
  );
}
