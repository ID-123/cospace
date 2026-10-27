'use client';

import { useLocale } from '@/components/shared/LocaleProvider';

export function DashboardIntro({ displayName }: { displayName: string }) {
  const { t } = useLocale();

  return (
    <>
      <p className="home-section-eyebrow">{t('accountEyebrow')}</p>
      <h1>{t('reservationsTitle')}</h1>
      <p>
        {t('greeting')}, {displayName}. {t('reservationsIntro')}
      </p>
    </>
  );
}
