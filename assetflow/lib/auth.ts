import { cookies } from 'next/headers';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('assetflow_session');
  if (!sessionCookie) return null;
  try {
    const json = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    return JSON.parse(json) as UserSession;
  } catch (e) {
    return null;
  }
}

export async function setSession(user: { id: string; email: string; name: string; role: string }) {
  const cookieStore = await cookies();
  const base64 = Buffer.from(JSON.stringify(user)).toString('base64');
  cookieStore.set('assetflow_session', base64, {
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
