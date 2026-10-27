import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { LocaleProvider } from '@/components/shared/LocaleProvider';

export async function RequestLocaleProvider({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const initialLocale = cookieStore.get('cospace_locale')?.value === 'en' ? 'en' : 'es';

  return (
    <LocaleProvider initialLocale={initialLocale}>
      {children}
    </LocaleProvider>
  );
}
