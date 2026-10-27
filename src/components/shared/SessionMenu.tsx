import Link from 'next/link';
import { getCurrentSession } from '@/auth/session';
import { LogoutButton } from '@/components/auth/LogoutButton';

export async function SessionMenu() {
  const session = await getCurrentSession();

  if (!session) {
    return (
      <>
        <Link href="/login">Iniciar sesión</Link>
        <Link href="/register">Crear cuenta</Link>
      </>
    );
  }

  return (
    <>
      <span className="session-menu__greeting">
        Hola, <strong>{session.email}</strong>
      </span>
      <Link href={session.role === 'admin' ? '/admin' : '/dashboard'}>
        {session.role === 'admin' ? 'Administración' : 'Mis reservas'}
      </Link>
      {session.role === 'admin' ? (
        <Link href="/dashboard">Mis reservas</Link>
      ) : null}
      <LogoutButton />
    </>
  );
}
