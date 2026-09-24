import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token');

    return NextResponse.json({
      authenticated: !!token,
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
    });
  }
}
