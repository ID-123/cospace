'use client';

import Link from 'next/link';
import type { SessionUser } from '@/features/auth/token';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { LocaleSwitcher, ThemeSwitcher, useLocale } from '@/components/shared/LocaleProvider';

type SessionMenuProps = {
  user: SessionUser | null;
};

export function SessionMenu({ user }: SessionMenuProps) {
  const { t } = useLocale();

  if (!user) {
    return (
      <div className="navbar__actions">
        <LocaleSwitcher />
        <ThemeSwitcher />
        <Link className="navbar__action navbar__action--login" href="/login">
          {t('login')}
        </Link>
        <Link className="navbar__action navbar__action--register" href="/register">
          {t('register')}
        </Link>
      </div>
    );
  }

  const displayName = user.firstName.trim() || user.email;

  return (
    <div className="navbar__actions">
      <LocaleSwitcher />
      <ThemeSwitcher />
      <Link
        className="navbar__user"
        href="/dashboard/profile"
        title={t('editProfile')}
      >
        {t('greeting')}, {displayName}!
      </Link>
      <LogoutButton />
    </div>
  );
}
