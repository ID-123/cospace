import type { Metadata } from 'next';
import { SpaceManagement } from '@/components/admin/SpaceManagement';
import { AdminHeading } from '@/components/shared/AdminHeading';

export const metadata: Metadata = {
  title: 'Administración | CoSpace',
};

export default async function AdminPage() {
  return (
    <main className="account-page">
      <AdminHeading />
      <SpaceManagement />
    </main>
  );
}
