import { Suspense } from 'react';
import { getCurrentSession } from '@/features/auth/session';
import { HomeContent } from '@/features/home/components/HomeContent';
import { getActiveSpaces } from '@/database/queries/spaces';

const featuredSpaceLimit = 3;

export default function HomePage() {
  return (
    <Suspense fallback={<HomeContent isAuthenticated spaces={null} />}>
      <PersonalizedHomeContent />
    </Suspense>
  );
}

async function PersonalizedHomeContent() {
  const [session, spaces] = await Promise.all([
    getCurrentSession(),
    getActiveSpaces(featuredSpaceLimit),
  ]);
  return <HomeContent isAuthenticated={Boolean(session)} spaces={spaces} />;
}
