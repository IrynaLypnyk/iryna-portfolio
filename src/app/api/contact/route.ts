import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const { error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: [process.env.CONTACT_EMAIL!],
      replyTo: email.trim(),
      subject: `Portfolio contact from ${name.trim()}`,
      html: `
        <h2>New portfolio message</h2>

        <p><strong>Name:</strong> ${name.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>

        <p><strong>Message:</strong></p>
        <p>${message.trim()}</p>
      `,
    });

    if (error) {
      console.error('[contact] resend error', error);

      return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[contact] handler error', error);

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
