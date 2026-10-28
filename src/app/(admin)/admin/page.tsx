import type { Metadata } from 'next';
import { SpaceManagement } from '@/features/admin/components/SpaceManagement';
import { AdminHeading } from '@/features/admin/components/AdminHeading';

export const metadata: Metadata = {
  title: 'Administración | CoSpace',
};

export default async function AdminPage() {
  return (
    <main className="account-page admin-page">
      <AdminHeading />
      <SpaceManagement />
    </main>
  );
}
