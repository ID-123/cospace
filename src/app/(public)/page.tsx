import { Suspense } from 'react';
import { getCurrentSession } from '@/features/auth/session';
import { HomeContent } from '@/features/home/components/HomeContent';

export default function HomePage() {
  return (
    <Suspense fallback={<HomeContent isAuthenticated />}>
      <PersonalizedHomeContent />
    </Suspense>
  );
}

async function PersonalizedHomeContent() {
  const session = await getCurrentSession();
  return <HomeContent isAuthenticated={Boolean(session)} />;
}
