import Link from 'next/link';

export function Navbar() {
  return (
    <header className="navbar">
      <Link href="/" className="navbar__brand" aria-label="CoSpace, inicio">
        CoSpace
      </Link>

      <nav className="navbar__links" aria-label="Navegación principal">
        <Link href="/">Inicio</Link>
        <Link href="/spaces">Espacios</Link>
      </nav>
    </header>
  );
}