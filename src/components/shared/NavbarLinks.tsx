'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/components/shared/LocaleProvider';

type NavbarLinksProps = {
  role?: 'user' | 'admin';
};

export function NavbarLinks({ role }: NavbarLinksProps) {
  const { t } = useLocale();
  const pathname = usePathname();
  const links = [
    { href: '/', label: t('navHome'), active: pathname === '/' },
    { href: '/spaces', label: t('navSpaces'), active: pathname.startsWith('/spaces') },
    role === 'admin'
      ? { href: '/admin', label: t('navAdmin'), active: pathname.startsWith('/admin') }
      : role === 'user'
        ? { href: '/dashboard', label: t('navReservations'), active: pathname.startsWith('/dashboard') }
        : null,
  ].filter((link): link is { href: string; label: string; active: boolean } => link !== null);

  return (
    <nav className="navbar__links" aria-label={t('navigation')}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={link.active ? 'is-active' : undefined}
          aria-current={link.active ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
