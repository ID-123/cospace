import Link from 'next/link';
import { getCurrentSession } from '@/auth/session';
import { NavbarLinks } from '@/components/shared/NavbarLinks';
import { SessionMenu } from '@/components/shared/SessionMenu';

export async function Navbar() {
  const session = await getCurrentSession();

  return (
    <header className="navbar">
      <Link href="/" className="navbar__brand" aria-label="CoSpace, inicio">
        CoSpace
      </Link>
      <NavbarLinks role={session?.role} />
      <SessionMenu user={session} />
    </header>
  );
}