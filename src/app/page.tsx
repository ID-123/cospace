import Link from 'next/link';
import { Suspense } from 'react';
import { Footer } from '@/components/shared/Footer';
import { Navbar } from '@/components/shared/Navbar';

const spaceTypes = [
  {
    name: 'Escritorios',
    description: 'Un lugar cómodo para concentrarte y avanzar.',
    number: '01',
  },
  {
    name: 'Salas de reuniones',
    description: 'Espacios para compartir ideas y trabajar en equipo.',
    number: '02',
  },
  {
    name: 'Cabinas',
    description: 'Privacidad y calma para tus llamadas y tareas.',
    number: '03',
  },
];

export default function HomePage() {
  return (
    <div className="public-layout">
      <Suspense fallback={<header className="navbar" />}>
        <Navbar />
      </Suspense>
      <div className="public-layout__content">
        <main className="home-page">
          <section className="home-hero" aria-labelledby="home-title">
            <div className="home-hero__content">
              <p className="home-hero__eyebrow">TU PRÓXIMA IDEA EMPIEZA AQUÍ</p>
              <h1 id="home-title">
                Encuentra tu lugar
                <br />
                <span>para crear.</span>
              </h1>
              <p className="home-hero__description">
                Espacios de coworking pensados para concentrarte, colaborar y
                hacer que las cosas sucedan. Reserva por horas, a tu manera.
              </p>
              <div className="home-hero__actions">
                <Link
                  className="home-button home-button--primary"
                  href="/spaces"
                >
                  Explorar espacios
                </Link>
                <Link
                  className="home-button home-button--secondary"
                  href="/register"
                >
                  Crear una cuenta
                </Link>
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
              <p className="home-hero__visual-note">
                UN ESPACIO PARA CADA MOMENTO
              </p>
            </div>
          </section>

          <section className="home-types" aria-labelledby="home-types-title">
            <div className="home-types__heading">
              <div>
                <p className="home-section-eyebrow">ENCUENTRA TU RITMO</p>
                <h2 id="home-types-title">Un espacio para cada idea</h2>
              </div>
              <Link href="/spaces" className="home-types__link">
                Ver todos los espacios <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="home-types__grid">
              {spaceTypes.map((space) => (
                <article className="home-type-card" key={space.number}>
                  <span className="home-type-card__number">
                    {space.number}
                  </span>
                  <h3>{space.name}</h3>
                  <p>{space.description}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}