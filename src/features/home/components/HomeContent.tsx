'use client';

import Link from 'next/link';
import { useLocale } from '@/components/shared/LocaleProvider';

export function HomeContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { t } = useLocale();
  const spaceTypes = [
    {
      name: t('homeSpaceDesk'),
      description: t('homeSpaceDeskDescription'),
      number: '01',
    },
    {
      name: t('homeSpaceMeeting'),
      description: t('homeSpaceMeetingDescription'),
      number: '02',
    },
    {
      name: t('homeSpaceBooth'),
      description: t('homeSpaceBoothDescription'),
      number: '03',
    },
  ];

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">{t('homeEyebrow')}</p>
          <h1 id="home-title">
            {t('homeTitle')}
            <br />
            <span>{t('homeTitleAccent')}</span>
          </h1>
          <p className="home-hero__description">{t('homeDescription')}</p>
          <div className="home-hero__actions">
            <Link className="home-button home-button--primary" href="/spaces">
              {t('exploreSpaces')}
            </Link>
            {!isAuthenticated ? (
              <Link className="home-button home-button--secondary" href="/register">
                {t('createAccount')}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="home-hero__visual" aria-hidden="true">
          <div className="home-hero__sun" />
          <div className="home-hero__desk">
            <div className="home-hero__lamp" />
            <div className="home-hero__plant">
              <span />
              <span />
              <span />
            </div>
            <div className="home-hero__mug" />
          </div>
          <p className="home-hero__visual-note">{t('homeVisualNote')}</p>
        </div>
      </section>

      <section className="home-types" aria-labelledby="home-types-title">
        <div className="home-types__heading">
          <div>
            <p className="home-section-eyebrow">{t('homeSectionEyebrow')}</p>
            <h2 id="home-types-title">{t('homeSectionTitle')}</h2>
          </div>
          <Link href="/spaces" className="home-types__link">
            {t('seeAllSpaces')} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="home-types__grid">
          {spaceTypes.map((space) => (
            <article className="home-type-card" key={space.number}>
              <span className="home-type-card__number">{space.number}</span>
              <h3>{space.name}</h3>
              <p>{space.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
