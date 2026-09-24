import { prisma } from '@/lib/prisma';
import { OAuth2Client } from 'google-auth-library';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { apiRoutes, routes } from '@/constants/routes';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${apiRoutes.admin.auth.googleCallback}`;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function redirectToLogin(error: string) {
  const url = new URL(routes.admin.login, BASE_URL);
  url.searchParams.set('error', error);

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return redirectToLogin('Помилка авторизації Google');
    }

    if (!code || !state) {
      return redirectToLogin('Відсутній код авторизації');
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return redirectToLogin('Google OAuth не налаштовано');
    }
    // Перевіряємо state для захисту від CSRF
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth-state')?.value;

    if (!storedState || storedState !== state) {
      return redirectToLogin('Невірний state параметр');
    }

    // Видаляємо state cookie
    cookieStore.delete('oauth-state');

    // Обмінюємо код на токен
    const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.id_token) {
      console.error('No ID token received from Google');
      return redirectToLogin('Не вдалося отримати токен від Google');
    }

    oauth2Client.setCredentials(tokens);

    // Отримуємо інформацію про користувача
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return redirectToLogin('Не вдалося отримати дані користувача');
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return redirectToLogin('Email не надано');
    }

    // Перевірка дозволених email (якщо налаштовано)
    const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS;
    if (allowedEmails) {
      const allowedEmailsList = allowedEmails.split(',').map((e) => e.trim().toLowerCase());
      if (!allowedEmailsList.includes(email.toLowerCase())) {
        return redirectToLogin(
          `${encodeURIComponent('Доступ заборонено. Ваш email не в списку дозволених адмінів.')}`
        );
      }
    }

    // Перевіряємо чи існує адмін з таким email або googleId
    let admin = await prisma.admin.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });

    if (admin) {
      // Оновлюємо дані адміна
      admin = await prisma.admin.update({
        where: { id: admin.id },
        data: {
          email,
          googleId,
          name: name || admin.name,
          image: picture || admin.image,
        },
      });
    } else {
      // Створюємо нового адміна
      admin = await prisma.admin.create({
        data: {
          email,
          googleId,
          name: name || null,
          image: picture || null,
        },
      });
    }

    // Створюємо токен для сесії
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    // Зберігаємо токен в cookies
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = new URL(routes.admin.root, baseUrl);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 днів
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return redirectToLogin(`Помилка авторизації Google: ${errorMessage}`);
  }
}
