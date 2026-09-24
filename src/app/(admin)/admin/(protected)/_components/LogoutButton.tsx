'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { apiRoutes, routes } from '@/constants/routes';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const response = await fetch(apiRoutes.admin.auth.logout, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      router.replace(routes.admin.login);
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      setLoading(false);
    }
  };

  return (
    <AdminButton variant="ghost" onClickAction={handleLogout} disabled={loading}>
      {loading ? 'Виходимо...' : 'Вийти'}
    </AdminButton>
  );
}
