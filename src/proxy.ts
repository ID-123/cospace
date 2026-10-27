import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, verifyAccessToken } from '@/auth/token';

function isProtectedRoute(pathname: string): boolean {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/') ||
    pathname === '/admin' || pathname.startsWith('/admin/');
}

function isAdminRoute(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isAuthRoute(pathname: string): boolean {
  return pathname === '/login' || pathname === '/register';
}

function responseWithCookies(
  response: NextResponse,
  cookieHeaders: string[],
): NextResponse {
  for (const cookie of cookieHeaders) {
    response.headers.append('Set-Cookie', cookie);
  }

  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let session = accessToken ? await verifyAccessToken(accessToken) : null;
  let refreshedCookies: string[] = [];
  let forwardedRequestHeaders: Headers | undefined;

  if (!session && refreshToken) {
    try {
      const refreshResponse = await fetch(
        new URL('/api/auth/refresh', request.url),
        {
          method: 'POST',
          headers: { cookie: `${REFRESH_COOKIE}=${refreshToken}` },
          cache: 'no-store',
        },
      );

      refreshedCookies = refreshResponse.headers.getSetCookie();

      if (refreshResponse.ok) {
        const accessCookie = refreshedCookies
          .map((cookie) => cookie.split(';', 1)[0])
          .find((cookie) => cookie.startsWith(`${ACCESS_COOKIE}=`));

        if (accessCookie) {
          const renewedAccessToken = accessCookie.slice(ACCESS_COOKIE.length + 1);
          session = await verifyAccessToken(renewedAccessToken);

          if (session) {
            const requestCookies = new Map(
              request.cookies.getAll().map(({ name, value }) => [name, value]),
            );
            requestCookies.set(ACCESS_COOKIE, renewedAccessToken);
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set(
              'cookie',
              [...requestCookies].map(([name, value]) => `${name}=${value}`).join('; '),
            );
            forwardedRequestHeaders = requestHeaders;
          }
        }
      } else if (refreshResponse.status >= 500) {
        console.error('Session refresh returned a server error.');
        return NextResponse.json(
          { error: 'No se pudo verificar la sesión.' },
          { status: 503 },
        );
      }
    } catch (error) {
      console.error('Session refresh request failed:', error);
      return NextResponse.json(
        { error: 'No se pudo verificar la sesión.' },
        { status: 503 },
      );
    }
  }

  if (isProtectedRoute(pathname) && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return responseWithCookies(
      NextResponse.redirect(loginUrl),
      refreshedCookies,
    );
  }

  if (isAdminRoute(pathname) && session?.role !== 'admin') {
    return responseWithCookies(
      NextResponse.redirect(new URL('/dashboard', request.url)),
      refreshedCookies,
    );
  }

  if (isAuthRoute(pathname) && session) {
    const destination = session.role === 'admin' ? '/admin' : '/dashboard';
    return responseWithCookies(
      NextResponse.redirect(new URL(destination, request.url)),
      refreshedCookies,
    );
  }

  return responseWithCookies(
    forwardedRequestHeaders
      ? NextResponse.next({ request: { headers: forwardedRequestHeaders } })
      : NextResponse.next(),
    refreshedCookies,
  );
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
