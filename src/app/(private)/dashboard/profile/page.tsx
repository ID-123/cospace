import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/features/auth/current-user';
import { AccountSettings } from '@/features/dashboard/components/AccountSettings';

export const metadata: Metadata = {
  title: 'Mi perfil | CoSpace',
};

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');

  return (
    <main className="account-page">
      <AccountSettings
        initialProfile={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        }}
      />
    </main>
  );
}
