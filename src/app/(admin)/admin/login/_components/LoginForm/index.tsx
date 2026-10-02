'use client';

import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { AdminInput } from '@/app/(admin)/admin/(protected)/_components/AdminInput';
import { LogIn } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiRoutes, routes } from '@/constants/routes';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
      router.replace(routes.admin.login);
    }
  }, [searchParams, router]);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = apiRoutes.admin.auth.google;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(apiRoutes.admin.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка входу');
      }

      toast.success('Успішний вхід');
      window.location.href = routes.admin.root;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Помилка входу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <LogIn className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold uppercase">Вхід в адмін-панель</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
          >
            Email
          </label>
          <AdminInput
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="admin@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
          >
            Пароль
          </label>
          <AdminInput
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <AdminButton type="submit" className="mt-6 w-full" disabled={isLoading || isGoogleLoading}>
          {isLoading ? 'Вхід...' : 'Увійти'}
        </AdminButton>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">
          або
        </span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <AdminButton
        type="button"
        variant="outline"
        className="w-full"
        onClickAction={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          'Завантаження...'
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Увійти через Google
          </>
        )}
      </AdminButton>
    </div>
  );
}
