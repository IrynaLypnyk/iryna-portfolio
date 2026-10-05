'use client';
import { LoginForm } from './_components/LoginForm';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { OpenSiteButton } from '@/app/(admin)/admin/_components/OpenSiteButton';
import { routes } from '@/constants/routes';

const MotionLoginForm = motion.create(LoginForm);

export default function LoginPage() {
  return (
    <Suspense>
      <div className="bg-app-page/60 text-app-text flex min-h-screen flex-col">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(#1C1917 1px, transparent 1px), linear-gradient(90deg, #1C1917 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <Header
          title={
            <span className="flex flex-wrap items-baseline gap-1 md:gap-2.5">
              <span className="text-app-text text-[18px] leading-5 font-medium">Admin</span>
            </span>
          }
          nav={<div className="hidden md:block" />}
          rightContent={<OpenSiteButton />}
          logoHref={routes.admin.login}
          headerClass="border-app-line bg-app-page text-app-text sticky top-0 z-20 border-b"
        />
        <main className="z-25 flex flex-1 items-center justify-center px-4 py-12">
          <MotionLoginForm
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          />
        </main>
      </div>
    </Suspense>
  );
}
