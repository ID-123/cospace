'use client';

import { useLocale } from '@/components/shared/LocaleProvider';

export function SkipLink() {
  const { t } = useLocale();

  return (
    <a className="skip-link" href="#main-content">
      {t('skipToContent')}
    </a>
  );
}
