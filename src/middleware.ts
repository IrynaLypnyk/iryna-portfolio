import { routes } from '@/constants/routes';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Редірект з локалізованих адмін-роутів на адмін-роути без локалі
  if (pathname.match(new RegExp(`^/(uk|en)${routes.admin.root}`))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(uk|en)/, '');
    return NextResponse.redirect(url);
  }

  // Адмін-роути не повинні оброблятися intl middleware
  if (pathname.startsWith(routes.admin.root)) {
    // Перевірка аутентифікації для адмін-роутів
    if (!pathname.startsWith(routes.admin.login)) {
      const token = request.cookies.get('admin-token');

      if (!token) {
        const url = request.nextUrl.clone();
        url.pathname = routes.admin.login;
        return NextResponse.redirect(url);
      }
    }

    // Якщо користувач вже залогінений і намагається зайти на сторінку логіну, перенаправляємо на головну
    if (pathname === routes.admin.login) {
      const token = request.cookies.get('admin-token');

      if (token) {
        const url = request.nextUrl.clone();
        url.pathname = routes.admin.root;
        return NextResponse.redirect(url);
      }
    }

    // Пропускаємо intl middleware для адмін-роутів
    return NextResponse.next();
  }

  // Застосовуємо intl middleware для інших роутів
  // next-intl middleware вже оптимізований для статичних сторінок
  return intlMiddleware(request);
}

export const config = {
  // Next.js requires literal matchers for static analysis at build time.
  matcher: [
    '/',
    '/(uk|en)/:path*',
    '/admin/:path*',
    '/(uk|en)/admin/:path*', // Додаємо локалізовані адмін-роути
  ],
};
