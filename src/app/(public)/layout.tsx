import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="public-layout">
      <Suspense fallback={<header className="navbar" />}>
        <Navbar />
      </Suspense>
      <div className="public-layout__content">{children}</div>
      <Footer />
    </div>
  );
}