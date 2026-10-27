import type { Metadata } from 'next';
import { getCurrentSession } from '@/auth/session';
import { ReservationList } from '@/components/shared/ReservationList';
import { DashboardIntro } from '@/components/shared/DashboardIntro';

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
