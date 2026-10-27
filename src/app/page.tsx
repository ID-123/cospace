import { Suspense } from 'react';
import { Footer } from '@/components/shared/Footer';
import { HomeContent } from '@/components/shared/HomeContent';
import { Navbar } from '@/components/shared/Navbar';

export default function HomePage() {
  return (
    <div className="public-layout">
      <Suspense fallback={<header className="navbar" />}>
        <Navbar />
      </Suspense>
      <div className="public-layout__content">
        <HomeContent />
      </div>
      <Footer />
    </div>
  );
}
