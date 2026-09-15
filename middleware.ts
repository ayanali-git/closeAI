import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authCookieOptions } from '@/lib/auth-cookie';

export async function middleware(request: NextRequest) {
  // Skip middleware overhead for prefetch requests to prevent race conditions
  if (request.headers.get('x-middleware-prefetch') === '1' || request.headers.get('purpose') === 'prefetch') {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: authCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect /chat to /c
  if (request.nextUrl.pathname === '/chat') {
    return NextResponse.redirect(new URL('/c', request.url));
  }

  // Purge any corrupted or bloated base64 data:image cookies
  const allCookies = request.cookies.getAll();
  allCookies.forEach(c => {
    if (c.value.length > 3000 && (c.value.includes('data%3Aimage') || c.value.includes('data:image'))) {
      response.cookies.delete(c.name);
    }
  });

  // If already logged in, redirect away from auth pages to /c (unless error param is present)
  const authPaths = ['/auth/login', '/auth/signup'];
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname === path);
  const hasAuthError = request.nextUrl.searchParams.has('error') || request.nextUrl.searchParams.has('error_code');
  if (isAuthPath && user && !hasAuthError) {
    const redirectRes = NextResponse.redirect(new URL('/c', request.url));
    response.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value));
    return redirectRes;
  }

  // Protected routes
  const protectedPaths = ['/c', '/settings', '/upgrade'];
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );

  if (isProtected && !user) {
    const redirectRes = NextResponse.redirect(new URL('/auth/login', request.url));
    return redirectRes;
  }

  return response;
}

export const config = {
  matcher: ['/c', '/c/:path*', '/chat', '/settings', '/settings/:path*', '/upgrade', '/upgrade/:path*', '/auth/login', '/auth/signup'],
};

