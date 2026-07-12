import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper to verify Web Crypto HMAC signature in Next.js Edge Runtime
async function verifySession(cookieValue: string, secret: string): Promise<boolean> {
  try {
    const parts = cookieValue.split('.');
    if (parts.length !== 2) return false;
    const [value, signature] = parts;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(value)
    );
    
    // Convert signatureBuffer to base64url
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashString = hashArray.map(b => String.fromCharCode(b)).join('');
    const expectedSignature = btoa(hashString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return signature === expectedSignature;
  } catch (e) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define route exclusions (login, registration/auth API endpoints, assets, etc.)
  const isPublicPath = 
    pathname === '/login' || 
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/_next') || 
    pathname.includes('.');

  if (!isPublicPath) {
    const sessionCookie = request.cookies.get('assetflow_session');
    const secret = process.env.SESSION_SECRET || 'fallback-secret-at-least-32-chars-long-for-dev';

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const isValid = await verifySession(sessionCookie.value, secret);
    if (!isValid) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
