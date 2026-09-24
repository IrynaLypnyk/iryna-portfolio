import { apiRoutes } from '@/constants/routes';
import { NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${apiRoutes.admin.auth.googleCallback}`;

export async function GET() {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ message: 'Google OAuth не налаштовано' }, { status: 500 });
  }

  // Генеруємо state для захисту від CSRF
  const state = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');

  // Формуємо URL для Google OAuth
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  }).toString()}`;

  // Зберігаємо state в cookie
  const response = NextResponse.redirect(authUrl);
  response.cookies.set('oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 хвилин
    path: '/',
  });

  return response;
}
