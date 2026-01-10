import { auth } from '@/lib/auth';
import { loginRateLimiter, rateLimitConfig } from '@/lib/security/login-rate-limit';
import { NextResponse, type NextRequest } from 'next/server';

const getIpAddress = (req: NextRequest) =>
  req.ip ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';

const getEmailFromRequest = async (req: NextRequest) => {
  if (req.method !== 'POST') {
    return null;
  }

  try {
    const formData = await req.clone().formData();
    const email = formData.get('email');
    return typeof email === 'string' ? email : null;
  } catch {
    return null;
  }
};

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  if (pathname.startsWith('/api/auth')) {
    const ipAddress = getIpAddress(req);
    const email = await getEmailFromRequest(req);
    const status = loginRateLimiter.checkStatus({ ip: ipAddress, email });

    if (status.locked) {
      const retryAfterSeconds = status.lockedUntil
        ? Math.max(Math.ceil((status.lockedUntil - Date.now()) / 1000), 1)
        : Math.ceil(rateLimitConfig.lockoutMs / 1000);

      return NextResponse.json(
        { error: 'Too many login attempts. Please wait before trying again.' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfterSeconds.toString(),
          },
        },
      );
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from login/register
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
