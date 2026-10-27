'use client';

import Link from 'next/link';
import type { SessionUser } from '@/auth/token';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { LocaleSwitcher, useLocale } from '@/components/shared/LocaleProvider';

type SessionMenuProps = {
  user: SessionUser | null;
};

export function SessionMenu({ user }: SessionMenuProps) {
  const { t } = useLocale();

  if (!user) {
    return (
      <div className="navbar__actions">
        <LocaleSwitcher />
        <Link className="navbar__action navbar__action--login" href="/login">
          {t('login')}
        </Link>
        <Link className="navbar__action navbar__action--register" href="/register">
          {t('register')}
        </Link>
      </div>
    );
  }

  const displayName =
    [user.firstName].filter(Boolean).join(' ').trim();

  return (
    <div className="navbar__actions">
      <LocaleSwitcher />
      <span className="navbar__user" title={displayName}>
        Hola, {displayName}!
      </span>
      <LogoutButton />
    </div>
  );
}
