import type { Metadata } from 'next';
import { getCurrentSession } from '@/auth/session';

export const metadata: Metadata = {
  title: 'Mis reservas | CoSpace',
};

export default async function DashboardPage() {
  const session = await getCurrentSession();

  return (
    <main className="account-page">
      <p className="home-section-eyebrow">TU CUENTA</p>
      <h1>Mis reservas</h1>
      <p>Hola, {session?.email}. Aquí podrás consultar y gestionar tus reservas.</p>
      <p className="account-page__empty">
        Todavía no tienes reservas. Explora los espacios disponibles para
        encontrar el ideal para ti.
      </p>
    </main>
  );
}
