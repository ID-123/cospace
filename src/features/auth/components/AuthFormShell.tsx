'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { LocaleSwitcher, useLocale } from '@/components/shared/LocaleProvider';

type AuthFormShellProps = {
  mode: 'login' | 'register';
  title: string;
  eyebrow: string;
  children: ReactNode;
};

export function AuthFormShell({
  mode,
  title,
  eyebrow,
  children,
}: AuthFormShellProps) {
  const isRegister = mode === 'register';
  const { t } = useLocale();

  return (
    <section
      className={`auth-card${isRegister ? ' auth-card--register' : ''}`}
      aria-labelledby="auth-title"
    >
      <LocaleSwitcher />
      <p className="auth-card__eyebrow">{eyebrow}</p>
      <h1 id="auth-title">{title}</h1>
      {children}

      <p className="auth-card__switch">
        {isRegister ? t('alreadyAccount') : t('noAccount')}{' '}
        <Link href={isRegister ? '/login' : '/register'}>
          {isRegister ? t('signInLink') : t('createAccountLink')}
        </Link>
      </p>

      <Link href="/spaces" className="auth-card__back">
        ← {t('backExplore')}
      </Link>
    </section>
  );
}
