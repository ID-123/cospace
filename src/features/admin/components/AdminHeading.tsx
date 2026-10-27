'use client';

import { useLocale } from '@/components/shared/LocaleProvider';

export function AdminHeading() {
  const { t } = useLocale();

  return (
    <>
      <p className="home-section-eyebrow">{t('adminEyebrow')}</p>
      <h1>{t('spaceManagement')}</h1>
    </>
  );
}
