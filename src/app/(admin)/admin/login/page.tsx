'use client';
import { LoginForm } from './_components/LoginForm';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Suspense } from 'react';

const MotionLoginForm = motion.create(LoginForm);

export default function LoginPage() {
  return (
    <Suspense>
      <div className="flex min-h-screen flex-col items-center bg-neutral-50">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(#1C1917 1px, transparent 1px), linear-gradient(90deg, #1C1917 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Top bar */}
        <header className="relative z-10 flex w-full items-center justify-between border-b border-neutral-200 px-6 py-6 sm:px-10 lg:px-16">
          <div className="text-[10px] font-bold tracking-[0.5em] text-neutral-500 uppercase">
            COMPANY_SHORT_NAME
          </div>
          <Link
            href="/"
            className="text-[10px] font-bold tracking-[0.4em] text-neutral-500 uppercase transition-colors duration-300 hover:text-neutral-900"
          >
            ← На сайт
          </Link>
        </header>
        <main className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-12">
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
