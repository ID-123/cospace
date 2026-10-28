import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const locale = (await cookies()).get('cospace_locale')?.value === 'en' ? 'en' : 'es';
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return { locale, messages };
});
