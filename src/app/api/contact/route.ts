import { NextRequest, NextResponse } from 'next/server';

type ContactBody = {
  name: string;
  email: string;
  message: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactBody = await request.json();
    const { name, email, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    // TODO: wire up email delivery (e.g. Resend, Nodemailer) or store in DB here
    console.info('[contact] submission received', { name, email });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[contact] handler error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
