import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-at-least-32-chars-long-for-dev';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

function sign(value: string): string {
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
  return `${value}.${signature}`;
}

function verify(signedValue: string): string | null {
  const parts = signedValue.split('.');
  if (parts.length !== 2) return null;
  const [value, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
  if (signature === expectedSignature) {
    return value;
  }
  return null;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('assetflow_session');
  if (!sessionCookie) return null;
  try {
    const verifiedValue = verify(sessionCookie.value);
    if (!verifiedValue) return null;
    const json = Buffer.from(verifiedValue, 'base64').toString('utf-8');
    return JSON.parse(json) as UserSession;
  } catch (e) {
    return null;
  }
}

export async function setSession(user: { id: string; email: string; name: string; role: string }) {
  const cookieStore = await cookies();
  const base64 = Buffer.from(JSON.stringify(user)).toString('base64');
  const signed = sign(base64);
  cookieStore.set('assetflow_session', signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('assetflow_session');
}

