'use client';

import { useLocale } from '@/components/shared/LocaleProvider';

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="footer">
      <p>© 2026 CoSpace.</p>
      <p>{t('footerTagline')}</p>
    </footer>
  );
}