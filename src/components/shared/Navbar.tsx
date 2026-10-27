import Link from 'next/link';
import { Suspense } from 'react';
import { SessionMenu } from '@/components/shared/SessionMenu';

export function Navbar() {
  return (
    <header className="navbar">
      <Link href="/" className="navbar__brand" aria-label="CoSpace, inicio">
        CoSpace
      </Link>

      <nav className="navbar__links" aria-label="Navegación principal">
        <Link href="/">Inicio</Link>
        <Link href="/spaces">Espacios</Link>
        <Suspense fallback={<Link href="/login">Iniciar sesión</Link>}>
          <SessionMenu />
        </Suspense>
      </nav>
    </header>
  );
}