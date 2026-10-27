import Link from 'next/link';
import { LogoutButton } from '@/components/auth/LogoutButton';
import type { SessionUser } from '@/auth/token';

type PrivateNavbarProps = {
  user: SessionUser;
  admin?: boolean;
};

export function PrivateNavbar({ user, admin = false }: PrivateNavbarProps) {
  return (
    <header className="navbar">
      <Link href="/" className="navbar__brand" aria-label="CoSpace, inicio">
        CoSpace
      </Link>
      <nav className="navbar__links" aria-label="Navegación de usuario">
        <Link href="/spaces">Espacios</Link>
        <Link href="/dashboard">Mis reservas</Link>
        {admin ? <Link href="/admin">Administración</Link> : null}
        <span className="session-menu__greeting">
          <strong>{user.email}</strong>
        </span>
        <LogoutButton />
      </nav>
    </header>
  );
}
