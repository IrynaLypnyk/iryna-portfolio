import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Успішний вихід' });

    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        message: 'Помилка сервера',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
