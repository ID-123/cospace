'use client';

import { useState } from 'react';
import { useLocale } from '@/components/shared/LocaleProvider';

type AuthResponse = {
  error?: {
    code?: string;
    message?: string;
  };
  user?: {
    role?: 'user' | 'admin';
  };
};

type AuthMode = 'login' | 'register';

export function useAuthSubmission(mode: AuthMode) {
  const { t } = useLocale();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(payload: Record<string, unknown>): Promise<void> {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as AuthResponse;
      if (!response.ok) {
        const authErrors: Record<string, string> = {
          EMAIL_IN_USE: t('emailInUse'),
          INVALID_CREDENTIALS: t('invalidCredentials'),
          INVALID_INPUT: t('invalidInput'),
          INTERNAL_ERROR: t('requestFailed'),
        };
        setErrorMessage(
          (result.error?.code ? authErrors[result.error.code] : undefined) ??
            result.error?.message ??
            t('requestFailed'),
        );
        return;
      }

      const destination =
        mode === 'login'
          ? '/'
          : result.user?.role === 'admin'
            ? '/admin'
            : '/dashboard';
      window.location.replace(destination);
    } catch {
      setErrorMessage(t('connectionError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return { errorMessage, isSubmitting, submit };
}
