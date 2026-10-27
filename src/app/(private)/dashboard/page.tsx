import type { Metadata } from 'next';
import { getCurrentSession } from '@/features/auth/session';
import { ReservationList } from '@/features/reservations/components/ReservationList';
import { DashboardIntro } from '@/features/dashboard/components/DashboardIntro';

export const metadata: Metadata = {
  title: 'Mis reservas | CoSpace',
};

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const displayName = session
    ? [session.firstName, session.lastName].filter(Boolean).join(' ') || session.email
    : '';

  return (
    <main className="account-page">
      <DashboardIntro displayName={displayName} />
      <ReservationList />
    </main>
  );
}
