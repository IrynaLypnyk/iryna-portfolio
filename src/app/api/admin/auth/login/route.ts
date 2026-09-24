import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Fallback на .env (опціонально), якщо немає адміна в БД
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email та пароль обов'язкові" }, { status: 400 });
    }

    let isValid = false;

    // Спочатку перевіряємо в БД
    try {
      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (admin) {
        // Якщо у адміна немає пароля (тільки Google OAuth), не дозволяємо вхід через email/password
        if (!admin.password) {
          return NextResponse.json(
            { message: 'Цей акаунт використовує Google OAuth. Будь ласка, увійдіть через Google.' },
            { status: 401 }
          );
        }
        // Перевіряємо хешований пароль
        isValid = await bcrypt.compare(password, admin.password);
      }
    } catch (dbError) {
      // Якщо помилка БД, використовуємо fallback на .env
      console.warn('Database check failed, using .env fallback:', dbError);
    }

    // Fallback на .env (якщо налаштовано), якщо адміна немає в БД або помилка БД
    if (!isValid && ADMIN_EMAIL && ADMIN_PASSWORD) {
      isValid = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    }

    if (isValid) {
      // Створюємо простий токен (в продакшені використовуйте JWT)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

      // Зберігаємо токен в cookies
      const cookieStore = await cookies();
      cookieStore.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 днів
        path: '/',
      });

      return NextResponse.json({ message: 'Успішний вхід', token });
    }

    return NextResponse.json({ message: 'Невірний email або пароль' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        message: 'Помилка сервера',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
