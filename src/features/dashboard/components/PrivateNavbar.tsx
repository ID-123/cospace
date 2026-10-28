import type { SessionUser } from '@/features/auth/token';
import { NavbarLinks } from '@/components/shared/NavbarLinks';
import { NavbarShell } from '@/components/shared/NavbarShell';
import { SessionMenu } from '@/features/dashboard/components/SessionMenu';

type PrivateNavbarProps = {
  user: SessionUser;
  admin?: boolean;
};

export function PrivateNavbar({ user, admin = false }: PrivateNavbarProps) {
  return (
    <NavbarShell>
      <NavbarLinks role={admin ? 'admin' : user.role} />
      <SessionMenu user={user} />
    </NavbarShell>
  );
}
