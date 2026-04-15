import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes
  const isPublicRoute = pathname === '/login';

  // 1. If no token and trying to access a protected route, redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If token exists and trying to access login, redirect to appropriate home
  if (token && isPublicRoute) {
    if (role === 'client') {
      return NextResponse.redirect(new URL('/shop', request.url));
    } else if (role === 'technician') {
      return NextResponse.redirect(new URL('/technician', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. (Optional) Role-based internal protection
  // If a technician tries to access /shop, you might want to redirect them to /technician
  if (token && role === 'technician' && pathname.startsWith('/shop')) {
    return NextResponse.redirect(new URL('/technician', request.url));
  }
  
  // If a client tries to access /dashboard or /technician, redirect to /shop
  if (token && role === 'client' && (pathname.startsWith('/dashboard') || pathname.startsWith('/technician'))) {
    return NextResponse.redirect(new URL('/shop', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (api routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
