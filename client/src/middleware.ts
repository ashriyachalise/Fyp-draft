import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('heavymach_token')?.value;
  const role = request.cookies.get('heavymach_role')?.value;
  const { pathname } = request.nextUrl;

  // Check if the current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  // 1. If no token and trying to access a protected route, redirect to login
  // We also check if the token is "undefined" as a string, which can happen with some client-side libs
  if ((!token || token === 'undefined' || token === '') && !isPublicRoute) {
    // If it's the root path, just redirect to login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // For other protected routes, redirect to login
    // You could potentially add a ?redirect query param here to return after login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If token exists and trying to access login, we might want to redirect to their dashboard
  // However, the user requested to keep functionality as is, and the login page handles its own redirection
  // if (token && isPublicRoute) { ... }

  // 3. Role-based internal protection
  if (token && role) {
    // Technician restricted from /shop
    if (role === 'technician' && pathname.startsWith('/shop')) {
      return NextResponse.redirect(new URL('/technician', request.url));
    }
    
    // Client restricted from /dashboard (Admin) or /technician
    if (role === 'client' && (pathname.startsWith('/dashboard') || pathname.startsWith('/technician'))) {
      return NextResponse.redirect(new URL('/shop', request.url));
    }
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
