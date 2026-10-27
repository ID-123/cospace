import Link from 'next/link';
import type { SessionUser } from '@/auth/token';
import { NavbarLinks } from '@/components/shared/NavbarLinks';
import { SessionMenu } from '@/components/shared/SessionMenu';

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
      <NavbarLinks role={admin ? 'admin' : user.role} />
      <SessionMenu user={user} />
    </header>
  );
}
