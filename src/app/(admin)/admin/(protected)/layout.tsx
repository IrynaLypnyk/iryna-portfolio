import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { AdminNav } from '@/app/(admin)/admin/(protected)/_components/AdminNav';
import { routes } from '@/constants/routes';
import { UnsavedChangesProvider } from './_components/UnsavedChangesProvider';

export const dynamic = 'force-dynamic';

type Props = {
  children: React.ReactNode;
};

/**
 * Shared layout for all authenticated admin sections. Centralizes the
 * `requireAuth` redirect (previously duplicated in every admin page) and
 * renders the persistent admin navigation.
 */
export default async function ProtectedAdminLayout({ children }: Props) {
  try {
    await requireAuth();
  } catch {
    redirect(routes.admin.login);
  }

  return (
    <UnsavedChangesProvider>
      <div className="min-h-screen">
        <AdminNav />
        {children}
      </div>
    </UnsavedChangesProvider>
  );
}
