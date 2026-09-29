import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

type ContactBody = {
  name: string;
  email: string;
  message: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function POST(request: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;

    if (!contactEmail) {
      console.error('[contact] CONTACT_EMAIL is not configured');

      return NextResponse.json(
        { success: false, error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    if (!resendApiKey) {
      console.error('[contact] RESEND_API_KEY is not configured');

      return NextResponse.json(
        { success: false, error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    const body: ContactBody = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim();
    const message = body.message?.trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');

    const { error } = await resend.emails.send({
      from: 'Iryna Lypnyk Portfolio <hello@irynalypnyk.com>',
      to: [contactEmail],
      replyTo: email,
      subject: `Portfolio contact from ${name}`,

      text: `
New portfolio message

Name: ${name}
Email: ${email}

Message:
${message}
      `.trim(),

      html: `
        <h2>New portfolio message</h2>

        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>

        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
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
