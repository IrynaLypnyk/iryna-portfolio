# Iryna Lypnyk Portfolio Website

My personal portfolio website showcasing my professional experience, selected projects, experiments and current work as a software developer.

**Live site:** [irynalypnyk.com](https://irynalypnyk.com)  
**Storybook:** [https://irynalypnyk-storybook.vercel.app/](https://irynalypnyk-storybook.vercel.app/)

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- ImageKit
- next-intl
- Google OAuth
- Storybook
- Vercel

## Project structure

- `src/app/(site)` — public website routes
- `src/app/(admin)` — admin panel routes
- `src/app/api/admin` — admin API routes
- `src/components` — shared UI components
- `src/lib` — utilities, data access, auth helpers and shared logic
- `prisma` — database schema, migrations and seed logic
- `public` — static assets

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

[http://localhost:3000](http://localhost:3000)

## Environment variables

Create `.env.local` and configure the required values:

```env
DATABASE_URL=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

NEXT_PUBLIC_APP_URL=
ALLOWED_ADMIN_EMAILS=
```

Do not commit `.env.local`.

## Database

Generate the Prisma client:

```bash
npx prisma generate
```

Run migrations in development:

```bash
npx prisma migrate dev
```

Apply migrations in production:

```bash
npx prisma migrate deploy
```

Optional seed command, if configured:

```bash
npx prisma db seed
```

## Deployment

The website and Storybook are deployed on Vercel.

Production environment variables must be configured in the corresponding Vercel project settings.

## Documentation

Project-specific notes and technical references are kept in `docs/`.
