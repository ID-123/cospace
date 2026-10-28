import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { SkipLink } from '@/components/shared/SkipLink';

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="public-layout">
      <SkipLink />
      <Suspense fallback={<header className="navbar" />}>
        <Navbar />
      </Suspense>
      <main id="main-content" className="public-layout__content">{children}</main>
      <Footer />
    </div>
  );
}