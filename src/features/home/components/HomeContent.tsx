'use client';

import Link from 'next/link';
import { useLocale } from '@/components/shared/LocaleProvider';
import type { ActiveSpace } from '@/database/queries/spaces';
import { SpaceImage } from '@/features/spaces/components/SpaceImage';

export function HomeContent({
  isAuthenticated,
  spaces,
}: {
  isAuthenticated: boolean;
  spaces: ActiveSpace[] | null;
}) {
  const { t } = useLocale();

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
          {spaces === null ? (
            <p className="home-types__empty">{t('loadingSpaces')}</p>
          ) : spaces.length > 0 ? (
            spaces.map((space, index) => (
              <Link
                className="home-space-card"
                href={`/spaces/${space.id}`}
                key={space.id}
              >
                <SpaceImage
                  className="home-space-card__image"
                  type={space.type}
                  name={space.name}
                  width={640}
                  height={360}
                  eager={index === 0}
                />
                <div className="home-space-card__content">
                  <h3>{space.name}</h3>
                  <p>{space.description}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="home-types__empty">{t('noSpaces')}</p>
          )}
        </div>
      </section>
    </main>
  );
}
