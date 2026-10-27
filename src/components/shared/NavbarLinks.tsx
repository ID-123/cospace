'use client';

import Link from 'next/link';
import { useLocale } from '@/components/shared/LocaleProvider';

type NavbarLinksProps = {
  role?: 'user' | 'admin';
};

export function NavbarLinks({ role }: NavbarLinksProps) {
  const { t } = useLocale();

  return (
    <nav className="navbar__links" aria-label={t('navigation')}>
      <Link href="/">{t('navHome')}</Link>
      <Link href="/spaces">{t('navSpaces')}</Link>
      {role === 'admin' ? (
        <Link href="/admin">{t('navAdmin')}</Link>
      ) : role === 'user' ? (
        <Link href="/dashboard">{t('navReservations')}</Link>
      ) : null}
    </nav>
  );
}
