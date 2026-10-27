import type { Metadata } from 'next';
import { getCurrentSession } from '@/auth/session';

export const metadata: Metadata = {
  title: 'Administración | CoSpace',
};

export default async function AdminPage() {
  const session = await getCurrentSession();

  return (
    <main className="account-page">
      <p className="home-section-eyebrow">PANEL DE ADMINISTRACIÓN</p>
      <h1>Gestión de espacios</h1>
      <p>Sesión iniciada como {session?.email}.</p>
      <p className="account-page__empty">
        Aquí podrás crear, editar y administrar el catálogo de espacios.
      </p>
    </main>
  );
}
