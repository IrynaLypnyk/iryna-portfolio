import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#faf9f7',
          color: '#1a1a1a',
        }}
      >
        <h1 style={{ fontSize: '4rem', fontWeight: 700, margin: 0 }}>404</h1>
        <p style={{ fontSize: '1.125rem', marginTop: '0.75rem', color: '#555' }}>Page not found</p>
        <Link
          href="/"
          style={{
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            color: '#888',
            textDecoration: 'underline',
          }}
        >
          Go home
        </Link>
      </body>
    </html>
  );
}
